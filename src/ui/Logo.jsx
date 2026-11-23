import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useDarkMode } from "../Context/DarkModeContext";

const StyledImg = styled.img`
  height: clamp(6rem, 5vw, 8.5rem);
  max-width: 35rem;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s ease;

  @media (max-width: 768px) {
    height: 5.5rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  height: 100%;
`;

export default function Logo() {
  const { isDarkMode } = useDarkMode();

  return (
    <StyledNavLink to="/home">
      <StyledImg
        src={isDarkMode ? "/Images/darklogo.png" : "https://dncqfwbhphbhudkwerlt.supabase.co/storage/v1/object/public/ui-images/logo1.png"}
        alt="Forever Radiant Logo"
        onError={(e) => {
          e.target.src = "/Images/logo1.png";
        }}
      />
    </StyledNavLink>
  );
}
