import { NavLink, Outlet, Link } from "react-router-dom";
import styled from "styled-components";
import {
  FaTachometerAlt,
  FaBoxes,
  FaShippingFast,
  FaChartLine,
  FaUserShield,
  FaStore,
} from "react-icons/fa";
import { useAllOrders } from "../../Hooks/useAllOrders";

const LayoutWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px 60px;
`;

const AdminTopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);

  .title-group {
    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary, #1f2937);
      margin: 0;

      span {
        color: var(--color-brown, #7c2d12);
      }
    }

    p {
      margin: 4px 0 0;
      color: var(--color-grey-500, #6b7280);
      font-size: 0.92rem;
    }
  }
`;

const AdminNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  border-bottom: 2px solid var(--border-color, #e5e7eb);
  padding-bottom: 2px;
`;

const AdminTabLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-grey-600, #4b5563);
  text-decoration: none;
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: all 0.2s ease;

  svg {
    font-size: 1rem;
    color: var(--color-grey-500, #6b7280);
    transition: color 0.2s;
  }

  &:hover {
    color: var(--color-brown, #7c2d12);
    background: var(--bg-surface-soft, #f8f9fa);

    svg {
      color: var(--color-brown, #7c2d12);
    }
  }

  &.active {
    color: var(--color-brown, #7c2d12);
    background: var(--bg-card, #ffffff);
    border-bottom: 3px solid var(--color-brown, #7c2d12);
    margin-bottom: -2px;

    svg {
      color: var(--color-brown, #7c2d12);
    }
  }
`;

const NavBadge = styled.span`
  background: ${(props) => props.$bg || "#ef4444"};
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 9999px;
  margin-left: 2px;
`;

const StorefrontLink = styled(Link)`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-brown, #7c2d12);
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 6px;
  background: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-brown, #7c2d12);
    color: white;
    border-color: var(--color-brown, #7c2d12);
  }

  @media (max-width: 680px) {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
`;

export default function AdminLayout() {
  const { orders } = useAllOrders();
  const pendingOrdersCount = orders.filter(
    (o) => String(o.status || "").toLowerCase() === "pending"
  ).length;

  return (
    <LayoutWrapper>
      <AdminTopHeader>
        <div className="title-group">
          <h1>
            Admin <span>Management Portal_</span>
          </h1>
          <p>Enterprise catalog control, order fulfillment pipeline, and financial intelligence</p>
        </div>
      </AdminTopHeader>

      <AdminNav>
        <AdminTabLink to="/admin" end>
          <FaTachometerAlt />
          <span>Overview</span>
        </AdminTabLink>

        <AdminTabLink to="/admin/products">
          <FaBoxes />
          <span>Products Management</span>
        </AdminTabLink>

        <AdminTabLink to="/admin/orders">
          <FaShippingFast />
          <span>Orders &amp; Fulfillment</span>
          {pendingOrdersCount > 0 && <NavBadge title={`${pendingOrdersCount} pending orders`}>{pendingOrdersCount}</NavBadge>}
        </AdminTabLink>

        <AdminTabLink to="/admin/analytics">
          <FaChartLine />
          <span>Visual Analytics</span>
        </AdminTabLink>

        <AdminTabLink to="/admin/profile">
          <FaUserShield />
          <span>Admin Profile</span>
        </AdminTabLink>

        <StorefrontLink to="/home" title="Return to customer store">
          <FaStore />
          <span>View Storefront &rarr;</span>
        </StorefrontLink>
      </AdminNav>

      <Outlet />
    </LayoutWrapper>
  );
}
