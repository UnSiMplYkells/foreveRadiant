import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "orders@foreverradiant.com";

interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
  size?: string | number;
  image?: string;
}

interface EmailRequest {
  email: string;
  fullName?: string;
  orderId?: string;
  totalPrice?: number | string;
  shippingAddress?: string;
  subject?: string;
  message?: string;
  order_items?: OrderItem[];
}

function generateReceiptHtml({
  fullName,
  orderId,
  totalPrice,
  shippingAddress,
  message,
  order_items = [],
}: EmailRequest): string {
  const itemsRows = order_items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 12px 8px; font-family: sans-serif; font-size: 14px; color: #333333;">
          <strong>${item.name}</strong>
          ${item.size ? `<span style="color: #888888; font-size: 12px;"> (${item.size}ml)</span>` : ""}
        </td>
        <td style="padding: 12px 8px; font-family: sans-serif; font-size: 14px; color: #555555; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; font-family: sans-serif; font-size: 14px; color: #333333; text-align: right; font-weight: 600;">
          ${item.price ? `₦${(item.price * item.quantity).toLocaleString()}` : "-"}
        </td>
      </tr>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="background-color: #f8f8f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="background-color: #4b1010; color: #ffffff; padding: 24px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1.5px; text-transform: uppercase;">Forever Radiant</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #f0f0f0;">Order Receipt & Confirmation</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="font-size: 18px; color: #222222; margin-top: 0;">Hello ${fullName || "Valued Customer"},</h2>
            <p style="font-size: 14px; color: #555555; line-height: 1.6;">
              ${message || "Thank you for shopping with Forever Radiant! Your order has been paid and confirmed."}
            </p>

            <div style="background: #fafafa; border-radius: 6px; padding: 15px 20px; margin: 20px 0;">
              <p style="margin: 4px 0; font-size: 13px; color: #666666;">
                <strong>Order Reference:</strong> <span style="font-family: monospace; color: #111111;">${orderId || "N/A"}</span>
              </p>
              ${shippingAddress ? `<p style="margin: 4px 0; font-size: 13px; color: #666666;"><strong>Shipping Address:</strong> ${shippingAddress}</p>` : ""}
            </div>

            <h3 style="font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #444444; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">Order Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="border-bottom: 2px solid #dddddd; background: #fafafa;">
                  <th style="padding: 8px; text-align: left; font-size: 12px; color: #666666; text-transform: uppercase;">Item</th>
                  <th style="padding: 8px; text-align: center; font-size: 12px; color: #666666; text-transform: uppercase;">Qty</th>
                  <th style="padding: 8px; text-align: right; font-size: 12px; color: #666666; text-transform: uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows || '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #888;">Items processing</td></tr>'}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #eeeeee;">
              <span style="font-size: 16px; font-weight: 700; color: #222222;">Total Paid: ₦${Number(totalPrice || 0).toLocaleString()}</span>
            </div>

            <p style="font-size: 13px; color: #777777; margin-top: 30px; line-height: 1.5;">
              If you have any questions regarding your order, reply directly to this email or contact our support team.
            </p>
          </div>

          <div style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #999999;">
            &copy; ${new Date().getFullYear()} Forever Radiant Inc. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const payload: EmailRequest = await req.json();

    if (!payload.email) {
      return new Response(JSON.stringify({ error: "Missing recipient email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailSubject = payload.subject || `Forever Radiant - Order Confirmation #${payload.orderId || ""}`;
    const emailHtml = generateReceiptHtml(payload);

    let result: any = null;

    // Send via Resend if API key is provided
    if (RESEND_API_KEY) {
      const resend = new Resend(RESEND_API_KEY);
      result = await resend.emails.send({
        from: SENDER_EMAIL,
        to: payload.email,
        subject: emailSubject,
        html: emailHtml,
      });
    } 
    // Or send via SendGrid if SendGrid API key is provided
    else if (SENDGRID_API_KEY) {
      const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.email }] }],
          from: { email: SENDER_EMAIL, name: "Forever Radiant" },
          subject: emailSubject,
          content: [{ type: "text/html", value: emailHtml }],
        }),
      });

      if (!sgResponse.ok) {
        const errorText = await sgResponse.text();
        throw new Error(`SendGrid failed: ${errorText}`);
      }
      result = { success: true, provider: "sendgrid" };
    } 
    // Fallback in dev environment
    else {
      console.log(`[DEV MODE] Simulated email sent to ${payload.email} for order ${payload.orderId}`);
      result = { simulated: true, to: payload.email, orderId: payload.orderId };
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Email dispatch failed" }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
