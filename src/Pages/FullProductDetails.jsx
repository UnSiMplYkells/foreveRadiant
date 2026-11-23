import styled from 'styled-components';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMoveBack } from '../Hooks/useMoveBack';
import Button from "../ui/Button";
import ReviewsDesc from "../ui/ReviewsDesc";
import Discipline from '../ui/CompanyDiscipline';
import Price from '../ui/Price';
import CollectionsMenuItem from '../Features/Collections/CollectionsMenuItem';
import { useQuery } from '@tanstack/react-query';
import { fetchProductDetails, getProduct } from '../Services/apiProducts';
import { useProductReviews } from '../Hooks/useReviews';
import { FaStar } from 'react-icons/fa';
import CartModal from "./CartModal"
import Loader from '../ui/Loader';

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
`;

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  margin-top: clamp(1rem, 2.5vw, 3.5rem);
  padding: 0 clamp(10px, 2vw, 24px);
  box-sizing: border-box;

  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: clamp(2rem, 3.5vw, 4.5rem);
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  gap: 14px;
  height: 480px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 540px) {
    flex-direction: column-reverse;
    height: auto;
    gap: 10px;
  }
`;

const LeftImageColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 88px;
  min-width: 88px;
  max-height: 480px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color, #e5e7eb);
    border-radius: 4px;
  }

  @media (max-width: 540px) {
    flex-direction: row;
    width: 100%;
    min-width: unset;
    max-height: unset;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }
`;

const LeftImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${({ isActive }) => (isActive ? "var(--color-brown, #7c2d12)" : "var(--border-color, #e5e7eb)")};
  background-color: var(--bg-surface-soft, #f9fafb);
  transition: all 0.2s ease;
  box-sizing: border-box;

  @media (max-width: 540px) {
    width: 68px;
    height: 68px;
    flex-shrink: 0;
  }

  &:hover {
    border-color: var(--color-brown, #7c2d12);
    transform: scale(1.03);
  }
`;

const RightImageDisplay = styled.div`
  flex: 1;
  min-width: 0;
  height: 480px;
  background-color: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 540px) {
    height: 350px;
    width: 100%;
  }
`;

const RightImage = styled.img`
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
`;

const RightColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  box-sizing: border-box;
  text-transform: uppercase;
`;
const ProductDetails = styled.div`
  height: 70%;

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`
const NameAvailability = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 0.4rem;

  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-grey-900);
    letter-spacing: 0.03em;
  }

  p {
    font-size: 1.1rem;
    text-transform: uppercase;
    font-weight: 600;
    color: #ef4444;
    letter-spacing: 0.05em;
  }
`;

const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  margin-top: 0.2rem;
  width: fit-content;

  .stars {
    display: flex;
    color: #f59e0b;
    font-size: 1.3rem;
    gap: 0.15rem;
  }

  .score {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--color-grey-800);
  }

  .count {
    font-size: 1.2rem;
    color: var(--color-grey-500);
    text-decoration: underline;
  }
`;
const MenuSection = styled.div`
  padding-top: 8rem;
`
const MenuHeading = styled.h2`
  font-weight: 500;
  width: fit-content;
  margin: 0 auto;
  text-transform: uppercase; 

  span{
    font-weight:700;
  }
