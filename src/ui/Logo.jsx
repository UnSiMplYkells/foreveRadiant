import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useDarkMode } from "../Context/DarkModeContext";

const StyledImg = styled.img`
  height: clamp(4.5rem, 4vw, 7.5rem);
  max-width: 26rem;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s ease;

  @media (max-width: 768px) {
    height: 3.8rem;
    max-width: 13rem;
  }

  @media (max-width: 480px) {
    height: 3.2rem;
    max-width: 10.5rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  height: 100%;
  flex-shrink: 0;
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
