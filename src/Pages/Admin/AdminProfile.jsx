import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaKey,
  FaShieldAlt,
  FaCheck,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { useUser } from "../../Features/Authentication/useUser";
import { useUpdateUser } from "../../Features/Authentication/useUpdateUser";
import Logout from "../../Features/Authentication/Logout";
import supabase from "../../Services/supabase";
import MiniLoader from "../../ui/MiniLoader";

const ProfileContainer = styled.div`
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProfileHero = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const UserIntro = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  .avatar-frame {
    width: 64px;
    height: 64px;
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
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-brown, #7c2d12);
    }
  }

  .meta {
    h2 {
      margin: 0 0 4px;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .email {
      margin: 0;
      font-size: 0.88rem;
      color: var(--color-grey-500, #6b7280);
    }
  }
`;

const AdminRoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 9px;
  border-radius: 9999px;
  background: #fef3c7;
  color: #78350f;
  border: 1px solid #fde68a;
`;

const Card = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: clamp(20px, 3vw, 28px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);

  .title-group {
    h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
      margin: 0;
    }

    p {
      margin: 3px 0 0;
      font-size: 0.82rem;
      color: var(--color-grey-500, #6b7280);
    }
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$primary ? "var(--color-brown, #7c2d12)" : "var(--bg-surface-soft, #f8f9fa)")};
  color: ${(props) => (props.$primary ? "#ffffff" : "var(--text-primary, #374151)")};
  border: 1px solid ${(props) => (props.$primary ? "var(--color-brown, #7c2d12)" : "var(--border-color, #d1d5db)")};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$primary ? "#5c200c" : "var(--color-grey-200, #e5e7eb)")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${(props) => (props.$fullWidth ? "1 / -1" : "span 1")};

  label {
    font-size: 0.82rem;
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
    font-size: 0.9rem;
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

  .readonly-value {
    padding: 10px 14px;
    background: var(--bg-surface-soft, #f9fafb);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-primary, #111827);
    margin: 0;
    min-height: 40px;
    display: flex;
    align-items: center;
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
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color, #e5e7eb);
`;

