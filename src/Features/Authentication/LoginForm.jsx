import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styled from "styled-components";
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail } from "react-icons/hi";
import { useLogin } from "./useLogin";
import { resetPassword } from "../../Services/apiAuth";
import { loginSchema } from "../../Validation/schemas";
import CustomInput from "../../ui/CustomInput";
import AlternateLogin from "../../ui/AlternateLogin";
import MiniLoader from "../../ui/MiniLoader";
import toast from "react-hot-toast";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--color-grey-900);
    letter-spacing: -0.02em;
    margin-bottom: 0.6rem;
  }

  p {
    font-size: 1.4rem;
    color: var(--color-grey-500);
  }
`;

const OptionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.4rem;
  margin-bottom: 2.2rem;
  font-size: 1.3rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--color-grey-600);
    cursor: pointer;
    user-select: none;

    input {
      accent-color: #d97706;
      width: 1.6rem;
      height: 1.6rem;
      cursor: pointer;
    }
  }

  button.forgot-btn {
    background: transparent;
    border: none;
    color: #d97706;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-size: 1.3rem;
    transition: color 0.15s ease;

    &:hover {
      color: #b45309;
      text-decoration: underline;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.4rem;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 4.8rem;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(217, 119, 6, 0.4);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`;

const DemoAccountsSection = styled.div`
  margin-top: 2rem;
  padding: 1.4rem;
  background-color: var(--color-grey-50);
  border: 1px dashed var(--color-grey-300);
  border-radius: 8px;
  text-align: center;

  p {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-grey-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.8rem;
  }

  .pills {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    flex-wrap: wrap;
  }
`;

const DemoPill = styled.button`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-300);
  color: var(--color-grey-700);
  border-radius: 999px;
  padding: 0.4rem 1.2rem;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #d97706;
    border-color: #d97706;
    color: #ffffff;
  }
`;

const ResetModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: fadeIn 0.2s ease;

  .modal-card {
    background: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
    border-radius: 12px;
    padding: 2.8rem;
    max-width: 440px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    h3 {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--color-grey-900);
      margin-bottom: 0.8rem;
    }

    p {
      font-size: 1.4rem;
      color: var(--color-grey-600);
      line-height: 1.5;
      margin-bottom: 1.8rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const { login, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data) {
    login({ email: data.email, password: data.password });
  }

  async function handleSendReset(e) {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsResetting(true);
      await resetPassword(resetEmail);
      toast.success("Password reset instructions sent to your email!");
      setIsResetOpen(false);
      setResetEmail("");
    } catch (err) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setIsResetting(false);
    }
  }

  function fillDemo(email, pass) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    toast("Demo credentials filled — click Sign In!", { icon: "✨" });
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader>
          <h2>Welcome Back</h2>
          <p>Sign in to access your curated ritual & order history</p>
        </FormHeader>

        <CustomInput
          id="email"
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          disabled={isLoading}
          error={errors.email?.message}
          {...register("email")}
          actionSlot={<HiOutlineMail />}
        />

        <CustomInput
          id="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Enter your password"
          disabled={isLoading}
          error={errors.password?.message}
          {...register("password")}
          actionSlot={
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </span>
          }
        />

        <OptionsRow>
          <label htmlFor="rememberMe">
            <input type="checkbox" id="rememberMe" defaultChecked />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="forgot-btn"
            onClick={() => setIsResetOpen(true)}
          >
            Forgot password?
          </button>
        </OptionsRow>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <MiniLoader /> : "Sign In to Sanctuary"}
        </SubmitButton>

        {/* DEMO QUICK-FILL FOR EASY TESTING */}
        <DemoAccountsSection>
          <p>Quick 1-Click Test Access</p>
          <div className="pills">
            <DemoPill
              type="button"
              onClick={() => fillDemo("admin@foreverradiant.com", "Password123!")}
              title="Sign in with Admin Dashboard access"
            >
              👑 Admin (admin@foreverradiant.com)
            </DemoPill>
            <DemoPill
              type="button"
              onClick={() => fillDemo("customer@foreverradiant.com", "Password123!")}
              title="Sign in as a standard Customer"
            >
              🌿 Customer (customer@foreverradiant.com)
            </DemoPill>
          </div>
        </DemoAccountsSection>

        <AlternateLogin type="login" />
      </Form>

      {/* PASSWORD RESET MODAL */}
      {isResetOpen && (
        <ResetModal onClick={() => setIsResetOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Your Password</h3>
            <p>
              Enter the email associated with your Forever Radiant account. We will
              send you a secure link to reset your password.
            </p>

            <CustomInput
              id="reset-email"
              type="email"
              label="Account Email"
              placeholder="you@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={isResetting}
            />

            <div className="modal-actions">
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-grey-300)",
                  borderRadius: "6px",
                  padding: "0.8rem 1.6rem",
                  cursor: "pointer",
                  color: "var(--color-grey-700)",
                  fontSize: "1.3rem",
                }}
                onClick={() => setIsResetOpen(false)}
                disabled={isResetting}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  background: "#d97706",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.8rem 1.8rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "1.3rem",
                }}
                onClick={handleSendReset}
                disabled={isResetting}
              >
                {isResetting ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </ResetModal>
      )}
    </>
  );
}
