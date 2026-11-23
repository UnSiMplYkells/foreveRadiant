import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDoNotDisturb } from "react-icons/md";
import Price from '../../ui/Price';

export default function CollectionsMenuItem({ item }) {
  const { name, price, image_url: images = [], id, discount, available, created_at: dateCreated } = item;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const imageList = Array.isArray(images) ? images : images ? [images] : ["/Images/placeholder.png"];

  const currentDate = new Date();
  const createdDate = new Date(dateCreated);
  const timeDiff = currentDate - createdDate;
  const daysDifference = timeDiff / (1000 * 3600 * 24);

  useEffect(() => {
    if (isHovered && imageList.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageList.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHovered, imageList.length]);

  const currentImg = imageList[currentIndex] || imageList[0] || "/Images/placeholder.png";

  return (
    <>
      {available !== 0 ? (
        <Linked to={`/productDetails/${id}`}>
          <MenuProduct>
            {daysDifference <= 14 && daysDifference >= 0 && (
              <New>
                <p>NEW</p>
              </New>
            )}
            <ImageWrapper
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Img
                src={currentImg}
                alt={name}
                onError={(e) => {
                  e.target.src = "/Images/darklogo.png";
                }}
              />
            </ImageWrapper>
            <Details>
              <h5>{name}</h5>
              <Price price={price} discount={discount} />
            </Details>
          </MenuProduct>
        </Linked>
      ) : (
        <MenuProduct>
          <Div>
            <MdDoNotDisturb />
            <p>Out of Stock</p>
          </Div>
          {daysDifference <= 14 && daysDifference >= 0 && (
            <New>
              <p>NEW</p>
            </New>
          )}
          <ImageWrapper
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Img
              src={currentImg}
              alt={name}
              onError={(e) => {
                e.target.src = "/Images/darklogo.png";
              }}
            />
          </ImageWrapper>
          <Details>
            <h5>{name}</h5>
            <Oos>Out of stock. Check back soon</Oos>
          </Details>
        </MenuProduct>
      )}
    </>
  );
}

const MenuProduct = styled.li`
  cursor: pointer;
  position: relative;
  z-index: 1;
  background-color: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  padding: 12px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

const Div = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 6px;
  border-radius: 12px;
  font-weight: 600;

  & svg {
    color: #ef4444;
    transform: scale(1.3);
  }
`;

const New = styled.div`
  width: fit-content;
  height: fit-content;
  padding: 3px 10px;
  border-radius: 9999px;
  background-color: var(--color-brown);
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 3;
  font-weight: 700;
  color: white;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
`;

const ImageWrapper = styled.div`
  overflow: hidden;
  border-radius: 8px;
  width: 100%;
  max-width: 256px;
  aspect-ratio: 1 / 1;
  max-height: 256px;
  margin: 0 auto;
  background-color: var(--bg-surface-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Img = styled.img`
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Details = styled.div`
  margin: 1rem 0 0.4rem 0.2rem;
  text-transform: capitalize;

  h5 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Oos = styled.p`
  font-size: 0.85rem;
  color: #ef4444;
  margin-top: 4px;
`;

const Linked = styled(Link)`
  color: inherit;
  display: block;
`;
