import styled from "styled-components";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaCamera, FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { useUser } from "./useUser";
import { useUpdateUser } from "./useUpdateUser";
import { useUpdateUserDetails, useUserDetailed } from "../../Hooks/useUserProfile";
import MiniLoader from "../../ui/MiniLoader";

const Card = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: clamp(20px, 3vw, 32px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);

  .title-group {
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
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.86rem;
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
  gap: 20px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${(props) => (props.$fullWidth ? "1 / -1" : "span 1")};

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

  input, textarea {
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

  textarea {
    resize: vertical;
    min-height: 70px;
  }

  .readonly-value {
    padding: 10px 14px;
    background: var(--bg-surface-soft, #f9fafb);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    font-size: 0.92rem;
    color: var(--text-primary, #111827);
    margin: 0;
    min-height: 42px;
    display: flex;
    align-items: center;

    &.empty {
      color: var(--color-grey-400, #9ca3af);
      font-style: italic;
    }
  }
`;

const AvatarUploadRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: var(--bg-surface-soft, #f9fafb);
  border: 1px dashed var(--border-color, #d1d5db);
  border-radius: 8px;
  grid-column: 1 / -1;

  .avatar-preview {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-brown, #7c2d12);
  }

  .upload-info {
    flex: 1;

    p {
      margin: 0 0 6px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }

    input[type="file"] {
      font-size: 0.82rem;
      color: var(--color-grey-600, #4b5563);
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #e5e7eb);
`;

export default function UpdateUserDetails() {
  const { user } = useUser();
  const { data: userDetailsItem } = useUserDetailed();
  const { register, handleSubmit, reset } = useForm();
  const [isEditing, setIsEditing] = useState(false);

  const fullNameDisplay = user?.user_metadata?.fullName || user?.user_metadata?.full_name || "";
  const avatarUrl = user?.user_metadata?.avatar?.avatar || user?.user_metadata?.avatar_url || "";

  const [fullNameInput, setFullNameInput] = useState(fullNameDisplay);
  const [avatarFile, setAvatarFile] = useState(null);

  const { updateUser, isUpdating } = useUpdateUser();
  const { updatedUserDetails, isUpdatingUserDetails } = useUpdateUserDetails();
  const userId = user?.id;

  const { address_I, phonenumber_I, address_II, phonenumber_II } = userDetailsItem || {};

  useEffect(() => {
    setFullNameInput(fullNameDisplay);
  }, [fullNameDisplay]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  }

  function handleCancel() {
    setIsEditing(false);
    reset();
    setFullNameInput(fullNameDisplay);
    setAvatarFile(null);
  }

  function onSubmitForm(formData) {
    const { fullName, addressI, phoneNumberI, addressII, phoneNumberII } = formData;
    let updatesPerformed = false;

    // Profile update (name / avatar)
    const currentName = user?.user_metadata?.fullName || user?.user_metadata?.full_name;
    const hasNameChange = fullName?.trim() && fullName.trim() !== currentName?.trim();
    const hasAvatarChange = avatarFile !== null;

    if (hasNameChange || hasAvatarChange) {
      updateUser({
        fullName: fullName || currentName,
        avatar: avatarFile,
      });
      updatesPerformed = true;
    }

    // Detail updates (addresses & phones)
    const detailUpdates = {
      address_I: addressI?.trim(),
      phonenumber_I: phoneNumberI?.trim(),
      address_II: addressII?.trim(),
      phonenumber_II: phoneNumberII?.trim(),
    };

    const cleanUpdates = Object.fromEntries(
      Object.entries(detailUpdates).filter(([_, v]) => v !== undefined && v !== "")
    );

    if (Object.keys(cleanUpdates).length > 0) {
      updatedUserDetails({
        userId,
        ...cleanUpdates,
      });
      updatesPerformed = true;
    }

    if (!updatesPerformed) {
      toast("No profile changes detected");
    }

    setIsEditing(false);
    setAvatarFile(null);
  }

  return (
    <Card>
      <SectionHeader>
        <div className="title-group">
          <h3>Personal Details &amp; Delivery Addresses</h3>
          <p>Manage your contact details and default shipping destinations</p>
        </div>

        {!isEditing ? (
          <ActionButton type="button" onClick={() => setIsEditing(true)}>
            <FaEdit />
            <span>Edit Information</span>
          </ActionButton>
        ) : (
          <ActionButton type="button" onClick={handleCancel}>
            <FaTimes />
            <span>Cancel</span>
          </ActionButton>
        )}
      </SectionHeader>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        <FormGrid>
          {/* Avatar Upload (Only visible in edit mode) */}
          {isEditing && (
            <AvatarUploadRow>
              {avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="New Avatar Preview"
                  className="avatar-preview"
                />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="avatar-preview" />
              ) : (
                <div
                  className="avatar-preview"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fef3c7",
                    color: "#7c2d12",
                  }}
                >
                  <FaCamera />
                </div>
              )}
              <div className="upload-info">
                <p>Change Profile Photo</p>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </AvatarUploadRow>
          )}

          {/* Full Name */}
          <FormGroup>
            <label htmlFor="fullName">
              <FaUser /> Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                id="fullName"
                disabled={isUpdating}
                {...register("fullName", { value: fullNameDisplay })}
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="Enter full name"
              />
            ) : (
              <p className={`readonly-value ${!fullNameDisplay ? "empty" : ""}`}>
                {fullNameDisplay || "Not provided"}
              </p>
            )}
          </FormGroup>

          {/* Email Address (Read-Only) */}
          <FormGroup>
            <label htmlFor="email">
              <FaEnvelope /> Email Address
            </label>
            <p className="readonly-value">{user?.email || "N/A"}</p>
          </FormGroup>

          {/* Primary Address */}
          <FormGroup $fullWidth>
            <label htmlFor="addressI">
              <FaMapMarkerAlt /> Primary Delivery Address (Address I)
            </label>
            {isEditing ? (
              <textarea
                id="addressI"
                disabled={isUpdating}
                {...register("addressI")}
                defaultValue={address_I || ""}
                placeholder="Street address, apartment, city, state"
              />
            ) : (
              <p className={`readonly-value ${!address_I ? "empty" : ""}`}>
                {address_I || "No primary address saved yet"}
              </p>
            )}
          </FormGroup>

          {/* Primary Phone */}
          <FormGroup>
            <label htmlFor="phoneNumberI">
              <FaPhoneAlt /> Primary Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                id="phoneNumberI"
                disabled={isUpdating}
                {...register("phoneNumberI")}
                defaultValue={phonenumber_I || ""}
                placeholder="e.g. +234 801 234 5678"
              />
            ) : (
              <p className={`readonly-value ${!phonenumber_I ? "empty" : ""}`}>
                {phonenumber_I || "No primary phone saved"}
              </p>
            )}
          </FormGroup>

          {/* Secondary Phone */}
          <FormGroup>
            <label htmlFor="phoneNumberII">
              <FaPhoneAlt /> Secondary Phone (Optional)
            </label>
            {isEditing ? (
              <input
                type="tel"
                id="phoneNumberII"
                disabled={isUpdating}
                {...register("phoneNumberII")}
                defaultValue={phonenumber_II || ""}
                placeholder="Alternate phone number"
              />
            ) : (
              <p className={`readonly-value ${!phonenumber_II ? "empty" : ""}`}>
                {phonenumber_II || "None"}
              </p>
            )}
          </FormGroup>

          {/* Secondary Address */}
          <FormGroup $fullWidth>
            <label htmlFor="addressII">
              <FaMapMarkerAlt /> Secondary Delivery Address (Address II - Optional)
            </label>
            {isEditing ? (
              <textarea
                id="addressII"
                disabled={isUpdating}
                {...register("addressII")}
                defaultValue={address_II || ""}
                placeholder="Alternate delivery destination or workplace"
              />
            ) : (
              <p className={`readonly-value ${!address_II ? "empty" : ""}`}>
                {address_II || "No alternate address saved"}
              </p>
            )}
          </FormGroup>
        </FormGrid>

        {isEditing && (
          <ButtonRow>
            <ActionButton type="button" onClick={handleCancel}>
              Cancel
            </ActionButton>
            <ActionButton
              $primary
              type="submit"
              disabled={isUpdating || isUpdatingUserDetails}
            >
              {isUpdating || isUpdatingUserDetails ? (
                <MiniLoader />
              ) : (
                <>
                  <FaCheck /> Save Changes
                </>
              )}
            </ActionButton>
          </ButtonRow>
        )}
      </form>
    </Card>
  );
}
