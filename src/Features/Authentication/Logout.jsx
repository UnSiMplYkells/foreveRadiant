import styled from "styled-components";
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import { useLogout } from "./useLogout";
import MiniLoader from "../../ui/MiniLoader";

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card, #ffffff);
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    font-size: 1.1rem;
    transition: transform 0.2s ease;
  }

  &:hover:not(:disabled) {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #b91c1c;

    svg {
      transform: translateX(2px);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function Logout({ className }) {
  const { logout, isLoading } = useLogout();

  return (
    <LogoutButton
      className={className}
      type="button"
      disabled={isLoading}
      onClick={logout}
      title="Sign out of your account"
    >
      <HiArrowRightOnRectangle />
      <span>{isLoading ? <MiniLoader /> : "Log Out"}</span>
    </LogoutButton>
  );
}
