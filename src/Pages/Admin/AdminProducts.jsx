import { useState } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { FaCrown, FaPlus } from "react-icons/fa";
import { useProducts } from "../../Hooks/useProducts";
import { useDeleteProduct } from "../../Hooks/useDeleteProduct";
import { useUpdateProduct } from "../../Hooks/useUpdateProduct";
import { useAllOrders } from "../../Hooks/useAllOrders";
import { getProduct } from "../../Services/apiProducts";
import ProductFormModal from "../../Features/Admin/ProductFormModal";
import ProductInsightsModal from "../../Features/Admin/ProductInsightsModal";
import Loader from "../../ui/Loader";

const ProductsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;

  .search-input {
    padding: 10px 14px;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 6px;
    font-size: 0.9rem;
    width: 100%;
    max-width: 340px;
    outline: none;
    background: var(--bg-card, #ffffff);
    color: var(--text-primary, #111827);

    &:focus {
      border-color: var(--color-brown, #7c2d12);
    }
  }

  .category-select {
    padding: 10px 14px;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 6px;
    font-size: 0.9rem;
    background: var(--bg-card, #ffffff);
    color: var(--text-primary, #111827);
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: var(--color-brown, #7c2d12);
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${(props) => props.$bg || "var(--color-brown, #7c2d12)"};
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
    background: ${(props) => props.$hoverBg || "#5c200c"};
    transform: translateY(-1px);
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
    font-size: 0.9rem;
    color: var(--text-primary, #1f2937);
  }

  tr:hover {
    background: var(--bg-surface-soft, #f9fafb);
  }
`;

const ProductThumb = styled.img`
  width: 46px;
  height: 46px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 700;
  background: ${(props) => props.$bg || "#f3f4f6"};
  color: ${(props) => props.$color || "#374151"};
  text-transform: capitalize;
`;

const StockController = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg-card, #ffffff);

  button {
    background: transparent;
    border: none;
    padding: 4px 10px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    color: var(--text-primary, #374151);
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: var(--color-grey-100, #e5e7eb);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  span {
    padding: 4px 10px;
    font-weight: 600;
    min-width: 32px;
    text-align: center;
    font-size: 0.88rem;
    color: var(--text-primary, #111827);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  button {
    padding: 6px 12px;
    border-radius: 5px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
  }

  .insights-btn {
    background: #fef3c7;
    color: #92400e;
    border-color: #fde68a;

    &:hover {
      background: #fde68a;
    }
  }

  .edit-btn {
    background: var(--bg-surface-soft, #f3f4f6);
    color: var(--text-primary, #374151);
    border-color: var(--border-color, #d1d5db);

    &:hover {
      background: var(--color-grey-200, #e5e7eb);
    }
  }

  .delete-btn {
    background: #fee2e2;
    color: #b91c1c;
    border-color: #fecaca;

    &:hover {
      background: #fca5a5;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--bg-surface-soft, #f9fafb);
  border-top: 1px solid var(--border-color, #e5e7eb);

  button {
    padding: 6px 14px;
    border: 1px solid var(--border-color, #d1d5db);
    background: var(--bg-card, #ffffff);
    color: var(--text-primary, #374151);
    border-radius: 5px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) {
      background: var(--color-brown, #7c2d12);
      color: white;
      border-color: var(--color-brown, #7c2d12);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
`;

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedProductForInsights, setSelectedProductForInsights] = useState(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const {
    products,
    count: totalCount,
    totalPages,
    isLoading: isProductsLoading,
  } = useProducts({ page, limit: 10, category, search: searchTerm });

  const { data: allStoreProducts = [] } = useQuery({
    queryKey: ["all-products-inventory"],
    queryFn: getProduct,
    staleTime: 60 * 1000,
  });

  const { removeProduct, isDeleting } = useDeleteProduct();
  const { editProduct } = useUpdateProduct();
  const { orders } = useAllOrders();

  const effectiveAllProducts = allStoreProducts.length > 0 ? allStoreProducts : products;

  function handleOpenCreate() {
    setProductToEdit(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(product) {
    setProductToEdit(product);
    setIsModalOpen(true);
  }

  function handleDelete(productId, productName) {
    if (window.confirm(`Are you sure you want to permanently delete "${productName}"?`)) {
      removeProduct(productId);
    }
  }

  function handleStockQuickAdjust(product, delta) {
    const currentStock = product.available ?? 0;
    const newStock = Math.max(0, currentStock + delta);
    if (newStock === currentStock) return;

    editProduct({
      productId: product.id,
      productData: {
        name: product.name,
        price: product.price,
        available: newStock,
        category: product.category,
        description: product.description || "N/A",
        discount: product.discount ?? 0,
        image_url: Array.isArray(product.image_url) ? product.image_url : [product.image_url],
      },
    });
  }

  return (
    <ProductsPageWrapper>
      <TopActionBar>
        <FilterGroup>
          <input
            type="text"
            placeholder="Search products by title..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "0.88rem", color: "var(--color-grey-600, #4b5563)", fontWeight: "500" }}>
              Category:
            </span>
            <select
              className="category-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Categories</option>
              <option value="skincare">Skincare</option>
              <option value="haircare">Haircare</option>
              <option value="bodycare">Bodycare</option>
              <option value="wellness">Wellness</option>
              <option value="fragrance">Fragrance</option>
            </select>
          </div>
        </FilterGroup>

        <HeaderActions>
          <ActionButton
            $bg="#0284c7"
            $hoverBg="#0369a1"
            type="button"
            onClick={() => {
              setSelectedProductForInsights(effectiveAllProducts[0] || null);
              setIsInsightsOpen(true);
            }}
            title="Open Storefront Inventory Intelligence"
          >
            <FaCrown /> Inventory Intelligence
          </ActionButton>

          <ActionButton type="button" onClick={handleOpenCreate}>
            <FaPlus /> + Add New Product
          </ActionButton>
        </HeaderActions>
      </TopActionBar>

      <TableContainer>
        {isProductsLoading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            No products found matching the criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Discount</th>
                  <th>Stock Units</th>
                  <th>Inventory Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const firstImage = Array.isArray(p.image_url) ? p.image_url[0] : p.image_url;
                  const stock = p.available ?? 0;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
                          onClick={() => {
                            setSelectedProductForInsights(p);
                            setIsInsightsOpen(true);
                          }}
                          title="Click to view product analytics and reviews"
                        >
                          <ProductThumb
                            src={firstImage || "/Images/placeholder.png"}
                            alt={p.name}
                            onError={(e) => {
                              e.target.src = "/Images/darklogo.png";
                            }}
                          />
                          <div>
                            <strong style={{ display: "block", color: "var(--text-primary, #111827)" }}>
                              {p.name}
                            </strong>
                            <span style={{ fontSize: "0.78rem", color: "var(--color-grey-500, #6b7280)" }}>
                              ID: #{p.id} •{" "}
                              <span style={{ color: "var(--color-brown, #7c2d12)", textDecoration: "underline" }}>
                                View Insights
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge $bg="var(--bg-surface-soft, #f3f4f6)" $color="var(--text-primary, #4b5563)">
                          {p.category || "General"}
                        </Badge>
                      </td>
                      <td>
                        <strong style={{ color: "var(--text-primary, #111827)" }}>
                          ₦{Number(p.price).toLocaleString()}
                        </strong>
                      </td>
                      <td>{p.discount ? `${p.discount}%` : "None"}</td>
                      <td>
                        <StockController>
                          <button
                            type="button"
                            onClick={() => handleStockQuickAdjust(p, -1)}
                            disabled={stock <= 0}
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <span>{stock}</span>
                          <button
                            type="button"
                            onClick={() => handleStockQuickAdjust(p, 1)}
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                        </StockController>
                      </td>
                      <td>
                        {stock >= 10 ? (
                          <Badge $bg="#dcfce7" $color="#15803d">
                            In Stock
                          </Badge>
                        ) : stock > 0 ? (
                          <Badge $bg="#fef9c3" $color="#a16207">
                            Low Stock ({stock})
                          </Badge>
                        ) : (
                          <Badge $bg="#fee2e2" $color="#b91c1c">
                            Out of Stock
                          </Badge>
                        )}
                      </td>
                      <td>
                        <ActionButtons>
                          <button
                            className="insights-btn"
                            type="button"
                            onClick={() => {
                              setSelectedProductForInsights(p);
                              setIsInsightsOpen(true);
                            }}
                            title="Product sales and review insights"
                          >
                            Insights
                          </button>
                          <button
                            className="edit-btn"
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit product details"
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={isDeleting}
                            title="Delete product"
                          >
                            Delete
                          </button>
                        </ActionButtons>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}

        <Pagination>
          <span style={{ fontSize: "0.88rem", color: "var(--color-grey-600, #6b7280)" }}>
            Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong> ({totalCount} total items)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              &larr; Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
            >
              Next &rarr;
            </button>
          </div>
        </Pagination>
      </TableContainer>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
      />

      <ProductInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => {
          setIsInsightsOpen(false);
          setSelectedProductForInsights(null);
        }}
        product={selectedProductForInsights}
        allProducts={effectiveAllProducts}
        allOrders={orders}
        onEditProduct={(p) => {
          handleOpenEdit(p);
        }}
        onSelectProduct={(p) => {
          setSelectedProductForInsights(p);
        }}
      />
    </ProductsPageWrapper>
  );
}
