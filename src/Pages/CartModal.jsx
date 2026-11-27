import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import Price from '../ui/Price';
import Button from "../ui/Button";
import QuantityCounter from '../ui/QuantityCounter';
import CloseButton from "../ui/CloseButton"; // Import the new CloseButton component
import { useUser } from "../Features/Authentication/useUser";
import { useAddToCart } from "../Features/Cart/useAddToCart";
import { useAddToCart2 } from "../Features/Cart/useAddToCart";
import MiniLoader from "../ui/MiniLoader";

export default function CartModal({ isVisible, onClose, selectedProduct, productId, initialSelectedVolume, initialSelectedPrice }) {
  const [selectedVolume, setSelectedVolume] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showVolumeError, setShowVolumeError] = useState(false);
  const { addToCart, isATCart } = useAddToCart();
  const { addToCart2, isATCart2 } = useAddToCart2();
  const { user } = useUser();
  const userId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => document.body.classList.remove("no-scroll");
  }, [isVisible]);

  const {
    name,
    price = 0,
    image_url: images = [],
    discount = 0,
    size,
    available
  } = selectedProduct || {};

  const normalizedSizes = React.useMemo(() => {
    let raw = size;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = [raw];
      }
    }
    if (!Array.isArray(raw)) raw = raw ? [raw] : [];

    return raw.map((item) => {
      if (typeof item === "object" && item !== null && item.size) {
        return {
          size: String(item.size),
          price: Number(item.price) || Number(price) || 5000,
        };
      }
      const label = String(item).includes("ml") || String(item).includes("g") ? String(item) : `${item}ml`;
      return {
        size: label,
        price: Number(price) || 5000,
      };
    });
  }, [size, price]);

  useEffect(() => {
    if (isVisible) {
      if (initialSelectedVolume) {
        setSelectedVolume(initialSelectedVolume);
        setSelectedPrice(initialSelectedPrice || price);
      } else if (normalizedSizes.length > 0) {
        setSelectedVolume(normalizedSizes[0].size);
        setSelectedPrice(normalizedSizes[0].price);
      }
    }
  }, [isVisible, initialSelectedVolume, initialSelectedPrice, normalizedSizes, price]);

  const activePrice = selectedPrice || price;

  function onAddToCart(){
    if (!selectedVolume){ 
      setShowVolumeError(true);  
      return; 
    }
    addToCart(
      { productId, userId, quantity, selectedVolume, selectedPrice: activePrice },
      { onSettled: () => onClose() }
    );
    setShowVolumeError(false);
  }

  function onBuyNow(){
    if (!selectedVolume) {
      setShowVolumeError(true); 
      return;
    }
    addToCart2(
      { productId, userId, quantity, selectedVolume, selectedPrice: activePrice },
      { onSuccess: () => navigate("/cart") }
    );
  }

  return (
    <>
    <ModalBackdrop isVisible={isVisible}>
      <ModalContainer>
        <ModalBody>
          <CloseButton onClick={onClose} />
          <Img src={images[0] || images[1]} alt={name} />
          <ModalContent>
            <Middle>
                <h2>{name}</h2>
                <Price price={activePrice} discount={discount} />
                <div>
                <h3 style={{ fontSize: "1rem", margin: "10px 0 6px" }}>Select Size & Variant</h3>
                  <VolumeOptionsContainer isATCart={isATCart}>
                    {normalizedSizes.length > 0 &&
                      normalizedSizes.map((variant, i) => (
                        <VolumeOption
                          key={i}
                          className={selectedVolume === variant.size ? 'selected' : ''}
                          onClick={() => {
                            setSelectedVolume(variant.size);
                            setSelectedPrice(variant.price);
                            setShowVolumeError(false);
                          }}
                          isATCart={isATCart}
                        >
                          <span style={{ fontWeight: 600 }}>{variant.size}</span>
                          {variant.price && (
                            <span style={{ fontSize: "0.8rem", color: "#7c2d12", opacity: 0.9 }}>
                              ₦{variant.price.toLocaleString()}
                            </span>
                          )}
                        </VolumeOption>
                      ))
                    }
                  </VolumeOptionsContainer>
                  {showVolumeError && <p style={{ color: "red", fontSize: "0.88rem" }}>Please select a volume size</p>}
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", margin: "10px 0 6px" }}>Quantity</h3>
                  <QuantityCounter available={available} setQuantity={setQuantity} isATCart={isATCart}/>
                </div>
            </Middle>
            <Lower>
                <Button size="large" variation="cart" onClick={onAddToCart} disabled={isATCart || isATCart2}>{ isATCart ? <MiniLoader /> : "ADD TO CART"}</Button>
                <Button size="large" variation="danger" onClick={onBuyNow} disabled={isATCart2 || isATCart}>{ isATCart2 ? <MiniLoader /> : "BUY NOW"}</Button>
            </Lower>
          </ModalContent>
        </ModalBody>
      </ModalContainer>
    </ModalBackdrop>
    </>
  );
}

