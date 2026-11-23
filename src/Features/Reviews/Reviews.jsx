import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaTrashAlt,
  FaPen,
  FaShieldAlt,
  FaShoppingBag,
  FaLock,
} from "react-icons/fa";
import { HiOutlineLockClosed } from "react-icons/hi";
import {
  useProductReviews,
  useDeleteReview,
  useVerifiedPurchase,
} from "../../Hooks/useReviews";
import { useUserProfile } from "../../Hooks/useUserProfile";
import ReviewForm from "./ReviewForm";
import Spinner from "../../ui/Spinner";

const ReviewsWrapper = styled.div`
  padding: 1rem 0;
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr auto;
  gap: 3rem;
  align-items: center;
  padding: 2.4rem;
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: 12px;
  margin-bottom: 2.8rem;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ScoreBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 1px solid var(--color-grey-200);
  padding-right: 2rem;

  @media (max-width: 850px) {
    border-right: none;
    padding-right: 0;
    border-bottom: 1px solid var(--color-grey-200);
    padding-bottom: 1.6rem;
  }
`;

const BigRatingNumber = styled.div`
  font-size: 4.4rem;
  font-weight: 800;
  color: var(--color-grey-900);
  line-height: 1;
  margin-bottom: 0.6rem;
`;

const StarsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1.8rem;
  color: #f59e0b;
  margin-bottom: 0.6rem;
`;

const TotalReviewsText = styled.span`
  font-size: 1.3rem;
  color: var(--color-grey-500);
  font-weight: 500;
`;

const BarChartBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  color: var(--color-grey-600);
`;

const BarLabel = styled.span`
  width: 45px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 8px;
  background-color: var(--color-grey-200);
  border-radius: 999px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${(props) => props.percent}%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  border-radius: 999px;
  transition: width 0.4s ease;
`;

const BarCount = styled.span`
  width: 25px;
  text-align: right;
  font-weight: 600;
  color: var(--color-grey-500);
`;

const ActionBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const WriteReviewButton = styled.button`
  background: var(--color-grey-900);
  color: var(--color-grey-0);
  border: 1px solid var(--color-grey-900);
  padding: 1.2rem 2.2rem;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #d97706;
    border-color: #d97706;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
  }
`;

const LoginPromptLink = styled(Link)`
  background: var(--color-grey-0);
  border: 1.5px solid #d97706;
  color: #d97706;
  padding: 1.1rem 2rem;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #d97706;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);
    transform: translateY(-1px);
  }

  svg {
    font-size: 1.6rem;
  }
`;

const VerifiedLockPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-grey-700, #374151);

  svg {
    color: #d97706;
    font-size: 1.4rem;
  }
`;

const PurchaseRequiredNotice = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 4px solid #d97706;
  border-radius: 10px;
  padding: 1.6rem 2rem;
  margin-bottom: 2.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.4rem;

  .notice-content {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    svg {
      font-size: 2.2rem;
      color: #d97706;
      flex-shrink: 0;
    }

    h4 {
      margin: 0 0 4px;
      font-size: 1.35rem;
      font-weight: 700;
      color: #92400e;
    }

    p {
      margin: 0;
      font-size: 1.22rem;
      color: #78350f;
      line-height: 1.5;
    }
  }

  button {
    background: #d97706;
    color: #ffffff;
    border: none;
    padding: 0.9rem 1.6rem;
    border-radius: 6px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s ease;
    white-space: nowrap;

    &:hover {
      background: #b45309;
    }
  }
`;

const VerifiedBuyerBadgeSmall = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  margin-left: 0.4rem;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const ReviewCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 12px;
  padding: 2.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const AvatarCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-grey-900);
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
`;

const ReviewDate = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-400);
  margin-top: 0.2rem;
`;

const ReviewStars = styled.div`
  display: flex;
  gap: 0.2rem;
  color: #f59e0b;
  font-size: 1.4rem;
`;

const ReviewTitle = styled.h4`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
`;

const ReviewBody = styled.p`
  font-size: 1.4rem;
  line-height: 1.7;
  color: var(--color-grey-700);
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--color-grey-400);
  cursor: pointer;
  padding: 0.4rem;
  font-size: 1.3rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--color-grey-50);
  border-radius: 12px;
  border: 1px dashed var(--color-grey-300);

  h4 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-grey-800);
    margin-bottom: 0.6rem;
  }

  p {
    font-size: 1.3rem;
    color: var(--color-grey-500);
    margin-bottom: 1.8rem;
  }
`;

