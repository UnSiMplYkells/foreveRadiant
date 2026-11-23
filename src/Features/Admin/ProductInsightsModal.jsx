import { useState, useMemo } from "react";
import styled from "styled-components";
import {
  FaStar,
  FaBoxOpen,
  FaChartLine,
  FaCrown,
  FaTimes,
  FaEdit,
  FaExclamationTriangle,
  FaPlus,
  FaCheckCircle,
  FaFire,
} from "react-icons/fa";
import { useProductReviews } from "../../Hooks/useReviews";
import { useUpdateProduct } from "../../Hooks/useUpdateProduct";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: var(--color-grey-0, #ffffff);
  color: var(--color-grey-900, #111827);
  border-radius: 12px;
  width: 100%;
  max-width: 880px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-grey-200, #e5e7eb);
  background: var(--color-grey-50, #f9fafb);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  flex-wrap: wrap;
  gap: 12px;
`;

const ProductTitleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  img {
    width: 54px;
    height: 54px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--color-grey-300, #d1d5db);
  }

  .meta {
    h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-grey-900, #111827);
    }

    .tags {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;

      span.category {
        background: #fef3c7;
        color: #78350f;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 4px;
      }

      span.stock {
        font-size: 0.82rem;
        color: var(--color-grey-500, #6b7280);
      }
    }
  }
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 24px;
  background: var(--color-grey-50, #f9fafb);
  border-bottom: 1px solid var(--color-grey-200, #e5e7eb);
`;

const TabBtn = styled.button`
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#7c2d12" : "var(--color-grey-500, #6b7280)")};
  border-bottom: 2px solid ${(props) => (props.$active ? "#7c2d12" : "transparent")};
  margin-bottom: -1px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #7c2d12;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  button.edit-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--color-brown, #7c2d12);
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--color-brown-hover, #5c200c);
    }
  }

  button.close-btn {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    color: var(--color-grey-500, #6b7280);
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;

    &:hover {
      background: var(--color-grey-200, #e5e7eb);
      color: var(--color-grey-900, #111827);
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/* TASK 4: LOW STOCK ALERT WARNING BLOCK */
const LowStockWarningBlock = styled.div`
  border: 2px solid #ea580c;
  background: #fff7ed;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.08);

  .alert-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;

    .title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #9a3412;
      font-weight: 700;
      font-size: 1.05rem;

      svg {
        font-size: 1.3rem;
        color: #ea580c;
      }
    }

    .badge-count {
      background: #ea580c;
      color: white;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  }

  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 260px;
    overflow-y: auto;
    padding-right: 4px;
  }
`;

const LowStockRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 10px 14px;
  gap: 12px;
  flex-wrap: wrap;

  .product-info {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #fed7aa;
    }

    .title-area {
      strong {
        display: block;
        color: #111827;
        font-size: 0.9rem;
      }
      span {
        font-size: 0.78rem;
        color: #6b7280;
      }
    }
  }

  .status-and-action {
    display: flex;
    align-items: center;
    gap: 12px;

    .stock-badge {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      background: ${(props) => (props.$isZero ? "#fee2e2" : "#fef3c7")};
      color: ${(props) => (props.$isZero ? "#991b1b" : "#92400e")};
      border: 1px solid ${(props) => (props.$isZero ? "#fca5a5" : "#fde68a")};
    }

    .restock-btn {
      background: #7c2d12;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #5c200c;
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
`;

/* TASK 4: TOP SELLERS LIST */
const TopSellersSection = styled.div`
  background: var(--color-grey-50, #f9fafb);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 10px;
  padding: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;

    h4 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-grey-900, #111827);
      display: flex;
      align-items: center;
      gap: 8px;

      svg {
        color: #d97706;
      }
    }

    span.badge {
      font-size: 0.78rem;
      background: var(--color-grey-200, #e5e7eb);
      color: var(--color-grey-700, #374151);
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
    }
  }

  .top-sellers-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;
  }
`;

const TopSellerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-grey-0, #ffffff);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 8px;
  padding: 10px 14px;
  gap: 12px;
  flex-wrap: wrap;
  transition: all 0.2s;

  &:hover {
    border-color: #7c2d12;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .left-side {
    display: flex;
    align-items: center;
    gap: 12px;

    .rank-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.82rem;
      background: ${(props) =>
        props.$rank === 1
          ? "#fef08a"
          : props.$rank === 2
          ? "#e2e8f0"
          : props.$rank === 3
          ? "#fed7aa"
          : "#f3f4f6"};
      color: ${(props) =>
        props.$rank === 1
          ? "#854d0e"
          : props.$rank === 2
          ? "#475569"
          : props.$rank === 3
          ? "#9a3412"
          : "#6b7280"};
      border: 1px solid rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }

    img {
      width: 42px;
      height: 42px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--color-grey-200, #e5e7eb);
    }

    .meta {
      strong {
        display: block;
        color: var(--color-grey-900, #111827);
        font-size: 0.92rem;
      }
      span {
        font-size: 0.78rem;
        color: var(--color-grey-500, #6b7280);
      }
    }
  }

  .stats-side {
    display: flex;
    align-items: center;
    gap: 14px;

    .stat-pill {
      text-align: right;

      .units {
        font-weight: 700;
        color: #7c2d12;
        font-size: 0.9rem;
      }
      .revenue {
        font-size: 0.78rem;
        color: var(--color-grey-500, #6b7280);
      }
    }

    .select-btn {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      color: #374151;
      transition: all 0.2s;

      &:hover {
        background: #7c2d12;
        color: white;
        border-color: #7c2d12;
      }
    }
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
`;

const KpiCard = styled.div`
  background: var(--color-grey-50, #f9fafb);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--color-grey-500, #6b7280);
  }

  .value {
    font-size: 1.4rem;
    font-weight: 700;
    color: ${(props) => props.$color || "var(--color-grey-900, #111827)"};
  }

  .sub {
    font-size: 0.78rem;
    color: var(--color-grey-500, #6b7280);
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: var(--color-grey-50, #f9fafb);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 8px;
  padding: 16px;

  h4 {
    margin: 0 0 14px;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--color-grey-800, #1f2937);
  }
`;

const ReviewsContainer = styled.div`
  border-top: 1px solid var(--color-grey-200, #e5e7eb);
  padding-top: 20px;

  h4 {
    margin: 0 0 14px;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-grey-900, #111827);
    display: flex;
    align-items: center;
    justify-content: space-between;

    span.badge {
      background: var(--color-grey-200, #e5e7eb);
      color: var(--color-grey-700, #374151);
      font-size: 0.78rem;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
    }
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 240px;
    overflow-y: auto;
    padding-right: 6px;
  }
`;

const ReviewItem = styled.div`
  background: var(--color-grey-0, #ffffff);
  border: 1px solid var(--color-grey-200, #e5e7eb);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .user {
      display: flex;
      align-items: center;
      gap: 8px;

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #7c2d12;
        color: white;
        font-size: 0.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .name {
        font-weight: 600;
        font-size: 0.88rem;
        color: var(--color-grey-900, #111827);
      }
    }

    .stars {
      display: flex;
      gap: 2px;
      color: #f59e0b;
      font-size: 0.82rem;
    }
  }

  .title {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--color-grey-800, #1f2937);
    margin: 0;
  }

  .body {
    font-size: 0.83rem;
    color: var(--color-grey-600, #4b5563);
    margin: 0;
    line-height: 1.4;
  }

  .date {
    font-size: 0.72rem;
    color: var(--color-grey-400, #9ca3af);
    align-self: flex-end;
  }
`;

export default function ProductInsightsModal({
  isOpen,
  onClose,
  product,
  allOrders = [],
  allProducts = [],
  onEditProduct,
  onSelectProduct,
}) {
  const [activeTab, setActiveTab] = useState("intelligence");
  const { editProduct, isUpdating } = useUpdateProduct();

  // Selected product reviews
  const activeProductId = product?.id;
  const {
    reviews = [],
    totalReviews = 0,
    averageRating = "5.0",
    ratingCounts = {},
  } = useProductReviews(activeProductId);

  // Compute matched order items for the currently selected product
  const matchedOrderItems = useMemo(() => {
    if (!product) return [];
    const items = [];
    allOrders.forEach((order) => {
      if (Array.isArray(order.order_items)) {
        order.order_items.forEach((item) => {
          if (Number(item.product_id) === Number(product.id)) {
            items.push({
              ...item,
              orderStatus: order.status,
              orderDate: order.created_at,
            });
          }
        });
      }
    });
    return items;
  }, [product, allOrders]);

  const totalUnitsSold = useMemo(() => {
    return matchedOrderItems.reduce(
      (acc, curr) => acc + (Number(curr.product_quantity) || 0),
      0
    );
  }, [matchedOrderItems]);

  const totalProductRevenue = useMemo(() => {
    return matchedOrderItems.reduce(
      (acc, curr) =>
        acc +
        (Number(curr.product_quantity) || 0) *
          (Number(curr.product_price) || Number(product?.price) || 0),
      0
    );
  }, [matchedOrderItems, product]);

  // Size breakdown for selected product
  const sizeStats = useMemo(() => {
    const stats = {};
    matchedOrderItems.forEach((item) => {
      const rawSize = item.product_size_ml || "Standard";
      const sizeLabel =
        String(rawSize).endsWith("ml") || String(rawSize).endsWith("g")
          ? rawSize
          : `${rawSize}ml`;
      if (!stats[sizeLabel]) {
        stats[sizeLabel] = { units: 0, revenue: 0 };
      }
      const qty = Number(item.product_quantity) || 0;
      const price = Number(item.product_price) || Number(product?.price) || 0;
      stats[sizeLabel].units += qty;
      stats[sizeLabel].revenue += qty * price;
    });
    return stats;
  }, [matchedOrderItems, product]);

  const sizeChartData = useMemo(() => {
    const list = Object.entries(sizeStats).map(([size, stat]) => ({
      size,
      units: stat.units,
      revenue: stat.revenue,
    }));
    if (list.length === 0 && Array.isArray(product?.size)) {
      product.size.forEach((s) => {
        const label = typeof s === "object" ? s.size : s;
        list.push({ size: String(label), units: 0, revenue: 0 });
      });
    }
    return list;
  }, [sizeStats, product]);

  let topSellingSize = "Standard";
  let maxUnits = -1;
  Object.entries(sizeStats).forEach(([size, stat]) => {
    if (stat.units > maxUnits) {
      maxUnits = stat.units;
      topSellingSize = size;
    }
  });

  const ratingChartData = [
    { star: "5 ★", count: ratingCounts[5] || 0, fill: "#16a34a" },
    { star: "4 ★", count: ratingCounts[4] || 0, fill: "#65a30d" },
    { star: "3 ★", count: ratingCounts[3] || 0, fill: "#eab308" },
    { star: "2 ★", count: ratingCounts[2] || 0, fill: "#f97316" },
    { star: "1 ★", count: ratingCounts[1] || 0, fill: "#ef4444" },
  ];

  /* TASK 4: INVENTORY INTELLIGENCE - TOP SELLERS */
  const topSellersList = useMemo(() => {
    const salesMap = {};
    allOrders.forEach((order) => {
      if (Array.isArray(order.order_items)) {
        order.order_items.forEach((item) => {
          const pid = Number(item.product_id);
          if (!salesMap[pid]) {
            salesMap[pid] = { unitsSold: 0, revenue: 0 };
          }
          const qty = Number(item.product_quantity) || 1;
          const price = Number(item.product_price) || 0;
          salesMap[pid].unitsSold += qty;
          salesMap[pid].revenue += qty * price;
        });
      }
    });

    const list = allProducts.map((p) => {
      const stats = salesMap[p.id] || { unitsSold: 0, revenue: 0 };
      return {
        ...p,
        unitsSold: stats.unitsSold,
        totalSalesRevenue: stats.revenue,
      };
    });

    return list.sort((a, b) => b.unitsSold - a.unitsSold);
  }, [allOrders, allProducts]);

  /* TASK 4: INVENTORY INTELLIGENCE - LOW STOCK ALERTS (< 10 units) */
  const lowStockProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const stock = Number(p.available ?? 0);
      return stock < 10;
    });
  }, [allProducts]);

  function handleQuickRestock(p, amount = 10) {
    const current = Number(p.available ?? 0);
    editProduct({
      productId: p.id,
      productData: { available: current + amount },
    });
  }

  if (!isOpen) return null;

  const firstImage = Array.isArray(product?.image_url)
    ? product.image_url[0]
    : product?.image_url || "/Images/placeholder.png";

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          {product ? (
            <ProductTitleInfo>
              <img src={firstImage} alt={product.name} />
              <div className="meta">
                <h3>{product.name}</h3>
                <div className="tags">
                  <span className="category">{product.category}</span>
                  <span className="stock">
                    Stock: <strong>{product.available ?? 0} units</strong>
                  </span>
                  <span className="stock">
                    • Price: ₦{(Number(product.price) || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </ProductTitleInfo>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaChartLine style={{ fontSize: "1.5rem", color: "#7c2d12" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>
                  Storefront Inventory Intelligence
                </h3>
                <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                  Top Sellers ranking and automated low stock alerts
                </span>
              </div>
            </div>
          )}

          <HeaderActions>
            {product && onEditProduct && (
              <button
                className="edit-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onEditProduct(product);
                }}
              >
                <FaEdit /> Edit SKU
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </HeaderActions>
        </ModalHeader>

        {/* TAB NAVIGATION: Product Deep Dive vs Inventory Intelligence */}
        <TabNavigation>
          <TabBtn
            $active={activeTab === "intelligence"}
            onClick={() => setActiveTab("intelligence")}
          >
            <FaCrown /> Inventory Intelligence (Top Sellers & Low Stock)
          </TabBtn>
          {product && (
            <TabBtn
              $active={activeTab === "product"}
              onClick={() => setActiveTab("product")}
            >
              <FaChartLine /> SKU Deep Dive & Reviews
            </TabBtn>
          )}
        </TabNavigation>

        <ModalBody>
          {/* TAB 1: INVENTORY INTELLIGENCE (TASK 4 SPECIFIED REQUIREMENTS) */}
          {activeTab === "intelligence" && (
            <>
              {/* TASK 4: LOW STOCK ALERTS - PROMINENT WARNING BLOCK (RED/ORANGE BORDER) */}
              <LowStockWarningBlock>
                <div className="alert-header">
                  <div className="title">
                    <FaExclamationTriangle />
                    <span>Low Stock Warning (Under 10 Units Remaining)</span>
                  </div>
                  <span className="badge-count">
                    {lowStockProducts.length} {lowStockProducts.length === 1 ? "Product" : "Products"} Critical
                  </span>
                </div>

                {lowStockProducts.length === 0 ? (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#15803d",
                      fontWeight: "600",
                    }}
                  >
                    <FaCheckCircle style={{ fontSize: "1.2rem" }} />
                    All inventory levels are healthy! No SKUs currently below the 10-unit replenishment threshold.
                  </div>
                ) : (
                  <div className="alert-list">
                    {lowStockProducts.map((p) => {
                      const img = Array.isArray(p.image_url)
                        ? p.image_url[0]
                        : p.image_url || "/Images/placeholder.png";
                      const stock = Number(p.available ?? 0);
                      return (
                        <LowStockRow key={p.id} $isZero={stock === 0}>
                          <div className="product-info">
                            <img src={img} alt={p.name} />
                            <div className="title-area">
                              <strong>{p.name}</strong>
                              <span>
                                #{p.id} • {p.category} • Base Price: ₦{(Number(p.price) || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="status-and-action">
                            <span className="stock-badge">
                              {stock === 0 ? "OUT OF STOCK (0)" : `ONLY ${stock} UNITS LEFT`}
                            </span>
                            <button
                              type="button"
                              className="restock-btn"
                              disabled={isUpdating}
                              onClick={() => handleQuickRestock(p, 15)}
                              title="Instantly add 15 units to stock via Supabase"
                            >
                              <FaPlus /> +15 Units
                            </button>
                            <button
                              type="button"
                              className="restock-btn"
                              style={{ background: "#0284c7" }}
                              disabled={isUpdating}
                              onClick={() => handleQuickRestock(p, 30)}
                              title="Instantly add 30 units to stock via Supabase"
                            >
                              <FaPlus /> +30 Units
                            </button>
                          </div>
                        </LowStockRow>
                      );
                    })}
                  </div>
                )}
              </LowStockWarningBlock>

              {/* TASK 4: TOP SELLERS - RANKED LIST OF MOST PURCHASED PRODUCTS */}
              <TopSellersSection>
                <div className="section-header">
                  <h4>
                    <FaFire /> Top Sellers (Most Purchased Products)
                  </h4>
                  <span className="badge">Ranked by Total Volume Sold</span>
                </div>

                <div className="top-sellers-list">
                  {topSellersList.slice(0, 10).map((p, index) => {
                    const img = Array.isArray(p.image_url)
                      ? p.image_url[0]
                      : p.image_url || "/Images/placeholder.png";
                    const rank = index + 1;
                    return (
                      <TopSellerRow key={p.id} $rank={rank}>
                        <div className="left-side">
                          <div className="rank-badge">
                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                          </div>
                          <img src={img} alt={p.name} />
                          <div className="meta">
                            <strong>{p.name}</strong>
                            <span>
                              {p.category} • In Vault: <strong>{p.available ?? 0} left</strong>
                            </span>
                          </div>
                        </div>

                        <div className="stats-side">
                          <div className="stat-pill">
                            <div className="units">{p.unitsSold} units purchased</div>
                            <div className="revenue">₦{p.totalSalesRevenue.toLocaleString()} volume</div>
                          </div>
                          {onSelectProduct && (
                            <button
                              type="button"
                              className="select-btn"
                              onClick={() => {
                                onSelectProduct(p);
                                setActiveTab("product");
                              }}
                            >
                              Inspect
                            </button>
                          )}
                        </div>
                      </TopSellerRow>
                    );
                  })}
                </div>
              </TopSellersSection>
            </>
          )}

          {/* TAB 2: SELECTED PRODUCT DEEP DIVE */}
          {activeTab === "product" && product && (
            <>
              {/* Executive KPI Cards */}
              <KpiGrid>
                <KpiCard $color="#f59e0b">
                  <div className="label">
                    <FaStar /> Star Rating
                  </div>
                  <div className="value">{averageRating} / 5.0</div>
                  <div className="sub">
                    Based on {totalReviews} real {totalReviews === 1 ? "review" : "reviews"}
                  </div>
                </KpiCard>

                <KpiCard $color="#2563eb">
                  <div className="label">
                    <FaBoxOpen /> Total Sold
                  </div>
                  <div className="value">{totalUnitsSold} units</div>
                  <div className="sub">Across {matchedOrderItems.length} orders</div>
                </KpiCard>

                <KpiCard $color="#16a34a">
                  <div className="label">
                    <FaChartLine /> Total Revenue
                  </div>
                  <div className="value">₦{totalProductRevenue.toLocaleString()}</div>
                  <div className="sub">Realized sales volume</div>
                </KpiCard>

                <KpiCard $color="#7c2d12">
                  <div className="label">
                    <FaCrown /> Top Variant
                  </div>
                  <div className="value" style={{ fontSize: "1.2rem" }}>
                    {maxUnits > 0 ? topSellingSize : "N/A"}
                  </div>
                  <div className="sub">
                    {maxUnits > 0
                      ? `${maxUnits} units (${Math.round((maxUnits / (totalUnitsSold || 1)) * 100)}% of sales)`
                      : "No sales recorded yet"}
                  </div>
                </KpiCard>
              </KpiGrid>

              {/* Recharts Visualizations */}
              <ChartsGrid>
                <ChartCard>
                  <h4>Units Sold by Size Variant</h4>
                  {sizeChartData.length > 0 ? (
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sizeChartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="size" tick={{ fontSize: 12, fill: "#6b7280" }} />
                          <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} allowDecimals={false} />
                          <Tooltip
                            formatter={(val, name) => [
                              name === "units" ? `${val} units` : `₦${Number(val).toLocaleString()}`,
                              name === "units" ? "Units Sold" : "Revenue",
                            ]}
                            contentStyle={{
                              background: "#ffffff",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="units" fill="#7c2d12" radius={[4, 4, 0, 0]} name="units" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", margin: "40px 0" }}>
                      No size sales data recorded yet.
                    </p>
                  )}
                </ChartCard>

                <ChartCard>
                  <h4>Customer Rating Breakdown</h4>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ratingChartData}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: "#6b7280" }} allowDecimals={false} />
                        <YAxis dataKey="star" type="category" tick={{ fontSize: 12, fill: "#4b5563" }} />
                        <Tooltip
                          formatter={(val) => [`${val} reviews`, "Count"]}
                          contentStyle={{
                            background: "#ffffff",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {ratingChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </ChartsGrid>

              {/* Genuine Backend Customer Reviews List */}
              <ReviewsContainer>
                <h4>
                  Customer Reviews & Feedback
                  <span className="badge">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"} from Postgres
                  </span>
                </h4>

                {reviews.length === 0 ? (
                  <p style={{ color: "#9ca3af", fontSize: "0.88rem", fontStyle: "italic", margin: "16px 0" }}>
                    No reviews submitted for this botanical product yet.
                  </p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((r, i) => {
                      const initial = (r.user_name || "A").trim()[0]?.toUpperCase() || "C";
                      const dateStr = r.created_at
                        ? new Date(r.created_at).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent";
                      return (
                        <ReviewItem key={r.id || i}>
                          <div className="top-row">
                            <div className="user">
                              <div className="avatar">{initial}</div>
                              <span className="name">{r.user_name || "Verified Customer"}</span>
                            </div>
                            <div className="stars">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FaStar
                                  key={s}
                                  style={{
                                    opacity: s <= (r.rating || 5) ? 1 : 0.25,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          {r.title && <p className="title">{r.title}</p>}
                          <p className="body">{r.review}</p>
                          <span className="date">{dateStr}</span>
                        </ReviewItem>
                      );
                    })}
                  </div>
                )}
              </ReviewsContainer>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Overlay>
  );
}
