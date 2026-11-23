import styled from "styled-components";
import { FcGoogle } from "react-icons/fc";
import { useLoginWithOAuth } from "../Features/Authentication/useLoginWithOAuth";

const Container = styled.div`
  margin-top: 2.4rem;
  width: 100%;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid var(--color-grey-200);
  }

  span {
    padding: 0 1.2rem;
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-grey-400);
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  padding: 1.2rem 1.6rem;
  background-color: var(--color-grey-0);
  border: 1.5px solid var(--color-grey-300);
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-grey-50);
    border-color: var(--color-grey-400);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 2rem;
  }
`;

export default function AlternateLogin({ type = "login" }) {
  const { loginWithOAuthMutation: loginWithOAuth } = useLoginWithOAuth();

  return (
    <Container>
      <Divider>
        <span>Or Continue With</span>
      </Divider>
      <GoogleButton type="button" onClick={() => loginWithOAuth()}>
        <FcGoogle />
        <span>{type === "signup" ? "Sign up with Google" : "Sign in with Google"}</span>
      </GoogleButton>
    </Container>
  );
}
