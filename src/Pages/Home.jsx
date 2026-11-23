import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useProducts } from "../Hooks/useProducts";
import CollectionsMenuItem from "../Features/Collections/CollectionsMenuItem";
import Loader from "../ui/Loader";
import { 
  HiOutlineSparkles, 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineHeart,
  HiOutlineArrowRight
} from "react-icons/hi2";
import toast from "react-hot-toast";

// ==========================================
// STYLED COMPONENTS
// ==========================================
const HomeContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding-bottom: 60px;

  @media (max-width: 768px) {
    gap: 50px;
  }
`;

// 1. HERO SECTION
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 40px;
  padding: 40px 0 20px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 20px 0;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  background-color: var(--color-brand-50);
  color: var(--color-brown);
  border: 1px solid var(--border-color);
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.8rem, 4.5vw, 4.6rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  letter-spacing: -0.5px;

  span {
    color: var(--color-brown);
    position: relative;
    display: inline-block;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.4rem, 1.8vw, 1.8rem);
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 540px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 10px;
  flex-wrap: wrap;

  @media (max-width: 968px) {
    justify-content: center;
  }
`;

const PrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-brown);
  color: white !important;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 32px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(124, 45, 18, 0.25);

  &:hover {
    background-color: var(--color-brown-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 45, 18, 0.35);
  }
`;

const SecondaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-surface);
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 1rem;
  padding: 14px 28px;
  border-radius: 6px;
  transition: all 0.25s ease;

  &:hover {
    background-color: var(--color-grey-100);
    border-color: var(--color-grey-400);
    transform: translateY(-2px);
  }
`;

const HeroImageContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 500px;
  height: 480px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);

  @media (max-width: 768px) {
    height: 360px;
  }
`;

const FloatingCard = styled.div`
  position: absolute;
  bottom: -20px;
  left: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 14px 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 260px;

  @media (max-width: 600px) {
    display: none;
  }

  .icon {
    font-size: 1.8rem;
    color: var(--color-brown);
  }

  h5 {
    font-size: 0.95rem;
    margin: 0;
    color: var(--text-primary);
  }

  p {
    font-size: 0.8rem;
    margin: 0;
    color: var(--text-muted);
  }
`;

// 2. VALUE PROPOSITIONS
const FeaturesGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

const FeatureCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px 20px;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-brown);
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background-color: var(--bg-surface-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-brown);
    font-size: 1.6rem;
    border: 1px solid var(--border-color);
  }

  h4 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }

  p {
    font-size: 0.92rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
`;

