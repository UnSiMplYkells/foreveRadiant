import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import {
  FaBoxes,
  FaShippingFast,
  FaChartLine,
  FaExclamationTriangle,
  FaPlus,
  FaCrown,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaLock,
  FaTag,
} from "react-icons/fa";
import { getProduct } from "../../Services/apiProducts";
import { useAllOrders } from "../../Hooks/useAllOrders";
import { useAdminPromoCodes } from "../../Hooks/usePromos";
import ProductFormModal from "../../Features/Admin/ProductFormModal";
import ProductInsightsModal from "../../Features/Admin/ProductInsightsModal";
import Loader from "../../ui/Loader";

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const QuickActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
`;

const GreetingBox = styled.div`
  h2 {
    font-size: 1.45rem;
    font-weight: 700;
    color: var(--text-primary, #1f2937);
    margin: 0;
  }

  p {
    margin: 4px 0 0;
    font-size: 0.9rem;
    color: var(--color-grey-500, #6b7280);
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrimaryBtn = styled.button`
  background: var(--color-brown, #7c2d12);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #5c200c;
    transform: translateY(-1px);
  }
`;

const SecondaryBtn = styled.button`
  background: var(--bg-surface-soft, #f8f9fa);
  color: var(--text-primary, #374151);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-grey-100, #f3f4f6);
    border-color: var(--color-grey-300, #d1d5db);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
  }

  h4 {
    margin: 0 0 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-grey-500, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  p {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 700;
    color: ${(props) => props.$color || "var(--text-primary, #111827)"};
  }

  .subtext {
    margin-top: 6px;
    font-size: 0.78rem;
    color: var(--color-grey-500, #9ca3af);
  }
`;

const NavCardsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary, #1f2937);
    margin: 0;
  }
`;

const NavCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
`;

const NavHubCard = styled(Link)`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s ease;
  position: relative;

  &:hover {
    border-color: var(--color-brown, #7c2d12);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(124, 45, 18, 0.1);

    .arrow-icon {
      transform: translateX(4px);
      color: var(--color-brown, #7c2d12);
    }
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 14px;
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    background: ${(props) => props.$iconBg || "#fef3c7"};
    color: ${(props) => props.$iconColor || "#7c2d12"};
    flex-shrink: 0;
  }

  .card-heading {
    h4 {
      margin: 0 0 4px;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
    }

    .badge-pill {
      display: inline-block;
      font-size: 0.74rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: ${(props) => props.$pillBg || "#f3f4f6"};
      color: ${(props) => props.$pillColor || "#374151"};
    }
  }

  p {
    margin: 0 0 20px;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--color-grey-600, #4b5563);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid var(--border-color, #f3f4f6);
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--color-brown, #7c2d12);

    .arrow-icon {
      transition: transform 0.2s ease, color 0.2s ease;
    }
  }
`;

const AlertBanner = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 5px solid #d97706;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .alert-content {
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
      color: #d97706;
      font-size: 1.4rem;
      flex-shrink: 0;
    }

    strong {
      color: #92400e;
      display: block;
      font-size: 0.95rem;
    }

    p {
      margin: 2px 0 0;
      color: #78350f;
      font-size: 0.85rem;
    }
  }
`;

const AlertLinkBtn = styled(Link)`
  background: #d97706;
  color: white;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #b45309;
  }
`;

const RecentSection = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      margin: 0;
    }

    a {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-brown, #7c2d12);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const OrdersMiniTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;

  th {
    text-align: left;
    padding: 10px 12px;
    background: var(--bg-surface-soft, #f9fafb);
    color: var(--color-grey-600, #4b5563);
    font-weight: 600;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  td {
    padding: 12px;
    border-bottom: 1px solid var(--border-color, #f3f4f6);
    color: var(--text-primary, #1f2937);
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
  background: ${(props) => props.$bg || "#f3f4f6"};
  color: ${(props) => props.$color || "#374151"};
`;

