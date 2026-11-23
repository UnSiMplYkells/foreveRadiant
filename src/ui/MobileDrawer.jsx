import { useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  FaTimes,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaShieldAlt,
  FaStore,
  FaInfoCircle,
} from "react-icons/fa";
import { IoCart } from "react-icons/io5";
import { HiOutlinePhone } from "react-icons/hi2";
import { MdOutlineReceiptLong, MdAdminPanelSettings } from "react-icons/md";
import { useLogout } from "../Features/Authentication/useLogout";

const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 99998;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
  transition: opacity 0.25s ease, visibility 0.25s ease;
`;

const DrawerContainer = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  height: 100dvh;
  width: 86vw;
  max-width: 360px;
  background: var(--bg-card, #ffffff);
  border-left: 1px solid var(--border-color, #e5e7eb);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.2);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  transform: ${(props) => (props.$isOpen ? "translateX(0)" : "translateX(100%)")};
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s;
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
  overflow-y: auto;
  box-sizing: border-box;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-surface-soft, #f9fafb);
  position: sticky;
  top: 0;
  z-index: 10;

  .brand-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  button {
    background: transparent;
    border: none;
    font-size: 1.4rem;
    color: var(--color-grey-500, #6b7280);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      color: var(--text-primary, #111827);
      background: var(--color-grey-200, #e5e7eb);
    }
  }
`;

const DrawerBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .section-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--color-grey-500, #6b7280);
    margin-bottom: 2px;
  }