// 3. FEATURED PRODUCTS
const SectionHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 30px;

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;

    span {
      color: var(--color-brown);
    }
  }

  a {
    color: var(--color-brown);
    font-size: 0.95rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ProductsGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
`;

// 4. MARKETING PROMO BANNER
const PromoBanner = styled.section`
  background: linear-gradient(135deg, #4b1010 0%, #7c2d12 100%);
  border-radius: 16px;
  padding: 50px 40px;
  color: white;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 40px;
  box-shadow: var(--shadow-lg);

  @media (max-width: 868px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 35px 24px;
  }

  h2 {
    font-size: clamp(2rem, 3.2vw, 2.8rem);
    color: white;
    font-weight: 800;
    margin-bottom: 12px;
  }

  p {
    font-size: 1.1rem;
    color: #f3f4f6;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .promo-code {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    border: 1px dashed rgba(255, 255, 255, 0.4);
    padding: 10px 18px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 1.1rem;
    letter-spacing: 1px;
    display: inline-block;
    margin-bottom: 20px;
  }
`;

const BannerActionBtn = styled(Link)`
  display: inline-block;
  background-color: white;
  color: #4b1010 !important;
  font-weight: 700;
  padding: 14px 30px;
  border-radius: 6px;
  text-transform: uppercase;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: all 0.25s ease;

  &:hover {
    background-color: #f3f4f6;
    transform: scale(1.03);
  }
`;

// 5. TESTIMONIALS
const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const TestimonialCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  box-shadow: var(--shadow-sm);

  .stars {
    color: #f59e0b;
    font-size: 1.2rem;
    letter-spacing: 2px;
  }

  blockquote {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-secondary);
    font-style: italic;
    margin: 0;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
    }

    strong {
      display: block;
      font-size: 0.95rem;
      color: var(--text-primary);
    }

    span {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  }
`;

// 6. NEWSLETTER
const NewsletterSection = styled.section`
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 40px clamp(20px, 5vw, 60px);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }

  p {
    font-size: 1.05rem;
    color: var(--text-secondary);
    max-width: 520px;
    margin: 0;
  }

  form {
    display: flex;
    gap: 10px;
    width: 100%;
    max-width: 480px;
    margin-top: 10px;

    @media (max-width: 500px) {
      flex-direction: column;
    }

    input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.95rem;
      outline: none;

      &:focus {
        border-color: var(--color-brown);
      }
    }

    button {
      padding: 12px 24px;
      background-color: var(--color-brown);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--color-brown-hover);
      }
    }
  }
`;

// ==========================================
// COMPONENT
// ==========================================
export default function Home() {
  const [email, setEmail] = useState("");
  const { products, isLoading } = useProducts({ page: 1, limit: 4, category: "All" });

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      return toast.error("Please provide a valid email address");
    }
    toast.success("Welcome to the Radiant Circle! Check your inbox for your 15% discount code.");
    setEmail("");
  }

  return (
    <HomeContainer>
      {/* 1. HERO SECTION */}
      <Hero>
        <HeroContent>
          <Pill>
            <HiOutlineSparkles /> Clean, Botanical Luxury
          </Pill>
          <HeroTitle>
            Awaken Your <span>Natural Radiance</span> with Botanical Mastery
          </HeroTitle>
          <HeroSubtitle>
            Indulge in physician-tested organic skincare and haircare elixirs. Crafted in artisanal small batches to nourish, heal, and illuminate your authentic beauty.
          </HeroSubtitle>
          <ButtonGroup>
            <PrimaryBtn to="/collection">
              Shop Collections <HiOutlineArrowRight />
            </PrimaryBtn>
            <SecondaryBtn to="/about">
              Discover Our Story
            </SecondaryBtn>
          </ButtonGroup>
        </HeroContent>

        <HeroImageContainer>
          <HeroImage src="/Images/ui/hero-radiant.jpg" alt="Forever Radiant Natural Beauty" />
          <FloatingCard>
            <div className="icon">
              <HiOutlineHeart />
            </div>
            <div>
              <h5>100% Organic Extracts</h5>
              <p>Zero parabens, 100% cruelty-free</p>
            </div>
          </FloatingCard>
        </HeroImageContainer>
      </Hero>

      {/* 2. VALUE PROPOSITIONS */}
      <FeaturesGrid>
        <FeatureCard>
          <div className="feature-icon">
            <HiOutlineSparkles />
          </div>
          <h4>Clean & Botanical Formulas</h4>
          <p>Hand-selected organic botanicals formulated without harsh parabens or artificial fillers.</p>
        </FeatureCard>

        <FeatureCard>
          <div className="feature-icon">
            <HiOutlineShieldCheck />
          </div>
          <h4>Dermatologically Validated</h4>
          <p>Carefully balanced pH formulations crafted to nurture sensitive skin and promote scalp health.</p>
        </FeatureCard>

        <FeatureCard>
          <div className="feature-icon">
            <HiOutlineTruck />
          </div>
          <h4>Express Insured Delivery</h4>
          <p>Fast, direct-to-door nationwide delivery with temperature-controlled protective packaging.</p>
        </FeatureCard>

        <FeatureCard>
          <div className="feature-icon">
            <HiOutlineHeart />
          </div>
          <h4>Sustainable & Ethical</h4>
          <p>Recyclable apothecary packaging and ethically harvested ingredients empowering rural farmers.</p>
        </FeatureCard>
      </FeaturesGrid>

      {/* 3. FEATURED PRODUCTS PREVIEW */}
      <section>
        <SectionHeading>
          <h2>Featured <span>Elixirs_</span></h2>
          <Link to="/collection">
            View All ({products?.length || 0}+ Items) &rarr;
          </Link>
        </SectionHeading>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader />
          </div>
        ) : products && products.length > 0 ? (
          <ProductsGrid>
            {products.slice(0, 4).map((item) => (
              <CollectionsMenuItem key={item.id} item={item} />
            ))}
          </ProductsGrid>
        ) : (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
            Loading signature items...
          </p>
        )}
      </section>

      {/* 4. MARKETING / PROMO BANNER */}
      <PromoBanner>
        <div>
          <h2>The Radiant Glow Ritual</h2>
          <p>
            Pair our best-selling botanical hair oil with rejuvenating aloe skin therapy. Experience 24-hour hydration and natural luminance.
          </p>
          <div className="promo-code">
            USE CODE: <strong>RADIANT15</strong> FOR 15% OFF
          </div>
          <div>
            <BannerActionBtn to="/collection">
              Claim Your Offer
            </BannerActionBtn>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src="/Images/ui/promo-botanical.jpg"
            alt="Promotion item"
            style={{
              maxHeight: "280px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              objectFit: "cover",
            }}
          />
        </div>
      </PromoBanner>

      {/* 5. TESTIMONIALS */}
      <section>
        <SectionHeading>
          <h2>Loved by <span>Thousands_</span></h2>
          <span style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>Verified Customer Experiences</span>
        </SectionHeading>

        <TestimonialsGrid>
          <TestimonialCard>
            <div className="stars">★★★★★</div>
            <blockquote>
              "The botanical hair oil transformed my edges and scalp within three weeks. It’s light, smells heavenly, and genuinely works."
            </blockquote>
            <div className="author">
              <img src="/Images/ui/testimonial-1.jpg" alt="Amina K." />
              <div>
                <strong>Amina K.</strong>
                <span>Verified Buyer, Abuja</span>
              </div>
            </div>
          </TestimonialCard>

          <TestimonialCard>
            <div className="stars">★★★★★</div>
            <blockquote>
              "I have hyper-sensitive skin and everything used to break me out. Forever Radiant products are the only formulas that calm my skin."
            </blockquote>
            <div className="author">
              <img src="/Images/ui/testimonial-2.jpg" alt="Chioma E." />
              <div>
                <strong>Chioma E.</strong>
                <span>Verified Buyer, Lagos</span>
              </div>
            </div>
          </TestimonialCard>

          <TestimonialCard>
            <div className="stars">★★★★★</div>
            <blockquote>
              "Enterprise quality packaging and customer support. The checkout was seamless, and the delivery arrived in less than 48 hours."
            </blockquote>
            <div className="author">
              <img src="/Images/ui/testimonial-3.jpg" alt="David O." />
              <div>
                <strong>David O.</strong>
                <span>Verified Buyer, Port Harcourt</span>
              </div>
            </div>
          </TestimonialCard>
        </TestimonialsGrid>
      </section>

      {/* 6. NEWSLETTER SUBSCRIPTION */}
      <NewsletterSection>
        <h3>Join the Radiant Circle</h3>
        <p>
          Subscribe to receive exclusive access to small-batch seasonal drops, skincare tips from our dermatologists, and member-only pricing.
        </p>
        <form onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </NewsletterSection>
    </HomeContainer>
  );
}