export default function AdminProfile() {
  const { user } = useUser();
  const { updateUser, isUpdating } = useUpdateUser();

  const fullNameDisplay =
    user?.user_metadata?.fullName ||
    user?.user_metadata?.full_name ||
    "Administrator";
  const avatarUrl =
    user?.user_metadata?.avatar?.avatar ||
    user?.user_metadata?.avatar_url ||
    "";

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(fullNameDisplay);

  // Password change state
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
  } = useForm();
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const initial = (fullNameDisplay.trim().charAt(0) || "A").toUpperCase();

  function handleSaveName(e) {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateUser(
      { fullName: nameInput.trim() },
      {
        onSuccess: () => {
          setIsEditingName(false);
          toast.success("Administrator name updated successfully");
        },
      }
    );
  }

  function validatePasswords(pass, confirmPass) {
    if (confirmPass.length > 0 && pass !== confirmPass) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }

  async function onPasswordSubmit({ currentPassword, newPassword, confirmedPassword }) {
    if (newPassword !== confirmedPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password verification failed. Please try again.");
        setIsUpdatingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || "Failed to update password");
      } else {
        toast.success("Administrator password updated successfully!");
        resetPassword();
        setNewPasswordVal("");
        setConfirmPasswordVal("");
        setPasswordError("");
      }
    } catch {
      toast.error("An unexpected error occurred while updating password");
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <ProfileContainer>
      {/* Top Profile Summary Card */}
      <ProfileHero>
        <UserIntro>
          <div className="avatar-frame">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullNameDisplay} />
            ) : (
              <span className="initials">{initial}</span>
            )}
          </div>
          <div className="meta">
            <h2>
              {fullNameDisplay}
              <AdminRoleBadge>
                <FaShieldAlt style={{ fontSize: "0.7rem" }} /> System Administrator
              </AdminRoleBadge>
            </h2>
            <p className="email">{user?.email || "admin@foreverradiance.com"}</p>
          </div>
        </UserIntro>

        <Logout />
      </ProfileHero>

      {/* Admin Name & Account Details Card */}
      <Card>
        <CardHeader>
          <div className="title-group">
            <h3>Administrator Account Credentials</h3>
            <p>Your administrative identity and sign-in credentials</p>
          </div>

          {!isEditingName ? (
            <ActionButton type="button" onClick={() => setIsEditingName(true)}>
              <FaEdit />
              <span>Edit Name</span>
            </ActionButton>
          ) : (
            <ActionButton
              type="button"
              onClick={() => {
                setIsEditingName(false);
                setNameInput(fullNameDisplay);
              }}
            >
              <FaTimes />
              <span>Cancel</span>
            </ActionButton>
          )}
        </CardHeader>

        <form onSubmit={handleSaveName}>
          <FormGrid>
            <FormGroup>
              <label htmlFor="adminName">
                <FaUser /> Administrator Full Name
              </label>
              {isEditingName ? (
                <input
                  type="text"
                  id="adminName"
                  value={nameInput}
                  disabled={isUpdating}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter administrator name"
                />
              ) : (
                <p className="readonly-value">{fullNameDisplay}</p>
              )}
            </FormGroup>

            <FormGroup>
              <label htmlFor="adminEmail">
                <FaEnvelope /> Sign-in Email Address
              </label>
              <p className="readonly-value">{user?.email || "N/A"}</p>
              <span className="field-hint">Primary administrator access email</span>
            </FormGroup>
          </FormGrid>

          {isEditingName && (
            <ButtonRow>
              <ActionButton
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                  setNameInput(fullNameDisplay);
                }}
              >
                Cancel
              </ActionButton>
              <ActionButton $primary type="submit" disabled={isUpdating}>
                {isUpdating ? <MiniLoader /> : <><FaCheck /> Save Name</>}
              </ActionButton>
            </ButtonRow>
          )}
        </form>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <div className="title-group">
            <h3>Security &amp; Password Management</h3>
            <p>Update your administrator master password to maintain account security</p>
          </div>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <FormGrid style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {/* Current Password */}
            <FormGroup>
              <label htmlFor="currentAdminPassword">
                <FaKey /> Current Password
              </label>
              <input
                type="password"
                id="currentAdminPassword"
                disabled={isUpdatingPassword}
                placeholder="Current password"
                {...registerPassword("currentPassword", { required: true })}
              />
              <span className="field-hint">Verify administrative authority</span>
            </FormGroup>

            {/* New Password */}
            <FormGroup>
              <label htmlFor="newAdminPassword">
                <FaLock /> New Password
              </label>
              <input
                type="password"
                id="newAdminPassword"
                disabled={isUpdatingPassword}
                placeholder="At least 8 characters"
                {...registerPassword("newPassword", {
                  required: true,
                  minLength: 8,
                  onChange: (e) => {
                    setNewPasswordVal(e.target.value);
                    validatePasswords(e.target.value, confirmPasswordVal);
                  },
                })}
              />
              {newPasswordVal.length > 0 && newPasswordVal.length < 8 ? (
                <span className="field-error">Minimum 8 characters</span>
              ) : (
                <span className="field-hint">Must be 8+ characters</span>
              )}
            </FormGroup>

            {/* Confirm New Password */}
            <FormGroup>
              <label htmlFor="confirmAdminPassword">
                <FaLock /> Confirm New Password
              </label>
              <input
                type="password"
                id="confirmAdminPassword"
                disabled={isUpdatingPassword}
                placeholder="Re-type new password"
                {...registerPassword("confirmedPassword", {
                  required: true,
                  onChange: (e) => {
                    setConfirmPasswordVal(e.target.value);
                    validatePasswords(newPasswordVal, e.target.value);
                  },
                })}
              />
              {passwordError ? (
                <span className="field-error">{passwordError}</span>
              ) : (
                <span className="field-hint">Repeat to confirm</span>
              )}
            </FormGroup>
          </FormGrid>

          <ButtonRow>
            <ActionButton $primary type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? (
                <MiniLoader />
              ) : (
                <>
                  <FaShieldAlt /> Update Admin Password
                </>
              )}
            </ActionButton>
          </ButtonRow>
        </form>
      </Card>
    </ProfileContainer>
  );
}
