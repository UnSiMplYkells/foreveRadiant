import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import LoginForm from "../Features/Authentication/LoginForm";
import SignupForm from "../Features/Authentication/SignupForm";
import { HiOutlineArrowLeft, HiOutlineX } from "react-icons/hi";
import { FaShieldAlt, FaLeaf, FaTruck } from "react-icons/fa";

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 1.6rem;
  background-color: var(--color-grey-100);
  background-image: radial-gradient(
    circle at 50% 10%,
    rgba(217, 119, 6, 0.12),
    transparent 65%
  );
  position: relative;
`;

const TopNav = styled.div`
  width: 100%;
  max-width: 580px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.8rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-grey-600);
  transition: all 0.2s ease;

  &:hover {
    color: #d97706;
    transform: translateX(-2px);
  }

  svg {
    font-size: 1.6rem;
  }
`;

const CloseIconButton = styled.button`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-600);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-grey-900);
    border-color: var(--color-grey-400);
    transform: scale(1.05);
  }

  svg {
    font-size: 1.8rem;
  }
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 580px;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 16px;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 3.6rem 3.2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 540px) {
    padding: 2.8rem 2rem;
  }
`;

const BrandHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.6rem;

  .logo-box {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
    text-decoration: none;

    img {
      height: 32px;
      width: auto;
      object-fit: contain;
    }

    h1 {
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--color-grey-900);
      text-transform: uppercase;
      margin: 0;

      span {
        color: #d97706;
      }
    }
  }

  .badge {
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #d97706;
    background: rgba(217, 119, 6, 0.1);
    padding: 0.3rem 1rem;
    border-radius: 999px;
  }
`;

const SegmentedTabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: var(--color-grey-100);
  border: 1px solid var(--color-grey-200);
  border-radius: 10px;
  padding: 0.4rem;
  margin-bottom: 2.8rem;
`;

const TabButton = styled.button`
  background: ${(props) => (props.active ? "var(--color-grey-0)" : "transparent")};
  color: ${(props) => (props.active ? "var(--color-grey-900)" : "var(--color-grey-500)")};
  border: none;
  border-radius: 7px;
  padding: 1rem;
  font-size: 1.4rem;
  font-weight: ${(props) => (props.active ? "700" : "500")};
  cursor: pointer;
  box-shadow: ${(props) =>
    props.active ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none"};
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-grey-900);
  }
`;

const TrustFooter = styled.div`
  margin-top: 2.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid var(--color-grey-200);

  .trust-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-grey-500);

    svg {
      color: #d97706;
      font-size: 1.4rem;
    }
  }
`;

export default function Login({ defaultTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab =
    defaultTab || (location.pathname === "/signup" ? "signup" : "login");
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <PageWrapper>
      <TopNav>
        <BackLink to="/home">
          <HiOutlineArrowLeft /> Return to Store
        </BackLink>
        <CloseIconButton onClick={() => navigate("/home")} title="Close">
          <HiOutlineX />
        </CloseIconButton>
      </TopNav>

      <AuthCard>
        <BrandHeader>
          <Link to="/home" className="logo-box">
            <img src="/Images/logo1.png" alt="Forever Radiant" />
            <h1>
              Forever <span>Radiant</span>
            </h1>
          </Link>
          <div className="badge">Botanical Luxury Sanctuary</div>
        </BrandHeader>

        <SegmentedTabs>
          <TabButton
            type="button"
            active={activeTab === "login"}
            onClick={() => setActiveTab("login")}
          >
            Sign In
          </TabButton>
          <TabButton
            type="button"
            active={activeTab === "signup"}
            onClick={() => setActiveTab("signup")}
          >
            Create Account
          </TabButton>
        </SegmentedTabs>

        {activeTab === "login" ? (
          <LoginForm />
        ) : (
          <SignupForm setActiveTab={setActiveTab} />
        )}

        <TrustFooter>
          <div className="trust-item">
            <FaLeaf /> 100% Organic Purity
          </div>
          <div className="trust-item">
            <FaShieldAlt /> Enterprise Secure
          </div>
          <div className="trust-item">
            <FaTruck /> Concurrency-Protected
          </div>
        </TrustFooter>
      </AuthCard>
    </PageWrapper>
  );
}