`;

const UserCard = styled.div`
  background: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;

  .avatar-frame {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    background: #fde68a;
    border: 2px solid var(--color-brown, #7c2d12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .initial {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--color-brown, #7c2d12);
    }
  }

  .meta {
    overflow: hidden;

    h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      margin: 2px 0 0;
      font-size: 0.78rem;
      color: var(--color-grey-500, #6b7280);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const NavItemLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--bg-surface-soft, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-primary, #1f2937);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;
  transition: all 0.2s ease;

  .left-group {
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
      font-size: 1.25rem;
      color: var(--color-brown, #7c2d12);
    }
  }

  .badge {
    background: var(--color-brown, #7c2d12);
    color: white;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 9999px;
  }

  &:hover,
  &.active {
    background: var(--color-grey-200, #f3f4f6);
    border-color: var(--color-brown, #7c2d12);
    color: var(--color-brown, #7c2d12);
  }
`;

const ModeToggleCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--bg-surface-soft, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);

  .label-group {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text-primary, #1f2937);

    svg {
      font-size: 1.25rem;
      color: var(--color-brown, #7c2d12);
    }
  }

  button {
    background: var(--bg-card, #ffffff);
    border: 1px solid var(--border-color, #d1d5db);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-primary, #374151);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;

    &:hover {
      border-color: var(--color-brown, #7c2d12);
      color: var(--color-brown, #7c2d12);
    }
  }
`;

const PrimaryLoginButton = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-brown, #7c2d12);
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: var(--color-brown-hover, #5c200c);
  }
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
  }
`;

export default function MobileDrawer({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  isAdmin,
  isOnAdmin,
  isDarkMode,
  toggleDarkMode,
  cartItems = [],
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isPending: isLoggingOut } = useLogout();

  // Close drawer on escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const fullName =
    user?.user_metadata?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Customer";
  const email = user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar?.avatar || user?.user_metadata?.avatar_url || "";
  const initial = (fullName.trim().charAt(0) || "U").toUpperCase();

  function handleContactClick(e) {
    onClose();
    if (location.pathname === "/home") {
      const el = document.getElementById("contact");
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/home#contact");
    }
  }

  function handleLogout() {
    onClose();
    logout();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <DrawerOverlay $isOpen={isOpen} onClick={onClose} aria-hidden="true" />
      <DrawerContainer $isOpen={isOpen} aria-label="Mobile Navigation Menu">
        <DrawerHeader>
          <span className="brand-title">Forever Radiant</span>
          <button type="button" onClick={onClose} aria-label="Close navigation menu">
            <FaTimes />
          </button>
        </DrawerHeader>

        <DrawerBody>
          {/* 1. APPEARANCE (MODE TOGGLE) */}
          <SectionBlock>
            <span className="section-label">Appearance</span>
            <ModeToggleCard>
              <div className="label-group">
                {isDarkMode ? <FaSun style={{ color: "#f59e0b" }} /> : <FaMoon style={{ color: "#4f46e5" }} />}
                <span>{isDarkMode ? "Dark Theme" : "Light Theme"}</span>
              </div>
              <button type="button" onClick={toggleDarkMode}>
                {isDarkMode ? "Switch Light" : "Switch Dark"}
              </button>
            </ModeToggleCard>
          </SectionBlock>

          {/* 2. CART (STOREFRONT ONLY) */}
          {!isOnAdmin && (
            <SectionBlock>
              <span className="section-label">Shopping Cart</span>
              <NavItemLink to="/cart" onClick={onClose}>
                <div className="left-group">
                  <IoCart />
                  <span>My Cart</span>
                </div>
                <span className="badge">{cartItems.length} items</span>
              </NavItemLink>
            </SectionBlock>
          )}

          {/* 3. PROFILE / ACCOUNT SECTION */}
          <SectionBlock>
            <span className="section-label">Account &amp; Security</span>
            {isAuthenticated ? (
              <>
                <UserCard>
                  <div className="avatar-frame">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName} />
                    ) : (
                      <span className="initial">{initial}</span>
                    )}
                  </div>
                  <div className="meta">
                    <h4>{fullName}</h4>
                    <p>{email}</p>
                  </div>
                </UserCard>

                {/* Profile Links */}
                {!isOnAdmin && (
                  <>
                    <NavItemLink to="/account" onClick={onClose}>
                      <div className="left-group">
                        <FaUserCircle />
                        <span>My Profile &amp; Settings</span>
                      </div>
                    </NavItemLink>

                    <NavItemLink to="/order" onClick={onClose}>
                      <div className="left-group">
                        <MdOutlineReceiptLong />
                        <span>My Orders</span>
                      </div>
                    </NavItemLink>
                  </>
                )}

                {/* Admin Mode Profile Link */}
                {isOnAdmin && (
                  <>
                    <NavItemLink to="/admin/profile" onClick={onClose}>
                      <div className="left-group">
                        <FaShieldAlt />
                        <span>Admin Profile</span>
                      </div>
                    </NavItemLink>

                    <NavItemLink to="/home" onClick={onClose}>
                      <div className="left-group">
                        <FaStore />
                        <span>View Storefront</span>
                      </div>
                    </NavItemLink>
                  </>
                )}

                {/* If Admin browsing Storefront, link to Admin Portal */}
                {!isOnAdmin && isAdmin && (
                  <NavItemLink to="/admin" onClick={onClose}>
                    <div className="left-group">
                      <MdAdminPanelSettings />
                      <span>Admin Management Portal</span>
                    </div>
                  </NavItemLink>
                )}

                <LogoutBtn type="button" disabled={isLoggingOut} onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </LogoutBtn>
              </>
            ) : (
              <PrimaryLoginButton to="/login" onClick={onClose}>
                <FaUserCircle />
                <span>Sign In / Create Account</span>
              </PrimaryLoginButton>
            )}
          </SectionBlock>

          {/* 4. CONTACT US & ABOUT US (ESPECIALLY FOR SIGNED OUT USERS) */}
          {!isOnAdmin && (
            <SectionBlock>
              <span className="section-label">Support &amp; Information</span>
              <NavItemLink
                to="/home#contact"
                onClick={handleContactClick}
              >
                <div className="left-group">
                  <HiOutlinePhone />
                  <span>Contact Us</span>
                </div>
              </NavItemLink>

              <NavItemLink to="/about" onClick={onClose}>
                <div className="left-group">
                  <FaInfoCircle />
                  <span>About Our Formulas</span>
                </div>
              </NavItemLink>
            </SectionBlock>
          )}
        </DrawerBody>
      </DrawerContainer>
    </>,
    document.body
  );
}
