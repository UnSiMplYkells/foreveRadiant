import { useState, useMemo } from "react";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaSearch,
  FaShoppingBag,
  FaLock,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import { useAllOrders } from "../../Hooks/useAllOrders";
import { useUpdateOrderStatus } from "../../Features/Order/useUpdateOrderStatus";
import Loader from "../../ui/Loader";

const OrdersPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InsightCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
`;

const InsightCard = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) => props.$accent || "#7c2d12"};
  }

  .card-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-grey-500, #6b7280);
    margin-bottom: 6px;

    svg {
      font-size: 1rem;
      color: ${(props) => props.$accent || "#7c2d12"};
    }
  }

  .card-value {
    font-size: 1.6rem;
    font-weight: 800;
    color: ${(props) => props.$valColor || "var(--text-primary, #111827)"};
    margin: 0;
  }

  .card-sub {
    margin-top: 4px;
    font-size: 0.76rem;
    color: var(--color-grey-500, #9ca3af);
  }
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const TabButton = styled.button`
  background: ${(props) => (props.$active ? "var(--color-brown, #7c2d12)" : "var(--bg-surface-soft, #f3f4f6)")};
  color: ${(props) => (props.$active ? "#ffffff" : "var(--text-primary, #4b5563)")};
  border: 1px solid ${(props) => (props.$active ? "var(--color-brown, #7c2d12)" : "var(--border-color, #e5e7eb)")};
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#5c200c" : "var(--color-grey-200, #e5e7eb)")};
  }