export default function AdminHome() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["all-products-inventory"],
    queryFn: getProduct,
    staleTime: 60 * 1000,
  });

  const { orders = [], isLoading: isOrdersLoading } = useAllOrders();
  const { promoCodes = [] } = useAdminPromoCodes();

  if (isProductsLoading || isOrdersLoading) return <Loader />;

  const activePromoCount = promoCodes.filter((p) => {
    if (!p.is_active) return false;
    if (p.mode === "timed" && p.expires_at && new Date(p.expires_at).getTime() <= Date.now()) {
      return false;
    }
    return true;
  }).length;

  const totalCatalogItems = allProducts.length;
  const totalStockUnits = allProducts.reduce((acc, p) => acc + (p.available ?? 0), 0);
  const lowStockItems = allProducts.filter((p) => (p.available ?? 0) < 10);

  function isOrderPaid(o) {
    if (o.is_paid === true) return true;
    if (String(o.payment_status || "").toLowerCase() === "paid") return true;
    const s = String(o.status || "").toLowerCase();
    return ["paid", "shipped", "delivered"].includes(s);
  }

  const unpaidOrders = orders.filter((o) => !isOrderPaid(o));
  const pendingOrders = orders.filter((o) => String(o.status || "").toLowerCase() === "pending");
  const completedOrders = orders.filter((o) => String(o.status || "").toLowerCase() === "delivered");
  const totalGrossRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <HomeWrapper>
      <QuickActionsRow>
        <GreetingBox>
          <h2>Welcome back, Store Administrator</h2>
          <p>Live overview across catalog items, order fulfillment, and analytics</p>
        </GreetingBox>

        <ActionButtonsGroup>
          <SecondaryBtn
            type="button"
            onClick={() => setIsInsightsOpen(true)}
            title="Open inventory intelligence with top sellers and stock warnings"
          >
            <FaCrown style={{ color: "#d97706" }} /> Inventory Intelligence
          </SecondaryBtn>

          <PrimaryBtn
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            title="Create a new catalog product"
          >
            <FaPlus /> Add Product
          </PrimaryBtn>
        </ActionButtonsGroup>
      </QuickActionsRow>

      {/* KPI Stats Grid */}
      <StatsGrid>
        <StatCard>
          <h4>Active Catalog Items</h4>
          <p>{totalCatalogItems}</p>
          <div className="subtext">Available across all categories</div>
        </StatCard>

        <StatCard>
          <h4>Vault Inventory Units</h4>
          <p>{totalStockUnits.toLocaleString()}</p>
          <div className="subtext">Total units in warehouse storage</div>
        </StatCard>

        <StatCard $color={lowStockItems.length > 0 ? "#dc2626" : "#16a34a"}>
          <h4>
            Low Stock Alerts
            <FaExclamationTriangle style={{ color: lowStockItems.length > 0 ? "#dc2626" : "#16a34a" }} />
          </h4>
          <p>{lowStockItems.length}</p>
          <div className="subtext">&lt; 10 units remaining in stock</div>
        </StatCard>

        <StatCard $color={unpaidOrders.length > 0 ? "#dc2626" : "#7c2d12"}>
          <h4>
            Customer Orders
            {unpaidOrders.length > 0 && <FaLock style={{ color: "#dc2626", fontSize: "0.9rem" }} />}
          </h4>
          <p>{orders.length}</p>
          <div className="subtext">
            {unpaidOrders.length > 0
              ? `${unpaidOrders.length} unpaid (fulfillment locked)`
              : "All active orders verified"}
          </div>
        </StatCard>

        <StatCard $color="#047857">
          <h4>Recorded Gross Revenue</h4>
          <p>₦{totalGrossRevenue.toLocaleString()}</p>
          <div className="subtext">{completedOrders.length} fulfilled orders</div>
        </StatCard>
      </StatsGrid>

      {/* Unpaid Orders Warning Banner */}
      {unpaidOrders.length > 0 && (
        <AlertBanner style={{ background: "#fef2f2", borderColor: "#fecaca", borderLeftColor: "#dc2626" }}>
          <div className="alert-content">
            <FaLock style={{ color: "#dc2626" }} />
            <div>
              <strong style={{ color: "#991b1b" }}>
                Payment Verification Required ({unpaidOrders.length} order(s) unpaid)
              </strong>
              <p style={{ color: "#7f1d1d" }}>
                Fulfillment is strictly locked for unpaid orders. Orders must be paid via Flutterwave or verified manually by an admin before shipping or delivery.
              </p>
            </div>
          </div>
          <AlertLinkBtn to="/admin/orders" style={{ background: "#dc2626" }}>
            Review Unpaid Orders &rarr;
          </AlertLinkBtn>
        </AlertBanner>
      )}

      {/* Low stock warning banner if any */}
      {lowStockItems.length > 0 && (
        <AlertBanner>
          <div className="alert-content">
            <FaExclamationTriangle />
            <div>
              <strong>Low Inventory Notice ({lowStockItems.length} products below safety threshold)</strong>
              <p>
                Products including{" "}
                <em>{lowStockItems.slice(0, 3).map((p) => p.name).join(", ")}</em>
                {lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} more` : ""} require restocking.
              </p>
            </div>
          </div>
          <AlertLinkBtn to="/admin/products">Manage &amp; Restock &rarr;</AlertLinkBtn>
        </AlertBanner>
      )}

      {/* 3 Prominent Navigation Cards */}
      <NavCardsSection>
        <h3>Admin Management Areas</h3>
        <NavCardsGrid>
          <NavHubCard to="/admin/products" $iconBg="#eff6ff" $iconColor="#2563eb" $pillBg="#dbeafe" $pillColor="#1e40af">
            <div>
              <div className="card-top">
                <div className="icon-box">
                  <FaBoxes />
                </div>
                <div className="card-heading">
                  <h4>Products Management</h4>
                  <span className="badge-pill">{totalCatalogItems} Catalog Items</span>
                </div>
              </div>
              <p>
                Create, edit, and organize storefront items. Manage multiple volume sizes with custom pricing,
                adjust warehouse stock with instant controls, and monitor star ratings.
              </p>
            </div>
            <div className="card-footer">
              <span>Enter Catalog Management</span>
              <FaArrowRight className="arrow-icon" />
            </div>
          </NavHubCard>

          <NavHubCard to="/admin/orders" $iconBg="#fef3c7" $iconColor="#d97706" $pillBg="#fef3c7" $pillColor="#92400e">
            <div>
              <div className="card-top">
                <div className="icon-box">
                  <FaShippingFast />
                </div>
                <div className="card-heading">
                  <h4>Orders &amp; Fulfillment</h4>
                  <span className="badge-pill">{pendingOrders.length} Pending Actions</span>
                </div>
              </div>
              <p>
                Track live customer orders with status tabs (Completed, Pending, Processing). Advance lifecycle states
                (Pending &rarr; Processing &rarr; Shipped &rarr; Delivered) with instant single-click buttons.
              </p>
            </div>
            <div className="card-footer">
              <span>Open Fulfillment Pipeline</span>
              <FaArrowRight className="arrow-icon" />
            </div>
          </NavHubCard>

          <NavHubCard to="/admin/analytics" $iconBg="#ecfdf5" $iconColor="#059669" $pillBg="#d1fae5" $pillColor="#065f46">
            <div>
              <div className="card-top">
                <div className="icon-box">
                  <FaChartLine />
                </div>
                <div className="card-heading">
                  <h4>Visual Analytics</h4>
                  <span className="badge-pill">30-Day Trends</span>
                </div>
              </div>
              <p>
                Explore interactive Recharts visualizations: 30-day daily revenue trajectories, category revenue
                breakdown pie charts, top product yield bars, and audited performance KPIs.
              </p>
            </div>
            <div className="card-footer">
              <span>View Financial Intelligence</span>
              <FaArrowRight className="arrow-icon" />
            </div>
          </NavHubCard>

          <NavHubCard to="/admin/promos" $iconBg="#fef3c7" $iconColor="#b45309" $pillBg="#ffedd5" $pillColor="#9a3412">
            <div>
              <div className="card-top">
                <div className="icon-box">
                  <FaTag />
                </div>
                <div className="card-heading">
                  <h4>Promo Codes</h4>
                  <span className="badge-pill">{activePromoCount} Active</span>
                </div>
              </div>
              <p>
                Issue storefront discount codes — choose between time-based expiring campaigns or permanent codes
                that stay live until manually turned off.
              </p>
            </div>
            <div className="card-footer">
              <span>Manage Discounts</span>
              <FaArrowRight className="arrow-icon" />
            </div>
          </NavHubCard>
        </NavCardsGrid>
      </NavCardsSection>

      {/* Recent Orders Preview */}
      <RecentSection>
        <div className="section-header">
          <h3>Recent Order Activity</h3>
          <Link to="/admin/orders">View All {orders.length} Orders &rarr;</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ color: "#6b7280", margin: 0 }}>No orders recorded yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <OrdersMiniTable>
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const paid = isOrderPaid(o);
                  const status = String(o.status || "pending").toLowerCase();
                  let bg = "#fef9c3";
                  let color = "#854d0e";
                  if (status === "delivered") {
                    bg = "#dcfce7";
                    color = "#15803d";
                  } else if (status === "shipped") {
                    bg = "#e0f2fe";
                    color = "#0369a1";
                  } else if (status === "processing") {
                    bg = "#ffedd5";
                    color = "#c2410c";
                  }

                  return (
                    <tr key={o.id || o.order_id}>
                      <td>
                        <code style={{ color: "#7c2d12", fontWeight: "600" }}>{o.order_id}</code>
                      </td>
                      <td>
                        <strong>{o.full_name || "Valued Customer"}</strong>
                        <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{o.email}</div>
                      </td>
                      <td>{o.order_items?.length || 0} items</td>
                      <td>
                        <strong>₦{Number(o.total_price || 0).toLocaleString()}</strong>
                      </td>
                      <td>
                        <StatusPill
                          $bg={paid ? "#dcfce7" : "#fee2e2"}
                          $color={paid ? "#15803d" : "#b91c1c"}
                        >
                          {paid ? <FaCheckCircle /> : <FaLock />}
                          {paid ? "PAID" : "UNPAID"}
                        </StatusPill>
                      </td>
                      <td>
                        <StatusPill $bg={bg} $color={color}>
                          {status === "delivered" ? <FaCheckCircle /> : <FaClock />}
                          {status.toUpperCase()}
                        </StatusPill>
                      </td>
                      <td style={{ color: "#6b7280", fontSize: "0.82rem" }}>
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : "Recent"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </OrdersMiniTable>
          </div>
        )}
      </RecentSection>

      {/* Modals */}
      <ProductFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        productToEdit={null}
      />

      <ProductInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        product={allProducts[0] || null}
        allProducts={allProducts}
        allOrders={orders}
        onEditProduct={() => {
          navigate("/admin/products");
        }}
        onSelectProduct={() => {}}
      />
    </HomeWrapper>
  );
}
