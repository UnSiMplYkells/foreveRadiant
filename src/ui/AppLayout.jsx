import styled from "styled-components";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Main = styled.main`
  position: relative;
  padding: 1.5rem clamp(1rem, 3vw, 3rem) 4rem;
  flex: 1;
  background-color: var(--bg-main);
  color: var(--text-primary);
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 500px) {
    padding: 1.2rem 1.2rem 3.5rem;
  }
`;

const Div = styled.div`
  max-width: 1700px;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
  box-sizing: border-box;
  overflow-x: hidden;
`;

export default function AppLayout() {
  const location = useLocation();
  const hideFooter =
    location.pathname.includes("/account") || location.pathname.startsWith("/admin");

  return (
    <Div>
      <Header />
      <Main>
        <Outlet />
      </Main>
      {!hideFooter && <Footer />}
    </Div>
  );
}
