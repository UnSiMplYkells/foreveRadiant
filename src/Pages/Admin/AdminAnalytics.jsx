import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useAllOrders } from "../../Hooks/useAllOrders";
import { getProduct } from "../../Services/apiProducts";
import AdminReporting from "../../Features/Admin/AdminReporting";
import Loader from "../../ui/Loader";

const AnalyticsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default function AdminAnalytics() {
  const { orders = [], isLoading: isOrdersLoading } = useAllOrders();

  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["all-products-inventory"],
    queryFn: getProduct,
    staleTime: 60 * 1000,
  });

  if (isOrdersLoading || isProductsLoading) return <Loader />;

  return (
    <AnalyticsPageWrapper>
      <AdminReporting orders={orders} products={allProducts} />
    </AnalyticsPageWrapper>
  );
}
