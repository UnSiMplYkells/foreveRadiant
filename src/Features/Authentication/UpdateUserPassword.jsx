import styled from "styled-components";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaLock, FaKey, FaShieldAlt } from "react-icons/fa";
import supabase from "../../Services/supabase";
import { useUser } from "./useUser";
import { useUpdateUser } from "../Authentication/useUpdateUser";
import { useLogout } from "./useLogout";
import MiniLoader from "../../ui/MiniLoader";

const Card = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: clamp(20px, 3vw, 32px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionHeader = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
    margin: 0;
  }

  p {
    margin: 4px 0 0;
    font-size: 0.85rem;
    color: var(--color-grey-500, #6b7280);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--color-grey-600, #4b5563);
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      color: var(--color-brown, #7c2d12);
      font-size: 0.85rem;
    }
  }

  input {
    padding: 10px 14px;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 8px;
    font-size: 0.92rem;
    background: var(--bg-surface-soft, #f9fafb);
    color: var(--text-primary, #111827);
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: var(--color-brown, #7c2d12);
      background: var(--bg-card, #ffffff);
      box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1);
    }

    &:disabled {
      background: var(--bg-surface-soft, #f3f4f6);
      color: var(--color-grey-500, #9ca3af);
      cursor: not-allowed;
    }
  }

  .field-hint {
    font-size: 0.76rem;
    color: var(--color-grey-500, #6b7280);
    margin-top: 2px;
  }

  .field-error {
    font-size: 0.78rem;
    color: #dc2626;
    margin-top: 2px;
    font-weight: 500;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #e5e7eb);
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-brown, #7c2d12);
  color: #ffffff;
  border: 1px solid var(--color-brown, #7c2d12);

  &:hover:not(:disabled) {
    background: #5c200c;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function UpdateUserPassword() {
  const { register, handleSubmit, reset } = useForm();
  const { user } = useUser();
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { updateUser, isUpdating } = useUpdateUser();
  const { logout } = useLogout();

  function validate(newPass, confirmPass) {
    if (confirmPass.length > 0 && newPass !== confirmPass) {
      setErrorMsg("Passwords do not match");
    } else {
      setErrorMsg("");
    }
  }

  async function onSubmitForm({ currentPassword, newPassword, confirmedPassword }) {
    if (newPassword !== confirmedPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      toast.error("Current password verification failed. Please check and retry.");
      return;
    }

    await toast.promise(updateUser({ password: newPassword }), {
      loading: "Securing account with new password...",
      success: "Password updated successfully!",
      error: "Failed to update password. Please try again.",
    });

    reset();
    setNewPasswordVal("");
    setConfirmPasswordVal("");
    setErrorMsg("");
    await logout();
  }

  return (
    <Card>
      <SectionHeader>
        <h3>Security &amp; Password</h3>
        <p>Ensure your account is protected with a unique, robust password</p>
      </SectionHeader>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        <FormGrid>
          {/* Current Password */}
          <FormGroup>
            <label htmlFor="currentPassword">
              <FaKey /> Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              disabled={isUpdating}
              placeholder="Enter current password"
              {...register("currentPassword", { required: true })}
            />
            <span className="field-hint">Required to verify identity</span>
          </FormGroup>

          {/* New Password */}
          <FormGroup>
            <label htmlFor="newPassword">
              <FaLock /> New Password
            </label>
            <input
              type="password"
              id="newPassword"
              disabled={isUpdating}
              placeholder="At least 8 characters"
              {...register("newPassword", {
                required: true,
                minLength: 8,
                onChange: (e) => {
                  setNewPasswordVal(e.target.value);
                  validate(e.target.value, confirmPasswordVal);
                },
              })}
            />
            {newPasswordVal.length > 0 && newPasswordVal.length < 8 ? (
              <span className="field-error">Minimum 8 characters required</span>
            ) : (
              <span className="field-hint">Must be 8+ characters</span>
            )}
          </FormGroup>

          {/* Confirm Password */}
          <FormGroup>
            <label htmlFor="confirmedPassword">
              <FaLock /> Confirm New Password
            </label>
            <input
              type="password"
              id="confirmedPassword"
              disabled={isUpdating}
              placeholder="Re-enter new password"
              {...register("confirmedPassword", {
                required: true,
                onChange: (e) => {
                  setConfirmPasswordVal(e.target.value);
                  validate(newPasswordVal, e.target.value);
                },
              })}
            />
            {errorMsg ? (
              <span className="field-error">{errorMsg}</span>
            ) : (
              <span className="field-hint">Repeat new password to confirm</span>
            )}
          </FormGroup>
        </FormGrid>

        <ButtonRow>
          <SubmitButton type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <MiniLoader />
            ) : (
              <>
                <FaShieldAlt /> Update Password
              </>
            )}
          </SubmitButton>
        </ButtonRow>
      </form>
    </Card>
  );
}
