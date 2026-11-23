import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6";

const FooterWrapper = styled.footer`
  width: 100%;
  background-color: var(--footer-bg);
  border-top: 1px solid var(--border-color);
  font-size: 1.3rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 40px clamp(16px, 4vw, 60px) 30px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  li {
    padding: 6px 0;
  }

  a {
    color: var(--text-secondary);
    transition: color 0.2s;

    &:hover {
      color: var(--color-brown);
    }
  }
`;

const BrandSection = styled.div`
  max-width: 420px;

  h2 {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--color-brown);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  p {
    font-size: 1.3rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }
`;

const ReachOut = styled.div`
  width: fit-content;
  margin: 0 auto;
  padding: 10px 0 30px;
  text-align: center;

  p {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
  }
`;

const SocialHandles = styled.ul`
  display: flex;
  justify-content: center;
  gap: 20px;

  li {
    border: 1px solid var(--border-color);
    background-color: var(--bg-surface);
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.25s ease;

    &:hover {
      background-color: var(--color-brown);
      border-color: var(--color-brown);
      transform: translateY(-2px);

      a {
        color: white;
      }
    }
  }

  a {
    color: var(--text-primary);
    display: flex;
    align-items: center;

    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const Copyright = styled.div`
  font-size: 1.2rem;
  text-align: center;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-surface-soft);
  color: var(--text-muted);

  span {
    font-weight: 600;
    color: var(--color-brown);
  }
`;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <Container>
        <BrandSection>
          <h2>Forever Radiant</h2>
          <p>
            Clean, science-backed formulas crafted with sustainably sourced botanicals.
            Dedicated to empowering your daily skincare and haircare ritual with timeless luxury.
          </p>
        </BrandSection>

        <div>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/collection">Collections</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/privacyPolicy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div id="contact" style={{ scrollMarginTop: "5rem" }}>
          <h3>Contact</h3>
          <ul>
            <li>foreveradiant@gmail.com</li>
            <li>Direct: +234 705-406-3595</li>
            <li>Support: +234 913-409-3236</li>
          </ul>
        </div>
      </Container>

      <ReachOut>
        <p>Connect with our community:</p>
        <SocialHandles>
          <li>
            <a href="https://www.instagram.com/_unsimplykells/?igsh=N3prenlwOWx6NjYw#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </li>
          <li>
            <a href="https://www.tiktok.com/@thehealer800?_t=ZM-8uF22kpQsnl&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok />
            </a>
          </li>
          <li>
            <a href="https://x.com/theHealer800?t=itn8w0XAWljhKT3eCag4TA&s=09" target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter />
            </a>
          </li>
        </SocialHandles>
      </ReachOut>

      <Copyright>
        &copy; {currentYear} Forever Radiant Inc. Engineered by <span>UnSiMplYkells.dev</span>. All Rights Reserved.
      </Copyright>
    </FooterWrapper>
  );
}
