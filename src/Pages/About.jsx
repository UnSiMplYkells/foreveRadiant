import styled from "styled-components";
import { Link } from "react-router-dom";
import { 
  HiOutlineSparkles, 
  HiOutlineCheckBadge, 
  HiOutlineUserGroup,
  HiOutlineHeart,
  HiOutlineArrowRight
} from "react-icons/hi2";

const AboutUsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 10px 80px;
  display: flex;
  flex-direction: column;
  gap: 60px;
`;

const PageTitle = styled.h2`
  font-weight: 700;
  text-transform: uppercase;
  font-size: 2rem;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  color: var(--text-primary);

  span {
    color: var(--color-brown);
  }
`;

const StorySection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 50px;
  align-items: center;

  @media (max-width: 868px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const StoryImageContainer = styled.div`
  position: relative;
  width: 100%;

  img {
    width: 100%;
    height: 480px;
    object-fit: cover;
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);

    @media (max-width: 768px) {
      height: 340px;
    }
  }
`;

const StoryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;

  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
  }

  p {
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--text-secondary);
    margin: 0;
  }
`;

const ValuesSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
`;

const ValueCard = styled.div`
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--color-brown);
    box-shadow: var(--shadow-md);
  }

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background-color: var(--bg-surface-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-brown);
    font-size: 1.7rem;
    border: 1px solid var(--border-color);
  }

  h4 {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  p {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }
`;

const MissionBanner = styled.div`
  background: linear-gradient(135deg, var(--bg-surface-soft) 0%, var(--bg-surface) 100%);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 40px clamp(20px, 4vw, 50px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
  align-items: center;

  h3 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-brown);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    max-width: 760px;
    font-size: 1.15rem;
    line-height: 1.7;
    color: var(--text-primary);
    margin: 0;
  }
`;

const CtaSection = styled.div`
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;

  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  p {
    font-size: 1rem;
    color: var(--text-secondary);
    max-width: 500px;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: var(--color-brown);
    color: white !important;
    font-weight: 700;
    padding: 14px 32px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.95rem;
    transition: all 0.25s ease;

    &:hover {
      background-color: var(--color-brown-hover);
      transform: translateY(-2px);
    }
  }
`;

export default function AboutUs() {
  return (
    <AboutUsContainer>
      <PageTitle>
        ABOUT <span>US_</span>
      </PageTitle>

      {/* STORY SECTION */}
      <StorySection>
        <StoryImageContainer>
          <img
            src="/Images/ui/founder-story.jpg"
            alt="Forever Radiant Botanical Founder & Laboratory"
          />
        </StoryImageContainer>

        <StoryContent>
          <h3>Honest Formulas. Simple Botanical Care.</h3>
          <p>
            Forever Radiant started with a straightforward goal: build everyday skincare and haircare using pure plant oils, unrefined butters, and soothing extracts without heavy fillers, silicones, or parabens.
          </p>
          <p>
            Every formula in our catalog is prepared in small batches using cold-pressed African seed oils, aloe vera, and gentle botanicals—focusing on texture, absorption, and comfort so your morning and evening routine feels effortless.
          </p>
          <p>
            From sourcing raw ingredients responsibly to sealing every bottle cleanly before dispatch, we prioritize quality you can actually feel over empty marketing claims.
          </p>
        </StoryContent>
      </StorySection>

      {/* MISSION BANNER */}
      <MissionBanner>
        <h3>Our Purpose</h3>
        <p>
          "To make gentle, clean botanical skincare and haircare practical for everyday routines across every skin tone and hair texture."
        </p>
      </MissionBanner>

      {/* VALUES / WHY CHOOSE US */}
      <ValuesSection>
        <PageTitle>
          WHY <span>CHOOSE US_</span>
        </PageTitle>

        <ValuesGrid>
          <ValueCard>
            <div className="icon">
              <HiOutlineSparkles />
            </div>
            <h4>Small-Batch Freshness</h4>
            <p>
              Prepared in measured runs so active plant oils and butters stay fresh and effective.
            </p>
          </ValueCard>

          <ValueCard>
            <div className="icon">
              <HiOutlineCheckBadge />
            </div>
            <h4>Gentle &amp; Balanced</h4>
            <p>
              Non-comedogenic, pH-balanced formulas made to soothe and hydrate sensitive skin.
            </p>
          </ValueCard>

          <ValueCard>
            <div className="icon">
              <HiOutlineUserGroup />
            </div>
            <h4>Reliable Support</h4>
            <p>
              Responsive direct support, straightforward checkout, and tracked door-to-door delivery.
            </p>
          </ValueCard>

          <ValueCard>
            <div className="icon">
              <HiOutlineHeart />
            </div>
            <h4>Cruelty Free</h4>
            <p>
              Zero animal testing, ethically sourced plant ingredients, and recyclable packaging.
            </p>
          </ValueCard>
        </ValuesGrid>
      </ValuesSection>

      {/* CTA SECTION */}
      <CtaSection>
        <h3>Find What Fits Your Routine</h3>
        <p>Browse our latest skincare and haircare formulas.</p>
        <Link to="/collection">
          Explore The Collection <HiOutlineArrowRight />
        </Link>
      </CtaSection>
    </AboutUsContainer>
  );
}
