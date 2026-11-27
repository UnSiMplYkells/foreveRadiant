import styled, { css } from "styled-components";
import Button from "../../ui/Button";
import { useCartItem } from "./useCartItems";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { applyPromo, clearPromo, updateTotalAmount } from "../../store";
import { validatePromoCode } from "../../Services/apiPromos";

export default function CartTotal() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { cartItems } = useCartItem();
  const checkedItems = useSelector((state) => state.cart.checkedItems);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const appliedPromo = useSelector((state) => state.cart.appliedPromo);

  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const checkedCartItems = cartItems?.filter((item) =>
    checkedItems.includes(item.id)
  );

  const subtotal =
    checkedCartItems?.reduce((acc, item) => {
      const itemPrice = Number(item.size_price) || Number(item.products?.price) || 0;
      return acc + itemPrice * item.quantity;
    }, 0) || 0;

  const shippingFee = 0;
  const discountPercent = appliedPromo?.discountPercent || 0;
  const discountAmount = Math.round(((subtotal * discountPercent) / 100) * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - discountAmount + shippingFee) * 100) / 100);

  useEffect(() => {
    dispatch(updateTotalAmount(total));
  }, [total, dispatch]);

  if (checkedItems.length === 0) return null;

  async function handleApplyPromo(e) {
    e.preventDefault();
    const cleaned = promoInput.trim().toUpperCase();
    if (!cleaned) {
      return toast.error("Enter a promo code first.");
    }

    setIsApplyingPromo(true);
    try {
      const result = await validatePromoCode(cleaned);
      dispatch(applyPromo(result));
      setPromoInput("");
      toast.success(result.message || `${result.code} applied!`);
    } catch (err) {
      toast.error(err.message || "Invalid or expired promo code.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  function handleRemovePromo() {
    dispatch(clearPromo());
    toast("Promo code removed.");
  }

  return (
    <CartTotals $isPlaceOrderPage={location.pathname === "/place-order"}>
      {location.pathname !== "/place-order" ? (
        <TotalsHeading>
          cart <span>Totals_</span>
        </TotalsHeading>
      ) : (
        <TotalsHeading>
          Order <span>Total_</span>
        </TotalsHeading>
      )}

      <PromoBox>
        {appliedPromo ? (
          <AppliedPromoChip>
            <div className="promo-meta">
              <strong>{appliedPromo.code}</strong>
              <span>{appliedPromo.discountPercent}% off applied</span>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              aria-label="Remove promo code"
            >
              Remove
            </button>
          </AppliedPromoChip>
        ) : (
          <PromoForm onSubmit={handleApplyPromo}>
            <input
              type="text"
              placeholder="Promo code (e.g. RADIANT15)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              disabled={isApplyingPromo}
              aria-label="Promo code"
            />
            <button type="submit" disabled={isApplyingPromo || !promoInput.trim()}>
              {isApplyingPromo ? "Checking..." : "Apply"}
            </button>
          </PromoForm>
        )}
      </PromoBox>

      <div>
        <SubHeading>
          <p>Subtotal</p>
          <p>₦{subtotal.toFixed(2)}</p>
        </SubHeading>
        {appliedPromo && discountAmount > 0 && (
          <SubHeading $discount>
            <p>
              Discount ({appliedPromo.code} · {appliedPromo.discountPercent}%)
            </p>
            <p>-₦{discountAmount.toFixed(2)}</p>
          </SubHeading>
        )}
        <SubHeading>
          <p>Shipping Fee</p>
          <p>{shippingFee === 0 && "Free Shipping"}</p>
        </SubHeading>
        <SubHeading $total>
          <p>Total</p>
          <p>₦{Number(totalAmount ?? total).toFixed(2)}</p>
        </SubHeading>
      </div>

      {location.pathname !== "/place-order" && (
        <Link to="/place-order">
          <StyledButton size="large" variation="cart">
            PROCEED TO PLACE ORDER
          </StyledButton>
        </Link>
      )}
    </CartTotals>
  );
}

const TotalsHeading = styled.h2`
  font-weight: 500;
  text-transform: uppercase;
  padding-bottom: 1rem;

  span {
    font-weight: 700;
  }
`;

const CartTotals = styled.div`
  max-width: 500px;
  margin-top: 60px;
  margin-left: 0;

  @media (min-width: 600px) {
    margin-left: auto;
  }

  ${(props) =>
    props.$isPlaceOrderPage &&
    css`
      @media (min-width: 600px) {
        margin-left: 0;
      }
      @media (max-width: 1000px) {
        margin-top: 30px;
      }
      margin-top: 0;
    `}
`;

const PromoBox = styled.div`
  margin-bottom: 14px;
`;

const PromoForm = styled.form`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
    padding: 8px 12px;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 6px;
    background: var(--bg-card, #ffffff);
    color: var(--text-primary, #111827);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.4px;
    outline: none;

    &::placeholder {
      font-weight: 400;
      letter-spacing: normal;
      color: var(--text-muted, #9ca3af);
    }

    &:focus {
      border-color: var(--color-brown, #7c2d12);
    }
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: var(--color-brown, #7c2d12);
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: var(--color-brown-hover, #5c200c);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
`;

const AppliedPromoChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--color-green-100, #dcfce7);
  border: 1px solid #86efac;

  .promo-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 1.2rem;
    color: var(--color-green-700, #15803d);

    strong {
      font-family: "Sono", monospace;
      letter-spacing: 0.5px;
    }
  }

  button {
    background: transparent;
    border: none;
    color: var(--color-red-700, #b91c1c);
    font-size: 1.15rem;
    font-weight: 600;
    cursor: pointer;
    padding: 2px 6px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SubHeading = styled.div`
  padding: 6px 10px;
  border-bottom: 1px solid green;
  font-weight: 500;

  display: flex;
  justify-content: space-between;
  gap: 12px;

  ${(props) =>
    props.$discount &&
    css`
      color: var(--color-green-700, #15803d);
      font-weight: 600;
    `}

  ${(props) =>
    props.$total &&
    css`
      font-weight: 700;
      border-bottom: none;
    `}
`;

const StyledButton = styled(Button)`
  width: fit-content;
  margin-top: 10px;
  padding: 15px;
  float: right;
`;