`
const MenuContainer = styled.ul`
  display: grid; 
  gap: 3rem; /* Spacing between items */
  padding-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    row-gap: 2rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: 4rem;
  }

  @media (min-width: 1200px) {
    width: 95%;
    margin: auto;
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  
`;

const SizeSelectionBox = styled.div`
  margin: 14px 0 10px;

  .label {
    display: block;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--color-grey-700, #374151);
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pill {
    background: var(--color-grey-50, #f9fafb);
    border: 1.5px solid var(--color-grey-200, #e5e7eb);
    border-radius: 6px;
    padding: 6px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 70px;

    .size-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-grey-800, #1f2937);
    }

    .size-price {
      font-size: 0.78rem;
      color: var(--color-brown, #7c2d12);
      font-weight: 500;
    }

    &:hover {
      border-color: var(--color-brown, #7c2d12);
      transform: translateY(-1px);
    }

    &.active {
      border-color: var(--color-brown, #7c2d12);
      background: #fef3c7;
      box-shadow: 0 2px 4px rgba(124, 45, 18, 0.12);

      .size-name {
        color: #7c2d12;
      }
    }
  }
`;

export default function FullProductDetails() {
  const moveBack = useMoveBack();
  const { productId } = useParams();
  
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: getProduct,
    staleTime: 60 * 1000,
  });

  const { data: selectedProduct, isLoading, error } = useQuery({
    queryKey: ['productDetails', productId],
    queryFn: () => fetchProductDetails(productId),
    staleTime: 60 * 1000,
  });

  const { totalReviews, averageRating } = useProductReviews(productId);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const normalizedSizes = useMemo(() => {
    const raw = selectedProduct?.size;
    const basePrice = Number(selectedProduct?.price) || 5000;
    let list = raw;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [list];
      }
    }
    if (!Array.isArray(list)) list = list ? [list] : [];

    return list.map((item) => {
      if (typeof item === "object" && item !== null && item.size) {
        return {
          size: String(item.size),
          price: Number(item.price) || basePrice,
        };
      }
      const label = String(item).includes("ml") || String(item).includes("g") ? String(item) : `${item}ml`;
      return {
        size: label,
        price: basePrice,
      };
    });
  }, [selectedProduct?.size, selectedProduct?.price]);

  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (selectedProduct?.image_url?.length > 0) {
      setActiveImage(selectedProduct.image_url[0]);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (normalizedSizes.length > 0) {
      setSelectedVariant(normalizedSizes[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [normalizedSizes]);

  function toggleModal() {
    setModalVisible((prev) => !prev);
  }

  function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) return <Loader />;
  if (error) return <div>Error: {error.message}</div>;

  if (!selectedProduct) {
    return (
      <>
        <button onClick={moveBack}> &larr; Go back</button>
        <h2>Product not found</h2>
      </>
    );
  }

  const {
    name,
    price = 0,
    image_url: images = [],
    discount = 0,
    available,
    category,
    id: product_id,
  } = selectedProduct;

  const activePrice = selectedVariant?.price || price;

  return (
    <>
      <MainContainer>
        <Container>
          <LeftColumn>  
            <LeftImageColumn>
              {images.length > 0 ? (
                images.map((image, i) => (
                  <LeftImage
                    key={image || i}
                    src={image}
                    alt={`${name} thumbnail ${i + 1}`}
                    isActive={activeImage === image}
                    onClick={() => setActiveImage(image)}
                    onError={(e) => {
                      e.target.src = "/Images/darklogo.png";
                    }}
                  />
                ))
              ) : (
                <p>No images available</p>
              )}
            </LeftImageColumn>

            <RightImageDisplay>
              {activeImage && (
                <RightImage
                  src={activeImage}
                  alt={name || "Product image"}
                  onError={(e) => {
                    e.target.src = "/Images/darklogo.png";
                  }}
                />
              )}
            </RightImageDisplay>
          </LeftColumn>
          <RightColumn>
            <ProductDetails>
              <NameAvailability>
                <h3>{name}</h3>
                <RatingBadge
                  onClick={() => {
                    const el = document.getElementById("reviews-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  title="Click to view customer reviews"
                >
                  <span className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        style={{
                          opacity: star <= Math.round(Number(averageRating)) ? 1 : 0.35,
                        }}
                      />
                    ))}
                  </span>
                  <span className="score">{averageRating}</span>
                  <span className="count">
                    ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </RatingBadge>
                <p>Hurry Up: {available} remaining</p>
              </NameAvailability>

              {normalizedSizes.length > 0 && (
                <SizeSelectionBox>
                  <span className="label">Choose Size & Volume:</span>
                  <div className="pills">
                    {normalizedSizes.map((variant, i) => (
                      <button
                        key={i}
                        type="button"
                        className={selectedVariant?.size === variant.size ? "pill active" : "pill"}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        <span className="size-name">{variant.size}</span>
                        <span className="size-price">₦{variant.price.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </SizeSelectionBox>
              )}

              <Price price={activePrice} discount={discount}/>
              <Button size="large" variation="cart" onClick={toggleModal}>ADD TO CART</Button>
            </ProductDetails>
            <Discipline />
          </RightColumn>
        </Container>
        <div id="reviews-section" style={{ scrollMarginTop: "2rem" }}>
          <ReviewsDesc item={selectedProduct} />
        </div>
      </MainContainer>
      <MenuSection>
        <MenuHeading>Related <span>products_</span></MenuHeading>
        <MenuContainer onClick={handleScrollToTop}>
          {products && products.length > 0 ?
            products
              .filter((item) => item.category === `${category}`)
              .map((item, index) => (
                <CollectionsMenuItem key={index} item={item} />
              ))
            : <p>No related products available</p>
          }
        </MenuContainer>
      </MenuSection>

      <CartModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        selectedProduct={selectedProduct}
        productId={product_id}
        initialSelectedVolume={selectedVariant?.size}
        initialSelectedPrice={selectedVariant?.price}
      />
    </>
  );
}
