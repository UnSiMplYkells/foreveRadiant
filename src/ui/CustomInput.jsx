import { forwardRef } from "react";
import styled from "styled-components";

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1.6rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-grey-700);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1.2rem 1.4rem;
  padding-right: ${(props) => (props.hasAction ? "4.2rem" : "1.4rem")};
  background-color: var(--color-grey-50);
  border: 1.5px solid ${(props) => (props.hasError ? "#ef4444" : "var(--color-grey-300)")};
  border-radius: 8px;
  color: var(--color-grey-900);
  font-size: 1.4rem;
  transition: all 0.2s ease;
  outline: none;

  &::placeholder {
    color: var(--color-grey-400);
    font-size: 1.3rem;
  }

  &:focus {
    border-color: #d97706;
    background-color: var(--color-grey-0);
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
  }

  &:disabled {
    background-color: var(--color-grey-200);
    color: var(--color-grey-400);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ActionSlot = styled.div`
  position: absolute;
  right: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);
  cursor: pointer;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  padding: 0.2rem;
  transition: color 0.15s ease;

  &:hover {
    color: var(--color-grey-800);
  }
`;

const ErrorText = styled.span`
  font-size: 1.2rem;
  color: #ef4444;
  margin-top: 0.2rem;
  display: block;
`;

const CustomInput = forwardRef(function CustomInput(
  {
    type = "text",
    id,
    label,
    children,
    error,
    actionSlot,
    placeholder,
    disabled,
    ...rest
  },
  ref
) {
  const displayLabel = label || children;

  return (
    <FieldWrapper>
      {displayLabel && <Label htmlFor={id}>{displayLabel}</Label>}
      <InputWrapper>
        <StyledInput
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          hasError={Boolean(error)}
          hasAction={Boolean(actionSlot)}
          {...rest}
        />
        {actionSlot && <ActionSlot>{actionSlot}</ActionSlot>}
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </FieldWrapper>
  );
});

export default CustomInput;
