import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaShoppingBag, FaShieldAlt } from "react-icons/fa";
import { useUser } from "../Features/Authentication/useUser";
import Logout from "../Features/Authentication/Logout";
import UpdateUserDetails from "../Features/Authentication/UpdateUserDetails";
import UpdateUserPassword from "../Features/Authentication/UpdateUserPassword";

const AccountWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 16px 16px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const ProfileHeroCard = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  padding: clamp(20px, 3.5vw, 30px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const UserIntro = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;

  .avatar-frame {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    overflow: hidden;
    background: #fef3c7;
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

    .initials {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--color-brown, #7c2d12);
    }
  }

  .meta {
    h2 {
      margin: 0 0 4px;
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .email {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-grey-500, #6b7280);
    }
  }
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 9999px;
  background: ${(props) => (props.$isAdmin ? "#fef3c7" : "var(--bg-surface-soft, #f3f4f6)")};
  color: ${(props) => (props.$isAdmin ? "#78350f" : "var(--text-primary, #4b5563)")};
  border: 1px solid ${(props) => (props.$isAdmin ? "#fde68a" : "var(--border-color, #e5e7eb)")};
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const OrdersButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface-soft, #f8f9fa);
  color: var(--text-primary, #374151);
  border: 1px solid var(--border-color, #d1d5db);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;

  svg {
    color: var(--color-brown, #7c2d12);
    font-size: 0.95rem;
  }

  &:hover {
    background: var(--color-brown, #7c2d12);
    color: #ffffff;
    border-color: var(--color-brown, #7c2d12);

    svg {
      color: #ffffff;
    }
  }
`;

const SectionsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export default function Account() {
  const { user } = useUser();
  const fullName =
    user?.user_metadata?.fullName ||
    user?.user_metadata?.full_name ||
    "Valued Customer";
  const avatarUrl =
    user?.user_metadata?.avatar?.avatar ||
    user?.user_metadata?.avatar_url ||
    "";
  const isAdmin =
    user?.user_metadata?.role === "admin" ||
    user?.email === "admin@foreverradiance.com";

  const initial = (fullName.trim().charAt(0) || "U").toUpperCase();

  return (
    <AccountWrapper>
      {/* Profile Overview Card */}
      <ProfileHeroCard>
        <UserIntro>
          <div className="avatar-frame">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `<span class="initials">${initial}</span>`;
                }}
              />
            ) : (
              <span className="initials">{initial}</span>
            )}
          </div>

          <div className="meta">
            <h2>
              {fullName}
              <RoleBadge $isAdmin={isAdmin}>
                {isAdmin ? (
                  <>
                    <FaShieldAlt style={{ fontSize: "0.7rem" }} /> Store Admin
                  </>
                ) : (
                  "Customer Account"
                )}
              </RoleBadge>
            </h2>
            <p className="email">{user?.email || "Registered Client"}</p>
          </div>
        </UserIntro>

        <TopActions>
          <OrdersButton to="/order" title="View your order history and live tracking">
            <FaShoppingBag />
            <span>My Orders</span>
          </OrdersButton>
          <Logout />
        </TopActions>
      </ProfileHeroCard>

      {/* Main Account Details & Security Cards */}
      <SectionsStack>
        <UpdateUserDetails />
        <UpdateUserPassword />
      </SectionsStack>
    </AccountWrapper>
  );
}
