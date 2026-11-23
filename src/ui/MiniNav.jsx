import { NavLink, useLocation } from "react-router-dom";
import { useUser } from "../Features/Authentication/useUser";
import { useDarkMode } from "../Context/DarkModeContext";
import { IoCart } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import styled from "styled-components";
import Button from "./Button";
import { useCartItem } from "../Features/Cart/useCartItems";

const Li = styled.li`
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 1.5vw, 1.6rem);

  @media (min-width: 1024px) {
    margin-right: 20px;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  position: relative;

  &:link,
  &:visited {
    color: var(--color-grey-700);
    padding: 10px 12px;
    transition: all 0.3s;

    @media (width < 500px) {
      padding: 10px 6px;
    }
  }

  & svg {
    width: clamp(2.2rem, 4vw, 3.2rem);
    height: clamp(2.2rem, 4vw, 3.2rem);
    transition: all 0.3s;
    position: relative;
    top: clamp(0.1rem, 0.4vw, 0.2rem);
    color: var(--text-primary);
  }

  &:hover svg {
    transform: scale(1.15);
  }

  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brown);
  }
`;

const ThemeToggle = styled.button`
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.25s ease;

  &:hover {
    background-color: var(--color-grey-200);
    transform: rotate(20deg) scale(1.08);
  }

  svg {
    width: 2rem;
    height: 2rem;
    color: var(--text-primary);
  }
`;

const AdminPill = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--color-brown);
  color: white !important;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 12px !important;
  border-radius: 9999px;
  letter-spacing: 0.5px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-brown-hover);
    transform: scale(1.05);
  }

  svg {
    width: 1.2rem !important;
    height: 1.2rem !important;
    top: 0 !important;
    color: white !important;
  }
`;

const Img = styled.img`
  width: 44px;
  aspect-ratio: 1;
  border-radius: 100%;
  transition: all 0.3s;
  border: 2px solid var(--border-color);

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 500px) {
    width: 36px;
  }

  @media (min-width: 1024px) {
    width: 50px;
  }
`;

const Bubble = styled.div`
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  color: white;
  background-color: var(--color-brown);
  overflow: hidden;
  position: absolute;
  right: 4px;
  top: 4px;

  @media (max-width: 500px) {
    width: 16px;
    height: 16px;
    font-size: 9px;
  }
`;

export default function MiniNav() {
  const { isAuthenticated, isAdmin, user } = useUser();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const avatar = user?.user_metadata?.avatar;
  const avatarUrlOAuth = user?.user_metadata?.avatar_url;
  const { cartItems } = useCartItem();

  const isOnAdmin = location.pathname.startsWith("/admin");

  return (
    <nav>
      <ul>
        <Li>
          <ThemeToggle
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
          </ThemeToggle>

          {isAuthenticated && isAdmin && !isOnAdmin && (
            <AdminPill to="/admin" title="Admin Dashboard">
              <MdAdminPanelSettings />
              <span>Admin</span>
            </AdminPill>
          )}

          <StyledNavLink to="/cart">
            <IoCart />
            <Bubble>{cartItems?.length || 0}</Bubble>
          </StyledNavLink>

          <StyledNavLink to="/account">
            {isAuthenticated && (avatar || avatarUrlOAuth) ? (
              <Img src={avatar?.avatar || avatarUrlOAuth || ""} alt="User Avatar" />
            ) : (
              <FaUserCircle />
            )}
          </StyledNavLink>

          {!isAuthenticated && (
            <StyledNavLink to="/login">
              <Button size="large">LOGIN</Button>
            </StyledNavLink>
          )}
        </Li>
      </ul>
    </nav>
  );
}
