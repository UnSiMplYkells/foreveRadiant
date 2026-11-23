import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaStar, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useCreateReview } from "../../Hooks/useReviews";
import { useUserProfile } from "../../Hooks/useUserProfile";
import { reviewSchema } from "../../Validation/schemas";

const FormContainer = styled.form`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 12px;
  padding: 2.4rem;
  margin-top: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FormTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.8rem;
`;

const Label = styled.label`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-grey-700);
  display: flex;
  align-items: center;
  gap: 0.4rem;

  span.required {
    color: #ef4444;
  }
`;

const StarPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.4rem;
`;

const StarButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 2.4rem;
  color: ${(props) => (props.active ? "#f59e0b" : "var(--color-grey-300)")};
  transition: transform 0.15s ease, color 0.15s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

const RatingText = styled.span`
  font-size: 1.3rem;
  font-weight: 600;
  color: #f59e0b;
  margin-left: 0.8rem;
`;

const Input = styled.input`
  padding: 1.1rem 1.4rem;
  border: 1px solid ${(props) => (props.hasError ? "#ef4444" : "var(--color-grey-300)")};
  border-radius: 8px;
  background-color: var(--color-grey-50);
  color: var(--color-grey-900);
  font-size: 1.4rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #d97706;
    background-color: var(--color-grey-0);
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
  }
`;

const Textarea = styled.textarea`
  padding: 1.1rem 1.4rem;
  border: 1px solid ${(props) => (props.hasError ? "#ef4444" : "var(--color-grey-300)")};
  border-radius: 8px;
  background-color: var(--color-grey-50);
  color: var(--color-grey-900);
  font-size: 1.4rem;
  min-height: 110px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #d97706;
    background-color: var(--color-grey-0);
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
  }
`;

const ErrorMsg = styled.span`
  font-size: 1.2rem;
  color: #ef4444;
  margin-top: 0.2rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 1.1rem 2.4rem;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(217, 119, 6, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  background: transparent;
  color: var(--color-grey-600);
  border: 1px solid var(--color-grey-300);
  border-radius: 8px;
  padding: 1.1rem 2rem;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-grey-100);
    color: var(--color-grey-900);
  }
`;

const VerifiedHeaderNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 1.8rem;
  color: #065f46;
  font-size: 1.25rem;
  font-weight: 600;

  svg {
    color: #10b981;
    font-size: 1.5rem;
    flex-shrink: 0;
  }
`;

const ratingLabels = {
  1: "1 Star - Unsatisfied",
  2: "2 Stars - Fair",
  3: "3 Stars - Average",
  4: "4 Stars - Good",
  5: "5 Stars - Excellent & Highly Recommended",
};

export default function ReviewForm({
  productId,
  onCancel,
  onSuccess,
  hasPurchased = true,
}) {
  const { user, isAdmin, isAuthenticated } = useUserProfile();
  const { submitReview, isSubmitting } = useCreateReview(productId);

  const initialName = user?.user_metadata?.fullName || user?.email?.split("@")[0] || "";
  const initialEmail = user?.email || "";

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [userName, setUserName] = useState(initialName);
  const [userEmail, setUserEmail] = useState(initialEmail);
  const [errors, setErrors] = useState({});

  if (!isAuthenticated) {
    return (
      <FormContainer as="div" style={{ textAlign: "center", padding: "3rem" }}>
        <FormTitle>Sign In Required</FormTitle>
        <Subtitle>Please log in to your account to review this formula.</Subtitle>
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            color: "#ffffff",
            padding: "1rem 2rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1.3rem",
            textDecoration: "none",
            marginTop: "1rem",
          }}
        >
          <HiOutlineLockClosed /> Log in to leave a review
        </Link>
      </FormContainer>
    );
  }

  // Guardrail: Customer must have purchased the product
  if (!hasPurchased && !isAdmin) {
    return (
      <FormContainer as="div" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <FaShieldAlt style={{ fontSize: "3rem", color: "#d97706" }} />
        </div>
        <FormTitle>Verified Purchase Required</FormTitle>
        <Subtitle>
          Only customers who have ordered and received this botanical formula can share a review.
        </Subtitle>
        <button
          type="button"
          onClick={() => {
            if (onCancel) onCancel();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            color: "#ffffff",
            border: "none",
            padding: "1rem 2rem",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1.3rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Order This Formula
        </button>
      </FormContainer>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    const formData = {
      rating,
      title,
      review,
      userName: userName || "Verified Customer",
      userEmail: userEmail || undefined,
    };

    // Client-side Zod validation
    const result = reviewSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    submitReview(
      {
        rating,
        title: title.trim(),
        review: review.trim(),
        userName: userName.trim() || "Verified Customer",
        userEmail: userEmail ? userEmail.trim() : null,
        userId: user?.id || null,
        isAdmin,
      },
      {
        onSuccess: () => {
          setTitle("");
          setReview("");
          if (onSuccess) onSuccess();
        },
      }
    );
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <VerifiedHeaderNotice>
        <FaCheckCircle />
        <span>Verified Buyer: Your purchase of this formula has been verified. Thank you for sharing your feedback!</span>
      </VerifiedHeaderNotice>

      <FormTitle>Write a Customer Review</FormTitle>
      <Subtitle>Share your honest experience to guide fellow botanical skincare lovers</Subtitle>

      <FormGroup>
        <Label>
          Your Overall Rating <span className="required">*</span>
        </Label>
        <StarPicker>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarButton
              key={star}
              type="button"
              active={star <= (hoverRating || rating)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} stars`}
            >
              <FaStar />
            </StarButton>
          ))}
          <RatingText>{ratingLabels[hoverRating || rating]}</RatingText>
        </StarPicker>
        {errors.rating && <ErrorMsg>{errors.rating}</ErrorMsg>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="review-title">
          Review Headline <span className="required">*</span>
        </Label>
        <Input
          id="review-title"
          placeholder="e.g., Amazing shine and soft texture!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          hasError={Boolean(errors.title)}
          maxLength={100}
        />
        {errors.title && <ErrorMsg>{errors.title}</ErrorMsg>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="review-body">
          Your Review / Comment <span className="required">*</span>
        </Label>
        <Textarea
          id="review-body"
          placeholder="How did this formula feel on your skin/hair? What noticeable changes did you see over time?"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          hasError={Boolean(errors.review)}
          maxLength={1000}
        />
        {errors.review && <ErrorMsg>{errors.review}</ErrorMsg>}
      </FormGroup>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.4rem" }}>
        <FormGroup>
          <Label htmlFor="review-name">
            Your Name <span className="required">*</span>
          </Label>
          <Input
            id="review-name"
            placeholder="e.g., Adaobi K."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            hasError={Boolean(errors.userName)}
            maxLength={50}
          />
          {errors.userName && <ErrorMsg>{errors.userName}</ErrorMsg>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="review-email">Your Email (Optional)</Label>
          <Input
            id="review-email"
            type="email"
            placeholder="e.g., adaobi@example.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            hasError={Boolean(errors.userEmail)}
          />
          {errors.userEmail && <ErrorMsg>{errors.userEmail}</ErrorMsg>}
        </FormGroup>
      </div>

      <ButtonRow>
        {onCancel && (
          <CancelBtn type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </CancelBtn>
        )}
        <SubmitBtn type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Publishing Review..." : "Submit Review"}
        </SubmitBtn>
      </ButtonRow>
    </FormContainer>
  );
}
