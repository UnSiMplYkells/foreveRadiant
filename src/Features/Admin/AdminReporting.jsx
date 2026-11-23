import { useState, useMemo } from "react";
import styled from "styled-components";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FaMoneyBillWave,
  FaShoppingBag,
  FaReceipt,
  FaWarehouse,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";
import { useAdminKPIs, useSalesTrends } from "../../Hooks/useAdminReporting";
import MiniLoader from "../../ui/MiniLoader";

const ReportingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const KpiCard = styled.div`
  background: var(--color-grey-0, #ffffff);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 10px;
  padding: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) => props.$accent || "#7c2d12"};
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--color-grey-500, #6b7280);
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    .icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: ${(props) => props.$bg || "#fef3c7"};
      color: ${(props) => props.$color || "#7c2d12"};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
  }

  .value {
    font-size: 1.85rem;
    font-weight: 800;
    color: var(--color-grey-900, #111827);
    margin: 4px 0 0;
    letter-spacing: -0.5px;
  }

  .sub {
    font-size: 0.8rem;
    color: var(--color-grey-500, #6b7280);
    display: flex;
    align-items: center;
    gap: 4px;

    span.rpc-tag {
      background: #f3f4f6;
      color: #4b5563;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
    }
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: var(--color-grey-0, #ffffff);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;

    .title-group {
      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-grey-900, #111827);
      }
      p {
        margin: 4px 0 0;
        font-size: 0.82rem;
        color: var(--color-grey-500, #6b7280);
      }
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 8px;

      span.badge {
        font-size: 0.78rem;
        color: #7c2d12;
        background: #fef3c7;
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: 600;
        border: 1px solid #fde68a;
      }

      button.toggle-btn {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        color: #374151;
        transition: all 0.2s;

        &.active {
          background: #7c2d12;
          color: white;
          border-color: #7c2d12;
        }
      }
    }
  }
`;

const TableCard = styled.div`
  background: var(--color-grey-0, #ffffff);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;

  h3 {
    margin: 0 0 16px;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-grey-900, #111827);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;

    th {
      text-align: left;
      padding: 12px 14px;
      background: var(--color-grey-50, #f9fafb);
      color: var(--color-grey-600, #4b5563);
      font-weight: 600;
      border-bottom: 1px solid var(--color-grey-200, #e5e7eb);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    td {
      padding: 14px;
      border-bottom: 1px solid var(--color-grey-100, #f3f4f6);
      color: var(--color-grey-800, #1f2937);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  span.status-pill {
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;

    &.paid {
      background: #fef9c3;
      color: #a16207;
      border: 1px solid #fde047;
    }
    &.processing {
      background: #ffedd5;
      color: #c2410c;
      border: 1px solid #fdba74;
    }
    &.shipped {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }
    &.delivered {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
  }
`;

const CATEGORY_COLORS = {
  skincare: "#15803d",
  haircare: "#7c2d12",
  bodycare: "#b45309",
  wellness: "#0284c7",
  fragrance: "#7e22ce",
  other: "#64748b",
};

