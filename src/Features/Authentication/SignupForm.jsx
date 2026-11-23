import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
} from "react-icons/hi";
import { useSignup } from "./useSignup";
import { userRegistrationSchema } from "../../Validation/schemas";
import CustomInput from "../../ui/CustomInput";
import AlternateLogin from "../../ui/AlternateLogin";
import MiniLoader from "../../ui/MiniLoader";

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

const PasswordStrengthContainer = styled.div`
  margin-top: 0.8rem;
  margin-bottom: 0.4rem;

  .bar-row {
    display: flex;
    gap: 0.4rem;
    height: 4px;
    margin-bottom: 0.4rem;
  }

  .segment {
    flex: 1;
    border-radius: 999px;
    background-color: var(--color-grey-200);
    transition: background-color 0.25s ease;
  }

  .text {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${(props) => props.strengthColor || "var(--color-grey-400)"};
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 1.8rem;
  margin-bottom: 2.4rem;

  input[type="checkbox"] {
    accent-color: #d97706;
    width: 1.8rem;
    height: 1.8rem;
    margin-top: 0.2rem;
    cursor: pointer;
    flex-shrink: 0;
  }

  label {
    font-size: 1.3rem;
    color: var(--color-grey-600);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;

    a {
      color: #d97706;
      font-weight: 600;
      text-decoration: underline;

      &:hover {
        color: #b45309;
      }
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

const SwitchTabRow = styled.p`
  text-align: center;
  font-size: 1.3rem;
  color: var(--color-grey-600);
  margin-top: 1.8rem;

  button {
    background: transparent;
    border: none;
    color: #d97706;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 0.4rem;

    &:hover {
      color: #b45309;
    }
  }
`;

function calculateStrength(pwd = "") {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak password", color: "#ef4444" };
  if (score <= 2) return { score: 2, label: "Fair password", color: "#f59e0b" };
  if (score === 3) return { score: 3, label: "Good password", color: "#10b981" };
  return { score: 4, label: "Strong & secure password", color: "#059669" };
}

export default function SignupForm({ setActiveTab }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [termsError, setTermsError] = useState("");

  const { signup, isLoading } = useSignup(setActiveTab);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password", "");
  const strength = calculateStrength(watchedPassword);

  function onSubmit(data) {
    if (!acceptedTerms) {
      setTermsError("Please agree to our Terms and Privacy Policy to continue");
      return;
    }
    setTermsError("");

    signup({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormHeader>
        <h2>Create Account</h2>
        <p>Unlock personalized formulas, order tracking, and exclusive previews</p>
      </FormHeader>

      <CustomInput
        id="signup-fullName"
        type="text"
        label="Full Name"
        placeholder="e.g., Amara Johnson"
        disabled={isLoading}
        error={errors.fullName?.message}
        {...register("fullName")}
        actionSlot={<HiOutlineUser />}
      />

      <CustomInput
        id="signup-email"
        type="email"
        label="Email Address"
        placeholder="amara@example.com"
        disabled={isLoading}
        error={errors.email?.message}
        {...register("email")}
        actionSlot={<HiOutlineMail />}
      />

      <CustomInput
        id="signup-password"
        type={showPassword ? "text" : "password"}
        label="Password (min 6 characters)"
        placeholder="Create a strong password"
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

      {/* PASSWORD STRENGTH VISUALIZER */}
      {watchedPassword && (
        <PasswordStrengthContainer strengthColor={strength.color}>
          <div className="bar-row">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="segment"
                style={{
                  backgroundColor:
                    idx <= strength.score ? strength.color : undefined,
                }}
              />
            ))}
          </div>
          <div className="text">
            {strength.score >= 3 && <HiOutlineCheck />} {strength.label}
          </div>
        </PasswordStrengthContainer>
      )}

      <CustomInput
        id="signup-confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        label="Confirm Password"
        placeholder="Re-enter your password"
        disabled={isLoading}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
        actionSlot={
          <span
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
          </span>
        }
      />

      <CheckboxRow>
        <input
          type="checkbox"
          id="termsCheckbox"
          checked={acceptedTerms}
          onChange={(e) => {
            setAcceptedTerms(e.target.checked);
            if (e.target.checked) setTermsError("");
          }}
          disabled={isLoading}
        />
        <label htmlFor="termsCheckbox">
          I agree to the{" "}
          <Link to="/privacypolicy" target="_blank">
            Terms of Service
          </Link>{" "}
          and acknowledge the Botanical Purity & Privacy commitment.
        </label>
      </CheckboxRow>
      {termsError && (
        <p style={{ color: "#ef4444", fontSize: "1.2rem", marginTop: "-1.8rem", marginBottom: "1.8rem" }}>
          {termsError}
        </p>
      )}

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? <MiniLoader /> : "Create Radiant Account"}
      </SubmitButton>

      <SwitchTabRow>
        Already have an account?
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab("login")}
        >
          Sign In
        </button>
      </SwitchTabRow>

      <AlternateLogin type="signup" />
    </Form>
  );
}
