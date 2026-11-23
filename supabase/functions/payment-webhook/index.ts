import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
const FLUTTERWAVE_SECRET_HASH = Deno.env.get("FLUTTERWAVE_SECRET_HASH") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Helper: Verify Paystack HMAC-SHA512 Signature
async function verifyPaystackSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!PAYSTACK_SECRET_KEY || !signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(PAYSTACK_SECRET_KEY),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hashHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex === signature;
}

// Helper: Verify Stripe HMAC-SHA256 Signature
async function verifyStripeSignature(rawBody: string, header: string | null): Promise<boolean> {
  if (!STRIPE_WEBHOOK_SECRET || !header) return false;
  const parts = header.split(",");
  let timestamp = "";
  const signatures: string[] = [];

  for (const part of parts) {
    const [k, v] = part.trim().split("=");
    if (k === "t") timestamp = v;
    if (k === "v1") signatures.push(v);
  }

  if (!timestamp || signatures.length === 0) return false;

  const payload = `${timestamp}.${rawBody}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computedHash = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatures.includes(computedHash);
}

// Helper: Verify Flutterwave Secret Hash
function verifyFlutterwaveSignature(header: string | null): boolean {
  if (!FLUTTERWAVE_SECRET_HASH || !header) return false;
  return header === FLUTTERWAVE_SECRET_HASH;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paystackSig = req.headers.get("x-paystack-signature");
    const stripeSig = req.headers.get("stripe-signature");
    const flwSig = req.headers.get("verif-hash");

    let provider = "unknown";
    let idempotencyKey = "";
    let eventType = "";
    let orderId = "";
    let isSuccess = false;

    // 1. Detect Provider & Verify Cryptographic Signature
    if (paystackSig) {
      provider = "paystack";
      const isValid = await verifyPaystackSignature(rawBody, paystackSig);
      if (!isValid && PAYSTACK_SECRET_KEY) {
        return new Response(JSON.stringify({ error: "Invalid Paystack signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      eventType = body?.event || "charge.success";
      idempotencyKey = `paystack_${body?.data?.id || body?.data?.reference}`;
      orderId = body?.data?.metadata?.order_id || body?.data?.reference;
      isSuccess = eventType === "charge.success" && body?.data?.status === "success";

    } else if (stripeSig) {
      provider = "stripe";
      const isValid = await verifyStripeSignature(rawBody, stripeSig);
      if (!isValid && STRIPE_WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: "Invalid Stripe signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      eventType = body?.type || "checkout.session.completed";
      idempotencyKey = `stripe_${body?.id}`;
      orderId = body?.data?.object?.metadata?.order_id || body?.data?.object?.client_reference_id;
      isSuccess = (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded");

    } else if (flwSig || body?.event === "charge.completed" || body?.data?.tx_ref) {
      provider = "flutterwave";
      if (FLUTTERWAVE_SECRET_HASH) {
        const isValid = verifyFlutterwaveSignature(flwSig);
        if (!isValid) {
          return new Response(JSON.stringify({ error: "Invalid Flutterwave secret hash" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      eventType = body?.event || "charge.completed";
      idempotencyKey = `flw_${body?.data?.id || body?.data?.tx_ref}`;
      orderId = body?.data?.tx_ref || body?.data?.meta?.order_id;
      isSuccess = body?.data?.status === "successful";

    } else {
      return new Response(JSON.stringify({ error: "Unrecognized payment provider header" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!idempotencyKey) {
      return new Response(JSON.stringify({ error: "Missing event identifier for idempotency" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. If the payment was not successful, acknowledge receipt without updating order
    if (!isSuccess) {
      return new Response(
        JSON.stringify({ received: true, ignored: true, message: `Event ${eventType} is not a successful charge` }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch items belonging to this order to perform atomic inventory deduction
    let orderItemsPayload: { product_id: number; quantity: number }[] = [];
    if (orderId) {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, product_quantity")
        .eq("order_id", orderId);

      if (!itemsError && items && items.length > 0) {
        orderItemsPayload = items.map((i: any) => ({
          product_id: i.product_id,
          quantity: i.product_quantity,
        }));
      }
    }

    // 4. Atomic Execution via RPC: Idempotency Record + Concurrency-Safe Stock Lock & Decrement
    const { data: rpcResult, error: rpcError } = await supabase.rpc("handle_payment_webhook", {
      p_idempotency_key: idempotencyKey,
      p_provider: provider,
      p_event_type: eventType,
      p_order_id: orderId,
      p_payload: body,
      p_items: orderItemsPayload,
    });

    if (rpcError) {
      console.error("RPC Error in handle_payment_webhook:", rpcError);
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If duplicate event detected by idempotency key
    if (rpcResult?.duplicate) {
      return new Response(
        JSON.stringify({
          received: true,
          duplicate: true,
          message: "Idempotency key matched. Event was already processed.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        received: true,
        success: true,
        order_id: orderId,
        message: "Order confirmed and inventory decremented atomically.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Unhandled webhook error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