export default function AdminReporting({ orders = [], products = [] }) {
  const [showOrdersMetric, setShowOrdersMetric] = useState(true);

  // Task 2 & Task 3: Load real data from Supabase RPCs
  const { kpis, isLoading: isKpisLoading } = useAdminKPIs();
  const { salesTrends, isLoading: isTrendsLoading } = useSalesTrends();

  // Inventory stats from loaded products
  const totalInventoryUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.available) || 0), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.available ?? 0) < 10).length;
  }, [products]);

  // Transform salesTrends for Recharts LineChart
  const chartData = useMemo(() => {
    if (salesTrends && salesTrends.length > 0) {
      return salesTrends.map((d) => ({
        date: d.formatted_date || d.sale_date,
        fullDate: d.sale_date,
        revenue: Number(d.daily_revenue) || 0,
        orders: Number(d.orders_count) || 0,
      }));
    }

    // Fallback if RPC returns empty
    const dailyMap = {};
    orders.forEach((ord) => {
      const d = ord.created_at
        ? new Date(ord.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Recent";
      if (!dailyMap[d]) dailyMap[d] = { date: d, revenue: 0, orders: 0 };
      dailyMap[d].revenue += Number(ord.total_price) || 0;
      dailyMap[d].orders += 1;
    });
    return Object.values(dailyMap);
  }, [salesTrends, orders]);

  // Category Breakdown for PieChart
  const categoryData = useMemo(() => {
    const catMap = {
      skincare: 0,
      haircare: 0,
      bodycare: 0,
      wellness: 0,
      fragrance: 0,
    };

    orders.forEach((ord) => {
      if (Array.isArray(ord.order_items)) {
        ord.order_items.forEach((item) => {
          const prod = products.find((p) => Number(p.id) === Number(item.product_id));
          const cat = (prod?.category || "skincare").toLowerCase();
          const itemRev =
            (Number(item.product_quantity) || 1) *
            (Number(item.product_price) || Number(prod?.price) || 0);

          if (catMap[cat] !== undefined) {
            catMap[cat] += itemRev;
          } else {
            catMap.skincare += itemRev;
          }
        });
      }
    });

    return Object.entries(catMap).map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
    }));
  }, [orders, products]);

  // Top 5 Best-Selling Products by Revenue for BarChart
  const topProductsData = useMemo(() => {
    const prodMap = {};

    orders.forEach((ord) => {
      if (Array.isArray(ord.order_items)) {
        ord.order_items.forEach((item) => {
          const pid = item.product_id;
          const prod = products.find((p) => Number(p.id) === Number(pid));
          const pName = prod?.name || item.product_name || `Product #${pid}`;
          const itemRev =
            (Number(item.product_quantity) || 1) *
            (Number(item.product_price) || Number(prod?.price) || 0);

          if (!prodMap[pid]) {
            prodMap[pid] = {
              name: pName.length > 20 ? pName.slice(0, 18) + "..." : pName,
              revenue: 0,
              units: 0,
            };
          }
          prodMap[pid].revenue += itemRev;
          prodMap[pid].units += Number(item.product_quantity) || 1;
        });
      }
    });

    return Object.values(prodMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, products]);

  // Recent 6 Orders
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
  }, [orders]);

  // Resolved KPI numbers from RPC
  const revenue30Days = Number(kpis?.total_revenue) || 0;
  const orders30Days = Number(kpis?.total_orders) || 0;
  const aov30Days = Number(kpis?.average_order_value) || 0;

  return (
    <ReportingWrapper>
      {/* TASK 3: TOP ROW OF STYLED KPI CARDS FROM get_admin_kpis() */}
      <KpiGrid>
        <KpiCard $color="#15803d" $bg="#dcfce7" $accent="#15803d">
          <div className="header">
            <span>30-Day Total Revenue</span>
            <div className="icon-box">
              <FaMoneyBillWave />
            </div>
          </div>
          <div className="value">
            {isKpisLoading ? <MiniLoader /> : `₦${revenue30Days.toLocaleString()}`}
          </div>
          <div className="sub">
            <span className="rpc-tag">RPC: get_admin_kpis</span> Last 30 days
          </div>
        </KpiCard>

        <KpiCard $color="#7c2d12" $bg="#fee2e2" $accent="#7c2d12">
          <div className="header">
            <span>30-Day Total Orders</span>
            <div className="icon-box">
              <FaShoppingBag />
            </div>
          </div>
          <div className="value">
            {isKpisLoading ? <MiniLoader /> : orders30Days.toLocaleString()}
          </div>
          <div className="sub">
            <span className="rpc-tag">RPC: get_admin_kpis</span> Processed orders
          </div>
        </KpiCard>

        <KpiCard $color="#0284c7" $bg="#e0f2fe" $accent="#0284c7">
          <div className="header">
            <span>Average Order Value</span>
            <div className="icon-box">
              <FaReceipt />
            </div>
          </div>
          <div className="value">
            {isKpisLoading ? <MiniLoader /> : `₦${aov30Days.toLocaleString()}`}
          </div>
          <div className="sub">
            <span className="rpc-tag">RPC: get_admin_kpis</span> 30-day average
          </div>
        </KpiCard>

        <KpiCard $color="#b45309" $bg="#fef3c7" $accent="#b45309">
          <div className="header">
            <span>Vault Inventory</span>
            <div className="icon-box">
              <FaWarehouse />
            </div>
          </div>
          <div className="value">{totalInventoryUnits.toLocaleString()}</div>
          <div className="sub">Units across {products.length} registered SKUs</div>
        </KpiCard>

        <KpiCard
          $color={lowStockCount > 0 ? "#dc2626" : "#16a34a"}
          $bg={lowStockCount > 0 ? "#fee2e2" : "#dcfce7"}
          $accent={lowStockCount > 0 ? "#dc2626" : "#16a34a"}
        >
          <div className="header">
            <span>Low Stock Alert</span>
            <div className="icon-box">
              <FaExclamationTriangle />
            </div>
          </div>
          <div className="value">{lowStockCount}</div>
          <div className="sub">
            {lowStockCount > 0 ? "SKUs below 10 units threshold" : "All inventories optimal"}
          </div>
        </KpiCard>
      </KpiGrid>

      {/* TASK 3: RESPONSIVE INTERACTIVE LINECHART FOR 30-DAY REVENUE TRENDS FROM get_sales_trends() */}
      <ChartCard>
        <div className="card-header">
          <div className="title-group">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaChartLine style={{ color: "#7c2d12" }} /> 30-Day Revenue & Sales Trends
            </h3>
            <p>Interactive timeline powered directly by Supabase RPC <code>get_sales_trends()</code></p>
          </div>
          <div className="controls">
            <span className="badge">Daily Breakdown (Past 30 Days)</span>
            <button
              type="button"
              className={showOrdersMetric ? "toggle-btn active" : "toggle-btn"}
              onClick={() => setShowOrdersMetric((prev) => !prev)}
            >
              {showOrdersMetric ? "Hide Orders Line" : "Show Orders Line"}
            </button>
          </div>
        </div>

        <div style={{ width: "100%", height: 320 }}>
          {isTrendsLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <MiniLoader />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="revenue"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                />
                {showOrdersMetric && (
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#0369a1" }}
                    allowDecimals={false}
                  />
                )}
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "12px 14px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            fontSize: "12px",
                          }}
                        >
                          <p style={{ margin: "0 0 6px", fontWeight: "700", color: "#111827" }}>
                            {dataPoint.fullDate || label}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7c2d12" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c2d12" }}></span>
                            <strong>Revenue:</strong> ₦{dataPoint.revenue.toLocaleString()}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0369a1", marginTop: "4px" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0369a1" }}></span>
                            <strong>Orders:</strong> {dataPoint.orders} {dataPoint.orders === 1 ? "order" : "orders"}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Daily Revenue (₦)"
                  stroke="#7c2d12"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#7c2d12" }}
                  activeDot={{ r: 6, fill: "#5c200c" }}
                />
                {showOrdersMetric && (
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    name="Orders Count"
                    stroke="#0284c7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2, fill: "#0284c7" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
              No trend data available for the last 30 days.
            </div>
          )}
        </div>
      </ChartCard>

      {/* CATEGORY REVENUE SHARE & TOP PRODUCTS */}
      <SectionGrid>
        <ChartCard>
          <div className="card-header">
            <div className="title-group">
              <h3>Top 5 High-Yield Products</h3>
              <p>Ranked by realized customer revenue</p>
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#374151" }} width={120} />
                <Tooltip
                  formatter={(val, name) => [
                    name === "revenue" ? `₦${Number(val).toLocaleString()}` : `${val} units`,
                    name === "revenue" ? "Revenue" : "Units",
                  ]}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="revenue" fill="#7c2d12" radius={[0, 4, 4, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <div className="card-header">
            <div className="title-group">
              <h3>Sales by Category</h3>
              <p>Botanical product mix distribution</p>
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₦${Number(val).toLocaleString()}`, "Gross Sales"]}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </SectionGrid>

      {/* RECENT SETTLED TRANSACTIONS TABLE */}
      <TableCard>
        <h3>Recent Settled Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Customer Name</th>
              <th>Destination Address</th>
              <th>Total Amount</th>
              <th>Fulfillment Status</th>
              <th>Placed Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((ord) => {
              const statusClass = (ord.status || "pending").toLowerCase();
              return (
                <tr key={ord.id || ord.order_id}>
                  <td>
                    <code style={{ fontSize: "0.8rem", color: "#7c2d12" }}>
                      {ord.order_id?.slice(0, 16)}...
                    </code>
                  </td>
                  <td>
                    <strong>{ord.full_name || "Valued Customer"}</strong>
                    <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{ord.email}</div>
                  </td>
                  <td>
                    <div>{ord.shipping_address || "Default Address"}</div>
                    <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{ord.contact}</span>
                  </td>
                  <td>
                    <strong>₦{Number(ord.total_price || 0).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className={`status-pill ${statusClass}`}>{ord.status || "Pending"}</span>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Recent"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>
    </ReportingWrapper>
  );
}