`;

const TabBadge = styled.span`
  background: ${(props) =>
    props.$active
      ? "rgba(255, 255, 255, 0.25)"
      : props.$alert
      ? "#fee2e2"
      : "var(--color-grey-300, #d1d5db)"};
  color: ${(props) => (props.$active ? "#ffffff" : props.$alert ? "#b91c1c" : "#1f2937")};
  padding: 1px 6px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface-soft, #f9fafb);
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  padding: 6px 12px;
  min-width: 260px;

  svg {
    color: var(--color-grey-400, #9ca3af);
    font-size: 0.9rem;
  }

  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.88rem;
    color: var(--text-primary, #111827);
    width: 100%;

    &::placeholder {
      color: var(--color-grey-400, #9ca3af);
    }
  }
`;

const TableContainer = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background: var(--bg-surface-soft, #f9fafb);
    padding: 14px 16px;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-grey-600, #4b5563);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color, #f3f4f6);
    vertical-align: middle;
    font-size: 0.88rem;
    color: var(--text-primary, #1f2937);
  }

  tr:hover {
    background: var(--bg-surface-soft, #f9fafb);
  }
`;

const StatusPipelineCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 230px;
`;

const PipelineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) => props.$bg || "#f3f4f6"};
  color: ${(props) => props.$color || "#374151"};
  border: 1px solid ${(props) => props.$border || "transparent"};
`;

const PaymentPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${(props) => (props.$paid ? "#dcfce7" : "#fee2e2")};
  color: ${(props) => (props.$paid ? "#15803d" : "#b91c1c")};
  border: 1px solid ${(props) => (props.$paid ? "#86efac" : "#fca5a5")};
`;

const StatusSelect = styled.select`
  padding: 4px 8px;
  border-radius: 5px;
  border: 1px solid var(--border-color, #d1d5db);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #111827);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: var(--color-brown, #7c2d12);
  }

  option:disabled {
    color: #9ca3af;
    background: #f3f4f6;
  }
`;

const AdvanceStatusBtn = styled.button`
  background: ${(props) => props.$bg || "var(--color-brown, #7c2d12)"};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UnpaidWarningBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: #fff7ed;
  border: 1px solid #ffedd5;
  border-left: 3px solid #ea580c;
  border-radius: 6px;

  .warning-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #c2410c;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const VerifyPaymentBtn = styled.button`
  background: #ea580c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #c2410c;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function AdminOrders() {
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { orders = [], isLoading: isOrdersLoading } = useAllOrders();
  const {
    updateOrderStatus,
    isUpdating: isUpdatingStatus,
    confirmPayment,
    isConfirming: isConfirmingPayment,
  } = useUpdateOrderStatus();

  // Helper to determine if an order is paid
  function isOrderPaid(o) {
    if (o.is_paid === true) return true;
    if (String(o.payment_status || "").toLowerCase() === "paid") return true;
    const status = String(o.status || "").toLowerCase();
    return ["paid", "shipped", "delivered"].includes(status);
  }

  // Status mapping for pipeline
  function getOrderStatusDetails(status, isPaid) {
    const s = String(status || "pending").toLowerCase();
    switch (s) {
      case "not paid":
      case "pending":
        if (!isPaid) {
          return {
            label: "Payment Pending",
            bg: "#fee2e2",
            color: "#991b1b",
            border: "#fca5a5",
            nextStatus: null, // Locked until paid!
            nextLabel: null,
            actionBg: null,
          };
        }
        return {
          label: "Paid / Queue",
          bg: "#fef9c3",
          color: "#854d0e",
          border: "#fde047",
          nextStatus: "processing",
          nextLabel: "Mark Processing →",
          actionBg: "#c2410c",
        };
      case "paid":
      case "processing":
        return {
          label: "Processing",
          bg: "#ffedd5",
          color: "#c2410c",
          border: "#fed7aa",
          nextStatus: "shipped",
          nextLabel: "Mark Shipped →",
          actionBg: "#0284c7",
        };
      case "shipped":
        return {
          label: "Shipped",
          bg: "#e0f2fe",
          color: "#0369a1",
          border: "#bae6fd",
          nextStatus: "delivered",
          nextLabel: "Mark Delivered ✓",
          actionBg: "#16a34a",
        };
      case "delivered":
        return {
          label: "Delivered",
          bg: "#dcfce7",
          color: "#15803d",
          border: "#bbf7d0",
          nextStatus: null,
          nextLabel: null,
          actionBg: null,
        };
      default:
        return {
          label: status,
          bg: "#f3f4f6",
          color: "#374151",
          border: "#e5e7eb",
          nextStatus: isPaid ? "processing" : null,
          nextLabel: isPaid ? "Start Processing" : null,
          actionBg: "#6b7280",
        };
    }
  }

  function handleStatusPipelineUpdate(order, targetStatus) {
    const isPaid = isOrderPaid(order);
    if (!isPaid && (targetStatus === "shipped" || targetStatus === "delivered")) {
      window.alert(
        `Action Blocked: Order #${order.order_id || order.id} has NOT been paid! You cannot ship or fulfill unpaid orders.`
      );
      return;
    }

    updateOrderStatus({
      orderId: order.order_id || order.id,
      newStatus: targetStatus,
    });
  }

  function handleConfirmManualPayment(order) {
    const amount = Number(order.total_price || 0).toLocaleString();
    const confirmed = window.confirm(
      `Confirm Payment for Order #${order.order_id || order.id}?\n\n` +
      `Customer: ${order.full_name || "Valued Customer"}\n` +
      `Amount: ₦${amount}\n\n` +
      `Confirming verifies that payment has been received (via bank transfer, cash, or POS) and unlocks the fulfillment pipeline.`
    );

    if (confirmed) {
      confirmPayment({
        orderId: order.order_id || order.id,
        paymentMethod: "manual_verified_by_admin",
      });
    }
  }

  // Calculate counts for insight cards and tabs
  const unpaidOrders = orders.filter((o) => !isOrderPaid(o));
  const processingCount = orders.filter((o) => {
    const s = String(o.status || "").toLowerCase();
    return s === "processing" || s === "paid";
  }).length;
  const shippedCount = orders.filter((o) => String(o.status || "").toLowerCase() === "shipped").length;
  const deliveredCount = orders.filter((o) => String(o.status || "").toLowerCase() === "delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const isPaid = isOrderPaid(o);
      const status = String(o.status || "pending").toLowerCase();

      if (selectedStatusTab === "unpaid") {
        if (isPaid) return false;
      } else if (selectedStatusTab === "processing") {
        if (status !== "processing" && status !== "paid") return false;
      } else if (selectedStatusTab === "shipped") {
        if (status !== "shipped") return false;
      } else if (selectedStatusTab === "delivered") {
        if (status !== "delivered") return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const refMatch = String(o.order_id || "").toLowerCase().includes(query);
        const nameMatch = String(o.full_name || "").toLowerCase().includes(query);
        const emailMatch = String(o.email || "").toLowerCase().includes(query);
        return refMatch || nameMatch || emailMatch;
      }
      return true;
    });
  }, [orders, selectedStatusTab, searchTerm]);

  if (isOrdersLoading) return <Loader />;

  return (
    <OrdersPageWrapper>
      {/* 6 Insight Cards */}
      <InsightCardsGrid>
        <InsightCard $accent="#7c2d12">
          <div className="card-label">
            <span>Total Orders</span>
            <FaShoppingBag />
          </div>
          <div className="card-value">{orders.length}</div>
          <div className="card-sub">Recorded in database</div>
        </InsightCard>

        <InsightCard $accent="#dc2626" $valColor={unpaidOrders.length > 0 ? "#dc2626" : "inherit"}>
          <div className="card-label">
            <span>Unpaid (Action Required)</span>
            <FaLock />
          </div>
          <div className="card-value">{unpaidOrders.length}</div>
          <div className="card-sub">Fulfillment locked until paid</div>
        </InsightCard>

        <InsightCard $accent="#f97316">
          <div className="card-label">
            <span>Processing</span>
            <FaBoxOpen />
          </div>
          <div className="card-value">{processingCount}</div>
          <div className="card-sub">Paid &amp; being packaged</div>
        </InsightCard>

        <InsightCard $accent="#0284c7">
          <div className="card-label">
            <span>Shipped</span>
            <FaTruck />
          </div>
          <div className="card-value">{shippedCount}</div>
          <div className="card-sub">In transit with courier</div>
        </InsightCard>

        <InsightCard $accent="#16a34a">
          <div className="card-label">
            <span>Completed</span>
            <FaCheckCircle />
          </div>
          <div className="card-value">{deliveredCount}</div>
          <div className="card-sub">Delivered to customers</div>
        </InsightCard>

        <InsightCard $accent="#059669">
          <div className="card-label">
            <span>Order Volume</span>
          </div>
          <div className="card-value">₦{totalRevenue.toLocaleString()}</div>
          <div className="card-sub">Cumulative order value</div>
        </InsightCard>
      </InsightCardsGrid>

      {/* Status Filter Tabs & Search Bar */}
      <ControlBar>
        <FilterTabs>
          <TabButton
            type="button"
            $active={selectedStatusTab === "all"}
            onClick={() => setSelectedStatusTab("all")}
          >
            All Orders <TabBadge $active={selectedStatusTab === "all"}>{orders.length}</TabBadge>
          </TabButton>

          <TabButton
            type="button"
            $active={selectedStatusTab === "unpaid"}
            onClick={() => setSelectedStatusTab("unpaid")}
          >
            <FaLock style={{ fontSize: "0.75rem" }} /> Unpaid / Payment Pending{" "}
            <TabBadge
              $active={selectedStatusTab === "unpaid"}
              $alert={unpaidOrders.length > 0}
            >
              {unpaidOrders.length}
            </TabBadge>
          </TabButton>

          <TabButton
            type="button"
            $active={selectedStatusTab === "processing"}
            onClick={() => setSelectedStatusTab("processing")}
          >
            Processing{" "}
            <TabBadge $active={selectedStatusTab === "processing"}>{processingCount}</TabBadge>
          </TabButton>

          <TabButton
            type="button"
            $active={selectedStatusTab === "shipped"}
            onClick={() => setSelectedStatusTab("shipped")}
          >
            Shipped{" "}
            <TabBadge $active={selectedStatusTab === "shipped"}>{shippedCount}</TabBadge>
          </TabButton>

          <TabButton
            type="button"
            $active={selectedStatusTab === "delivered"}
            onClick={() => setSelectedStatusTab("delivered")}
          >
            Completed / Delivered{" "}
            <TabBadge $active={selectedStatusTab === "delivered"}>{deliveredCount}</TabBadge>
          </TabButton>
        </FilterTabs>

        <SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Search reference, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
      </ControlBar>

      {/* Orders Table with Visual Fulfillment Pipeline & Payment Guardrails */}
      <TableContainer>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            No orders match the selected filter or search term.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Contact &amp; Shipping</th>
                  <th>Total Amount</th>
                  <th>Payment State</th>
                  <th>Fulfillment Pipeline (Status Flow)</th>
                  <th>Items Count</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const isPaid = isOrderPaid(o);
                  const details = getOrderStatusDetails(o.status, isPaid);
                  const currentNormStatus = String(o.status || "pending").toLowerCase();
                  const selectValue = ["pending", "processing", "shipped", "delivered"].includes(
                    currentNormStatus
                  )
                    ? currentNormStatus
                    : isPaid
                    ? "processing"
                    : "pending";

                  return (
                    <tr key={o.id || o.order_id}>
                      <td>
                        <code style={{ fontSize: "0.82rem", color: "var(--color-brown, #7c2d12)", fontWeight: "600" }}>
                          {o.order_id}
                        </code>
                      </td>
                      <td>
                        <strong style={{ color: "var(--text-primary, #111827)" }}>
                          {o.full_name || "Valued Customer"}
                        </strong>
                        <div style={{ fontSize: "0.78rem", color: "var(--color-grey-500, #6b7280)" }}>
                          {o.email}
                        </div>
                      </td>
                      <td>
                        <div>{o.shipping_address || "Standard Delivery"}</div>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-grey-500, #6b7280)" }}>
                          {o.contact}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "var(--text-primary, #111827)" }}>
                          ₦{Number(o.total_price || 0).toLocaleString()}
                        </strong>
                      </td>

                      {/* Payment State Column */}
                      <td>
                        <PaymentPill $paid={isPaid}>
                          {isPaid ? <FaCheckCircle /> : <FaLock />}
                          {isPaid ? "Paid" : "Unpaid"}
                        </PaymentPill>
                      </td>

                      {/* Visual Fulfillment Pipeline with Strict Business Guardrails */}
                      <td>
                        <StatusPipelineCell>
                          <PipelineRow>
                            <StatusBadge
                              $bg={details.bg}
                              $color={details.color}
                              $border={details.border}
                            >
                              {details.label}
                            </StatusBadge>

                            {/* Dropdown with disabled shipping/delivery options if unpaid */}
                            <StatusSelect
                              value={selectValue}
                              disabled={isUpdatingStatus}
                              onChange={(e) => handleStatusPipelineUpdate(o, e.target.value)}
                              title="Update order fulfillment status"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing" disabled={!isPaid}>
                                Processing {!isPaid && "🔒 (Unpaid)"}
                              </option>
                              <option value="shipped" disabled={!isPaid}>
                                Shipped {!isPaid && "🔒 (Unpaid)"}
                              </option>
                              <option value="delivered" disabled={!isPaid}>
                                Delivered {!isPaid && "🔒 (Unpaid)"}
                              </option>
                            </StatusSelect>
                          </PipelineRow>

                          {/* Quick pipeline advance or strict unpaid lock */}
                          <PipelineRow>
                            {!isPaid ? (
                              <UnpaidWarningBlock>
                                <span className="warning-label">
                                  <FaExclamationTriangle /> Fulfillment Locked
                                </span>
                                <VerifyPaymentBtn
                                  type="button"
                                  disabled={isConfirmingPayment}
                                  onClick={() => handleConfirmManualPayment(o)}
                                  title="Confirm receipt of payment via bank or cash to unlock shipping"
                                >
                                  <FaShieldAlt /> Verify &amp; Confirm Payment
                                </VerifyPaymentBtn>
                              </UnpaidWarningBlock>
                            ) : details.nextStatus ? (
                              <AdvanceStatusBtn
                                type="button"
                                $bg={details.actionBg}
                                disabled={isUpdatingStatus}
                                onClick={() => handleStatusPipelineUpdate(o, details.nextStatus)}
                                title={`Advance status to ${details.nextStatus}`}
                              >
                                {details.nextLabel}
                              </AdvanceStatusBtn>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.76rem",
                                  color: "#15803d",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <FaCheckCircle /> Order Fulfilled
                              </span>
                            )}
                          </PipelineRow>
                        </StatusPipelineCell>
                      </td>

                      <td>{o.order_items?.length || 0} items</td>
                      <td style={{ fontSize: "0.82rem", color: "var(--color-grey-500, #6b7280)" }}>
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : "Recent"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </TableContainer>
    </OrdersPageWrapper>
  );
}
