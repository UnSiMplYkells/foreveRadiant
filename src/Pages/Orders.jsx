import { useUser } from "../Features/Authentication/useUser";
import { useOrderItems } from "../Features/Order/useOrderItem";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import toast from "react-hot-toast";
import { useCheckout } from "../Hooks/useCheckout";
import styled from "styled-components";
import { useState } from "react";
/* Preserved for local sandbox/key override debugging if VITE_FLUTTERWAVE_KEY is unset:
import {
  FaCreditCard,
  FaKey,
  FaExclamationTriangle,
  FaTimes,
  FaCheckCircle,
  FaFlask,
} from "react-icons/fa";
*/

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  
  select{
    outline: none;
    border: none;
    padding: 10px 12px;
  }
`
const MenuHeading = styled.h2`
  font-weight: 500;
  text-transform: uppercase;

  span {
    font-weight: 700;
  }
`
const Wrapper = styled.div`
  width: 100%;
  padding: 15px 0 0 15px;

  display: grid;
  column-gap: 15px; // Adds spacing between grid items
  row-gap: 30px; 

  // Default: 1 column for screens below 900px
  grid-template-columns: repeat(1, 1fr);

  // 2 columns for screens between 900px and 1280px
  @media (min-width: 900px) and (max-width: 1280px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // 3 columns for screens between 1280px and 1440px
  @media (min-width: 1280px) and (max-width: 1440px) {
    grid-template-columns: repeat(3, 1fr);
  }

  // 4 columns for screens 1440px and above
  @media (min-width: 1440px) {
    grid-template-columns: repeat(3, 1fr);
  }
`
const Order = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  background-color: var(--bg-surface-soft, whitesmoke);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 15px;
`
const OrderDetails = styled.div`
  h5{
    color: grey;
    font-size: 1.3rem;
    @media(max-width: 450px){
      font-size: .86rem;
    }
  }

  p{
    font-weight: 500;
  }
`
const Status = styled.div`
  display: flex;
  gap: 10px;
  div{
    display: flex;
    align-items: center;
    gap: 5px;
  }
`
const StatusIcon = styled.div`
  background-color: red;
  width: 10px;  
  height: 10px;
  border-radius: 100%;
`
const StatusIconPaid = styled.div`
  background-color: green;
  width: 10px;  
  height: 10px;
  border-radius: 100%;
`
const Items = styled.ul`
  padding-left: 15px;
  list-style-type: upper-roman;
  
`
const OrderItems = styled.li`
  display: flex;
  gap: 20px; 
  text-transform: capitalize;
`
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`
const Button = styled.button`
  font-weight: 600;
  padding: 10px 30px;
  margin-top: 10PX;
  text-transform: uppercase;
  color: white;
  background-color: brown;
  outline: none;
  border:none;

  transition: all .25s ease-in;

  &:hover{
    background-color: rgb(75, 16, 16);
    transform: scale(1.05);
    border-radius: 2px;
  }
`

export default function Orders() {
  const { orderItems } = useOrderItems();
  const { user } = useUser();
  const fullName = user?.user_metadata?.fullName || user?.user_metadata?.full_name || "Valued Customer";
  const userEmail = user?.email;
  const { executeCheckout } = useCheckout();
  const [sorted, setSorted] = useState("");

  if (orderItems?.length === 0) return <p>No orders found. Try ordering some items.</p>;

  function handleSorted(e) {
    setSorted(e.target.value);
  }

  function isOrderPaid(order) {
    if (order.is_paid === true) return true;
    if (String(order.payment_status || "").toLowerCase() === "paid") return true;
    const s = String(order.status || "").toLowerCase();
    return ["paid", "processing", "shipped", "delivered"].includes(s);
  }

  const filteredOrders = orderItems?.filter((order) => {
    const paid = isOrderPaid(order);
    if (sorted === "all" || !sorted) return true;
    if (sorted === "Paid") return paid;
    if (sorted === "Not paid") return !paid;
    return true;
  });

  return (
    <>
      <Header>
        <MenuHeading>Your <span>Orders_</span> </MenuHeading>
        <select onChange={handleSorted} name="sort by status">
          <option value="all">All</option>
          <option value="Paid">Paid</option>
          <option value="Not paid">Not paid</option>
        </select>
      </Header>

      <Wrapper>
        {filteredOrders?.map((order, index) => (
          <Order key={order.id}>
            <OrderDetails>
              <h3>Order #{index + 1}</h3>
              <h5>Order ID: {order.order_id}</h5> 
              <p>Total Price: ₦{order.total_price}</p>
              {order.promo_code && Number(order.discount_amount) > 0 && (
                <p style={{ color: "#16a34a", fontSize: "1.2rem" }}>
                  Promo Applied: {order.promo_code} (-₦{Number(order.discount_amount).toLocaleString()})
                </p>
              )}
              <Status>
                <p>Payment:</p> 
                <div>
                  {isOrderPaid(order) ? (
                    <>
                      <StatusIconPaid />
                      <p style={{ color: "#16a34a", fontWeight: 700 }}>Paid</p>
                    </>
                  ) : (
                    <>
                      <StatusIcon />
                      <p style={{ color: "#dc2626", fontWeight: 700 }}>Awaiting Payment</p>
                    </>
                  )}
                </div>
              </Status>
              <Status>
                <p>Fulfillment:</p> 
                <div>
                  <p style={{ textTransform: "capitalize", fontWeight: 600 }}>
                    {order.status === "not paid" ? "Pending" : (order.status || "Pending")}
                  </p>
                </div>
              </Status>
            </OrderDetails>
            <div>
              <h4>Items:</h4>
              <Items>
                {order.order_items.map((item) => (
                  <OrderItem key={item.id} item={item} />
                ))}
              </Items>
            </div>
            <ButtonWrapper>
              {!isOrderPaid(order) ? (
                <PayOrderButton
                  order={order}
                  userEmail={userEmail}
                  fullName={fullName}
                  executeCheckout={executeCheckout}
                />
              ) : null}
            </ButtonWrapper>
          </Order>
        ))}
      </Wrapper>
    </>
  );
}

/* Preserved Sandbox / Custom Key Override Modal Styles (commented out since VITE_FLUTTERWAVE_KEY is configured in deployment)
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalBox = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalIn 0.25s ease;

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-surface-soft, #f9fafb);

  .title-group {
    h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    p {
      margin: 2px 0 0;
      font-size: 0.84rem;
      color: var(--color-grey-500, #6b7280);
    }
  }

  button {
    background: transparent;
    border: none;
    color: var(--color-grey-500, #9ca3af);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      color: var(--text-primary, #111827);
      background: var(--color-grey-200, #e5e7eb);
    }
  }
`;

const ModalBody = styled.div`
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const NoticeAlert = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  gap: 10px;
  align-items: flex-start;

  svg {
    color: #dc2626;
    font-size: 1.2rem;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .text {
    font-size: 0.84rem;
    color: #991b1b;
    line-height: 1.45;

    strong {
      display: block;
      margin-bottom: 2px;
    }
  }
`;

const SectionOption = styled.div`
  background: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--color-grey-500, #6b7280);
    line-height: 1.4;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 6px;
    font-size: 0.85rem;
    background: var(--bg-card, #ffffff);
    color: var(--text-primary, #111827);
    outline: none;

    &:focus {
      border-color: var(--color-brown, #7c2d12);
    }
  }
`;

const PrimaryActionBtn = styled.button`
  background: var(--color-brown, #7c2d12);
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #5c200c;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SandboxActionBtn = styled.button`
  background: #047857;
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #065f46;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
*/

function PayOrderButton({ order, userEmail, fullName, executeCheckout }) {
  // Direct Flutterwave integration using deployment environment public key
  const config = {
    public_key: (import.meta.env.VITE_FLUTTERWAVE_KEY || "").trim(),
    tx_ref: `${order?.order_id || "fr"}-${Date.now()}`,
    amount: Number(order?.total_price) || 0,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: userEmail || "customer@foreverradiant.com",
      phone_number: order?.contact || "08000000000",
      name: fullName || "Valued Customer",
    },
    customizations: {
      title: "Forever Radiant Inc.",
      description: "Payment for ordered items",
      logo: "https://dncqfwbhphbhudkwerlt.supabase.co/storage/v1/object/public/ui-images/logo1.png",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  function handlePayNow() {
    if (!config.public_key) {
      toast.error("Payment gateway key is not configured.");
      return;
    }

    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        if (response.status === "completed" || response.status === "successful") {
          await executeCheckout({
            orderId: order?.order_id,
            items: order?.order_items || [],
          });
        }
      },
      onClose: () => {
        toast("Payment cancelled");
      },
    });
  }

  return (
    <Button onClick={handlePayNow}>
      Pay with Flutterwave
    </Button>
  );

  /* Preserved custom key override & sandbox modal flow (commented out per user instruction):
  const envKey = import.meta.env.VITE_FLUTTERWAVE_KEY || "";
  const [customKey, setCustomKey] = useState(() => {
    return localStorage.getItem("FLUTTERWAVE_PUBLIC_KEY") || "";
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const effectiveKey = customKey || (envKey !== "FLWPUBK_TEST-SANDBOX" ? envKey : "");
  const isKeyConfigured = Boolean(
    effectiveKey &&
    effectiveKey.startsWith("FLWPUBK") &&
    effectiveKey !== "FLWPUBK_TEST-SANDBOX" &&
    effectiveKey.length > 20
  );

  const dynamicConfig = {
    public_key: isKeyConfigured ? effectiveKey : "FLWPUBK_TEST-DUMMY",
    tx_ref: Date.now(),
    amount: order?.total_price,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: userEmail || "customer@foreverradiant.com",
      phone_number: order?.contact || "08000000000",
      name: fullName || "Valued Customer",
    },
    customizations: {
      title: "Forever Radiant Inc.",
      description: "Payment for ordered items",
      logo: "https://dncqfwbhphbhudkwerlt.supabase.co/storage/v1/object/public/ui-images/logo1.png",
    },
  };

  const handleFlutterPayment = useFlutterwave(dynamicConfig);

  function triggerFlutterPayment() {
    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        if (response.status === "completed" || response.status === "successful") {
          await executeCheckout({
            orderId: order?.order_id,
            items: order?.order_items || [],
          });
        }
      },
      onClose: () => {
        toast("Payment cancelled");
      },
    });
  }

  function handleMainButtonClick() {
    if (!isKeyConfigured) {
      setIsModalOpen(true);
      return;
    }
    triggerFlutterPayment();
  }

  function handleSaveKeyAndPay(e) {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith("FLWPUBK")) {
      toast.error("Invalid key format. Flutterwave public keys start with FLWPUBK_TEST- or FLWPUBK-");
      return;
    }
    localStorage.setItem("FLUTTERWAVE_PUBLIC_KEY", trimmed);
    setCustomKey(trimmed);
    setIsModalOpen(false);
    toast.success("Flutterwave public key saved! Launching payment...");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  async function handleSimulateSandbox() {
    setIsSimulating(true);
    try {
      await executeCheckout({
        orderId: order?.order_id,
        items: order?.order_items || [],
      });
      setIsModalOpen(false);
      toast.success("Sandbox payment verified! Order marked as paid.");
    } catch (err) {
      toast.error(err.message || "Could not complete sandbox payment");
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <Button onClick={handleMainButtonClick}>
          Pay with FlutterWAVE
        </Button>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: "none",
            border: "none",
            fontSize: "0.78rem",
            color: isKeyConfigured ? "var(--color-grey-500, #6b7280)" : "#dc2626",
            cursor: "pointer",
            textDecoration: "underline",
            fontWeight: 500,
          }}
        >
          {isKeyConfigured ? "Payment Gateway Settings" : "Key Required / Sandbox Test Mode"}
        </button>
      </div>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div className="title-group">
                <h3>
                  <FaCreditCard style={{ color: "#d97706" }} /> Flutterwave Payment Gateway
                </h3>
                <p>Order #{order?.order_id} • ₦{Number(order?.total_price || 0).toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <FaTimes />
              </button>
            </ModalHeader>

            <ModalBody>
              {!isKeyConfigured && (
                <NoticeAlert>
                  <FaExclamationTriangle />
                  <div className="text">
                    <strong>Invalid parameter (<code>PBFPubKey</code>)</strong>
                    Flutterwave rejected the payment session because the environment key is set to a placeholder (<code>FLWPUBK_TEST-SANDBOX</code>).
                  </div>
                </NoticeAlert>
              )}

              <SectionOption>
                <h4>
                  <FaKey style={{ color: "#d97706" }} /> Option 1: Connect Your Flutterwave Key
                </h4>
                <p>
                  Paste your Test or Live Public Key from your{" "}
                  <a
                    href="https://dashboard.flutterwave.com/settings/apis"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--color-brown, #7c2d12)", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Flutterwave Dashboard &rarr; Settings &rarr; API Keys
                  </a>
                </p>
                <form onSubmit={handleSaveKeyAndPay} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="e.g. FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx-X"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                  />
                  <PrimaryActionBtn type="submit">
                    <FaCheckCircle /> Save Key &amp; Pay
                  </PrimaryActionBtn>
                </form>
              </SectionOption>

              <SectionOption style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>
                <h4 style={{ color: "#065f46" }}>
                  <FaFlask style={{ color: "#059669" }} /> Option 2: Instant Test Mode (Sandbox)
                </h4>
                <p style={{ color: "#047857" }}>
                  Simulate a verified payment without an active Flutterwave merchant key. This verifies payment in the database, decrements inventory, and marks the order as paid!
                </p>
                <SandboxActionBtn
                  type="button"
                  disabled={isSimulating}
                  onClick={handleSimulateSandbox}
                >
                  {isSimulating ? "Verifying..." : "Simulate Test Payment (Sandbox) ✓"}
                </SandboxActionBtn>
              </SectionOption>
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
    </>
  );
  */
} 

function OrderItem({ item }) {
  return(
    <OrderItems>
      <p>{item.product_name}</p>
      <p> Quantity: {item.product_quantity}</p>
      <p>Price: ₦{item.product_price } </p>
      <p>Size: {item.product_size_ml ? (String(item.product_size_ml).endsWith("ml") || String(item.product_size_ml).endsWith("g") ? item.product_size_ml : `${item.product_size_ml}ml`) : "-"}</p>
    </OrderItems>
  )
}