import { NavLink, useLocation } from "react-router-dom";
import { useUser } from "../Features/Authentication/useUser";
import { IoIosHome } from "react-icons/io";
import { MdCollections, MdOutlineReceiptLong } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { HiOutlinePhone } from "react-icons/hi2";
import styled from "styled-components";

const StyledNav = styled.nav`
  display: flex;
  align-items: center;
  flex-shrink: 1;
  min-width: 0;
`;

const StyledUl = styled.ul`
  display: flex;
  align-items: center;
  gap: clamp(0.4rem, 1vw, 1.2rem);
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: nowrap;
`;

const StyledNavLink = styled(NavLink)`
  font-size: clamp(1.2rem, 1.1vw, 1.5rem);
  font-weight: 500;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--text-secondary);
  padding: 0.7rem clamp(0.6rem, 1vw, 1.4rem);
  border-radius: var(--border-radius-sm, 8px);
  transition: all 0.2s ease;

  &:link,
  &:visited {
    color: var(--text-secondary);
  }

  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-brown, #d97706);
    background-color: var(--bg-surface-soft, rgba(217, 119, 6, 0.08));
  }

  & svg {
    font-size: clamp(1.4rem, 1.3vw, 1.8rem);
    color: inherit;
    transition: transform 0.2s ease, color 0.2s ease;
    flex-shrink: 0;
  }

  &:hover svg,
  &.active svg {
    transform: translateY(-1px);
    color: var(--color-brown, #d97706);
  }

  @media (max-width: 900px) {
    padding: 0.6rem 0.8rem;
    font-size: 1.2rem;

    & svg {
      display: none;
    }
  }

  @media (max-width: 500px) {
    padding: 0.5rem 0.6rem;
    font-size: 1.1rem;
  }
`;

const DesktopOnlyLi = styled.li`
  @media (max-width: 768px) {
    display: none;
  }
`;

export default function MainNav() {
  const { isAuthenticated } = useUser();
  const location = useLocation();

  function handleContactClick(e) {
    const el = document.getElementById("contact");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <StyledNav aria-label="Main Navigation">
      <StyledUl>
        {/* Core links always visible in header on all devices: Home & Collection */}
        <li>
          <StyledNavLink to="/home">
            <span>Home</span>
            <IoIosHome />
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="/collection">
            <span>Collection</span>
            <MdCollections />
          </StyledNavLink>
        </li>

        {/* Secondary links visible on desktop; on mobile housed inside hamburger */}
        {!isAuthenticated ? (
          <>
            <DesktopOnlyLi>
              <StyledNavLink to="/about">
                <span>About Us</span>
                <FaCircleInfo />
              </StyledNavLink>
            </DesktopOnlyLi>
            <DesktopOnlyLi>
              <StyledNavLink
                to={location.pathname === "/home" ? "#contact" : "/home#contact"}
                onClick={handleContactClick}
              >
                <span>Contact Us</span>
                <HiOutlinePhone />
              </StyledNavLink>
            </DesktopOnlyLi>
          </>
        ) : (
          <DesktopOnlyLi>
            <StyledNavLink to="/order">
              <span>Orders</span>
              <MdOutlineReceiptLong />
            </StyledNavLink>
          </DesktopOnlyLi>
        )}
      </StyledUl>
    </StyledNav>
  );
}
