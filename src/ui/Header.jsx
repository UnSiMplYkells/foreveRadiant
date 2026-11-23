import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import Logo from "./Logo";
import MainNav from "./MainNav";
import MiniNav from "./MiniNav";

const StyledHeader = styled.header`
  border-bottom: 1px solid var(--border-color);
  height: auto;
  width: 100%;
  background-color: var(--header-bg);
  backdrop-filter: blur(12px);
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px clamp(12px, 3vw, 36px);
  position: sticky;
  top: 0;

  @media (width > 1000px) {
    gap: 3rem;
  }
`;

const AdminHeaderBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-brown, #7c2d12);

  svg {
    font-size: 1.2rem;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

export default function Header() {
  const location = useLocation();
  const isOnAdmin = location.pathname.startsWith("/admin");

  return (
    <StyledHeader>
      <Logo />
      {!isOnAdmin && <MainNav />}
      {isOnAdmin && (
        <AdminHeaderBadge>
          <MdAdminPanelSettings />
          <span>Admin Control Center</span>
        </AdminHeaderBadge>
      )}
      <MiniNav />
    </StyledHeader>
  );
}