const ModalBackdrop = styled.div`
  display: ${({ isVisible }) => (isVisible ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const slideUp = keyframes`
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  bottom: 0;
  top: auto;
  background-color: var(--bg-card, whitesmoke);
  color: var(--text-primary);
  width: 100%;
  z-index: 2000;

  display: flex;
  flex-direction: column;

  transform: translateY(100%);
  animation: ${({ isVisible }) =>
    isVisible || 
      css`${slideUp} .5s ease forwards
  `};

  @media (width < 400px) and (height < 700px) {
    height: 96%;
  }

  @media (min-width: 400px) and (max-width: 540px) {
    height: 78%;
  }

  @media (min-width: 540px) and (max-width: 1024px) {
    height: 85%;
  }

  @media (min-width: 1024px){
    width: 75%;
    height: 85%;
    margin: 0 auto;
    left: 0;
    right: 0;

  }

  @media (min-width: 540px) and (max-width: 720px) and (min-height: 700px) and (max-height: 900px) {
    height: 85%;
  }

  @media (min-width: 900px) and (max-width: 1200px) and (min-height: 600px) and (max-height: 1000px) {
    height: 96%;
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (min-width: 1024px){
    flex-direction: row;
    padding: 10px;
    gap: 20px;
  }
`;

const Img = styled.img`
  width: 100%; 
  max-height: 60%;
  object-fit: cover;
  object-position: 70% 0%;

  @media (min-width: 1024px){
    width: 60%; 
    max-height: 100%;
  }
`;

const ModalContent = styled.div`
  display: flex;
  height: 40%;
  flex-direction: column;
  font-size: 1.2rem;
  padding: 0 10px; 
  overflow-y: auto;

  @media (min-width: 1024px){
    width: 40%; 
    height: 100%;
    
  }
`;

const VolumeOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 5px 0 10px;

  cursor: ${({ isATCart }) => (isATCart ? "not-allowed" : "pointer")};
`;

const VolumeOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 6px;
  border: 2px solid rgb(222, 224, 225);
  background-color: ${({ isATCart }) => (isATCart ? "rgba(116, 116, 116, 0.2)" : "var(--color-grey-50, #f9fafb)" )};
  cursor: pointer;
  pointer-events: ${({ isATCart }) => (isATCart ? "none" : "auto")};
  transition: all 0.2s ease;
  min-width: 70px;

  &:hover {
    border-color: #7c2d12;
  }

  &.selected {
    border-color: #7c2d12;
    background-color: #fef3c7;
    box-shadow: 0 2px 6px rgba(124, 45, 18, 0.15);
  }
`;

const Middle = styled.div`
  flex: 1;
  margin: 2px 0 5px ;
  overflow-y: auto;
`;

const Lower = styled.div`
  display: flex;
  justify-content: space-evenly;
  height: fit-content;
  padding: 8px 0;

  @media (min-width: 1024px){
    flex-direction: column;
    gap: 10px;
    align-items: center; 

    Button{
      width: 100%; 
    }
  }
`;
