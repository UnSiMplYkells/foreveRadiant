import styled from "styled-components";
import { useState } from "react";
import { useProducts } from "../../Hooks/useProducts";
import CollectionsMenuItem from "./CollectionsMenuItem";
import Loader from "../../ui/Loader";

const MenuHeading = styled.h2`
  font-weight: 500;
  text-transform: uppercase;
  padding-bottom: 2rem;

  span {
    font-weight: 700;
  }

  @media (width < 500px) {
    padding-bottom: 0.8rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem 0 3rem;
  }

  @media (min-width: 1200px) {
    padding-left: 4rem;
  }
`;

const Div = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 1.5rem;

  select {
    height: fit-content;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    outline: none;
    background: white;
    font-size: 0.95rem;

    &:focus {
      border-color: #7c2d12;
    }
  }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 3.5rem;
  padding: 20px 0;

  button {
    padding: 8px 18px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    color: #374151;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: #7c2d12;
      color: white;
      border-color: #7c2d12;
    }
  }

  span {
    font-size: 0.95rem;
    font-weight: 500;
    color: #4b5563;
  }
`;

export default function CollectionsMenu() {
  const [sorted, setSorted] = useState("All");
  const [page, setPage] = useState(1);

  const {
    products,
    count,
    totalPages,
    currentPage,
    isLoading,
    isFetching,
    error,
  } = useProducts({ page, limit: 12, category: sorted });

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading products: {error.message}</div>;

  function handleCategoryChange(e) {
    setSorted(e.target.value);
    setPage(1); // Reset to first page when filtering
  }

  return (
    <>
      <Div>
        <MenuHeading>
          All <span>collections_</span>
        </MenuHeading>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isFetching && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Refreshing...</span>}
          <select name="sort by category" value={sorted} onChange={handleCategoryChange}>
            <option value="All">All Categories</option>
            <option value="haircare">Haircare</option>
            <option value="skincare">Skincare</option>
            <option value="wellness">Wellness</option>
            <option value="bodycare">Bodycare</option>
          </select>
        </div>
      </Div>

      {!products || products.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
          No products found in this category.
        </p>
      ) : (
        <MenuContainer>
          {products.map((item) => (
            <CollectionsMenuItem key={item.id} item={item} />
          ))}
        </MenuContainer>
      )}

      {totalPages > 1 && (
        <PaginationBar>
          <button
            onClick={() => {
              setPage((prev) => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page <= 1}
          >
            &larr; Previous
          </button>
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({count} items)
          </span>
          <button
            onClick={() => {
              setPage((prev) => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page >= totalPages}
          >
            Next &rarr;
          </button>
        </PaginationBar>
      )}
    </>
  );
}

const MenuContainer = styled.ul`
  display: grid;
  gap: 2.5rem;
  list-style: none;
  padding: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2.5rem;
  }

  @media (min-width: 1280px) {
    max-width: 1350px;
    width: 100%;
    margin: 0 auto;
  }

  @media (min-width: 1536px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;