function getInitials(name = "Customer") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Reviews({ productId }) {
  const [showForm, setShowForm] = useState(false);
  const { user, isAdmin, isAuthenticated } = useUserProfile();
  const {
    reviews,
    isLoading,
    totalReviews,
    averageRating,
    ratingCounts,
  } = useProductReviews(productId);
  const { removeReview, isDeleting } = useDeleteReview(productId);
  const { hasPurchased, isCheckingPurchase } = useVerifiedPurchase(productId);

  const userHasReviewed = Boolean(user && reviews.some((r) => r.user_id === user.id));

  function scrollToProduct() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <ReviewsWrapper>
      {/* 1. RATINGS METRICS HEADER */}
      <MetricsContainer>
        <ScoreBox>
          <BigRatingNumber>{averageRating}</BigRatingNumber>
          <StarsRow>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.round(Number(averageRating)) ? <FaStar /> : <FaRegStar />}
              </span>
            ))}
          </StarsRow>
          <TotalReviewsText>Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}</TotalReviewsText>
        </ScoreBox>

        <BarChartBox>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <BarRow key={star}>
                <BarLabel>
                  {star} <FaStar style={{ color: "#f59e0b", fontSize: "1.1rem" }} />
                </BarLabel>
                <BarTrack>
                  <BarFill percent={percent} />
                </BarTrack>
                <BarCount>{count}</BarCount>
              </BarRow>
            );
          })}
        </BarChartBox>

        <ActionBox>
          {!isAuthenticated ? (
            <LoginPromptLink to="/login" title="Sign in to verify purchase and review">
              <HiOutlineLockClosed /> Log in to review
            </LoginPromptLink>
          ) : isCheckingPurchase ? (
            <VerifiedLockPill>
              <FaLock />
              <span>Verifying buyer status...</span>
            </VerifiedLockPill>
          ) : hasPurchased ? (
            <WriteReviewButton onClick={() => setShowForm((prev) => !prev)}>
              <FaPen />
              <span>{showForm ? "Close Form" : userHasReviewed ? "Update Review" : "Write a Review"}</span>
              <VerifiedBuyerBadgeSmall>
                <FaCheckCircle /> Verified Buyer
              </VerifiedBuyerBadgeSmall>
            </WriteReviewButton>
          ) : (
            <VerifiedLockPill title="Only customers who have ordered this formula can submit a review">
              <FaShieldAlt />
              <span>Verified Buyers Only</span>
            </VerifiedLockPill>
          )}
        </ActionBox>
      </MetricsContainer>

      {/* 2. PURCHASE REQUIRED NOTICE (Only for logged in customers who haven't bought this item) */}
      {isAuthenticated && !isCheckingPurchase && !hasPurchased && (
        <PurchaseRequiredNotice>
          <div className="notice-content">
            <FaShieldAlt />
            <div>
              <h4>Verified Purchase Required</h4>
              <p>
                To maintain authentic customer feedback, reviews can only be submitted by customers who have purchased this botanical formula. Once your order has been placed and confirmed, you will be able to leave your review!
              </p>
            </div>
          </div>
          <button type="button" onClick={scrollToProduct}>
            <FaShoppingBag /> Order This Formula
          </button>
        </PurchaseRequiredNotice>
      )}

      {/* 3. COLLAPSIBLE REVIEW FORM (PROTECTED: Verified Buyers & Admins Only) */}
      {isAuthenticated && hasPurchased && showForm && (
        <ReviewForm
          productId={productId}
          hasPurchased={hasPurchased}
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* 4. REVIEWS LIST */}
      {reviews.length === 0 ? (
        <EmptyState>
          <h4>No Reviews Yet</h4>
          <p>Be the first to share your experience with this botanical formula!</p>
          {!isAuthenticated ? (
            <LoginPromptLink to="/login">
              <HiOutlineLockClosed /> Log in to leave a review
            </LoginPromptLink>
          ) : hasPurchased ? (
            <WriteReviewButton onClick={() => setShowForm(true)}>
              <FaPen /> Be the First to Review
              <VerifiedBuyerBadgeSmall>
                <FaCheckCircle /> Verified Buyer
              </VerifiedBuyerBadgeSmall>
            </WriteReviewButton>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <p style={{ margin: 0, fontSize: "1.2rem", color: "#6b7280" }}>
                Purchase this formula to be the first to leave a verified review.
              </p>
              <button
                type="button"
                onClick={scrollToProduct}
                style={{
                  background: "#d97706",
                  color: "#ffffff",
                  border: "none",
                  padding: "1rem 2rem",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaShoppingBag /> Order to Review
              </button>
            </div>
          )}
        </EmptyState>
      ) : (
        <ReviewsList>
          {reviews.map((r) => {
            const canDelete = isAdmin || (user && r.user_id === user.id);

            return (
              <ReviewCard key={r.id}>
                <ReviewHeader>
                  <AuthorSection>
                    <AvatarCircle>{getInitials(r.user_name)}</AvatarCircle>
                    <AuthorDetails>
                      <AuthorName>
                        {r.user_name || "Verified Customer"}
                        <VerifiedBadge>
                          <FaCheckCircle /> Verified Buyer
                        </VerifiedBadge>
                      </AuthorName>
                      <ReviewDate>{formatDate(r.created_at)}</ReviewDate>
                    </AuthorDetails>
                  </AuthorSection>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <ReviewStars>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= r.rating ? <FaStar /> : <FaRegStar />}
                        </span>
                      ))}
                    </ReviewStars>

                    {canDelete && (
                      <DeleteBtn
                        title="Delete review"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this review?")) {
                            removeReview(r.id);
                          }
                        }}
                        disabled={isDeleting}
                      >
                        <FaTrashAlt />
                      </DeleteBtn>
                    )}
                  </div>
                </ReviewHeader>

                {r.title && <ReviewTitle>{r.title}</ReviewTitle>}
                <ReviewBody>{r.review}</ReviewBody>
              </ReviewCard>
            );
          })}
        </ReviewsList>
      )}
    </ReviewsWrapper>
  );
}
