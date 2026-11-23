import { useState } from "react";
import styled from "styled-components";
import Reviews from "../Features/Reviews/Reviews";
import { useProductReviews } from "../Hooks/useReviews";
import { FaLeaf, FaCheck } from "react-icons/fa";

const Container = styled.div`
  margin: 5rem auto 3rem;
  width: 90%;
  max-width: 1200px;

  @media (max-width: 1024px) {
    margin: 3rem auto 4rem;
  }

  @media (max-width: 540px) {
    width: 96%;
    margin: 2rem auto;
  }
`;

const TabList = styled.ul`
  display: flex;
  gap: 0.8rem;
  border-bottom: 2px solid var(--color-grey-200);
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Tab = styled.li`
  margin-bottom: -2px;
`;

const TabButton = styled.button`
  background: transparent;
  border: none;
  border-bottom: 3px solid ${(props) => (props.active ? "#d97706" : "transparent")};
  color: ${(props) => (props.active ? "var(--color-grey-900)" : "var(--color-grey-500)")};
  padding: 1.2rem 2rem;
  font-size: 1.5rem;
  font-weight: ${(props) => (props.active ? "700" : "500")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-grey-900);
  }

  span.badge {
    background: ${(props) => (props.active ? "#d97706" : "var(--color-grey-200)")};
    color: ${(props) => (props.active ? "#ffffff" : "var(--color-grey-600)")};
    font-size: 1.1rem;
    font-weight: 700;
    padding: 0.2rem 0.7rem;
    border-radius: 999px;
  }
`;

const ContentPanel = styled.div`
  padding: 3rem 1rem;
  min-height: 250px;
`;

const DescriptionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const MainText = styled.div`
  p {
    font-size: 1.5rem;
    line-height: 1.8;
    color: var(--color-grey-700);
    margin-bottom: 1.8rem;
  }

  h4 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--color-grey-900);
    margin-top: 2rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  ul {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    li {
      font-size: 1.4rem;
      color: var(--color-grey-700);
      display: flex;
      align-items: center;
      gap: 0.8rem;

      svg {
        color: #10b981;
        flex-shrink: 0;
      }
    }
  }
`;

const SidebarHighlights = styled.div`
  background: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: 12px;
  padding: 2.2rem;
  height: fit-content;

  h4 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-grey-900);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1.6rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
`;

const HighlightItem = styled.div`
  margin-bottom: 1.4rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid var(--color-grey-200);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  strong {
    display: block;
    font-size: 1.3rem;
    color: var(--color-grey-800);
    margin-bottom: 0.3rem;
  }

  span {
    font-size: 1.2rem;
    color: var(--color-grey-500);
    line-height: 1.4;
    display: block;
  }
`;

export default function ReviewsDesc({ item = {} }) {
  const [activeTab, setActiveTab] = useState("reviews"); // Default to reviews so user sees the review system immediately
  const { totalReviews } = useProductReviews(item?.id);

  return (
    <Container>
      <TabList>
        <Tab>
          <TabButton
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
          >
            Customer Reviews
            <span className="badge">{totalReviews}</span>
          </TabButton>
        </Tab>
        <Tab>
          <TabButton
            active={activeTab === "description"}
            onClick={() => setActiveTab("description")}
          >
            Product Overview & Ritual
          </TabButton>
        </Tab>
      </TabList>

      <ContentPanel>
        {activeTab === "description" && (
          <DescriptionGrid>
            <MainText>
              <p>{item.description}</p>

              <h4>Directions for Use</h4>
              <p>
                Dispense a generous amount into clean palms. Gently warm between fingertips
                and massage with circular upward motions into scalp, hair, or freshly cleansed
                skin. Use morning and night as part of your daily radiance routine.
              </p>

              <h4>Formulated With Pure Intentions</h4>
              <ul>
                <li>
                  <FaCheck /> 100% Cold-pressed botanical extracts & virgin seed oils
                </li>
                <li>
                  <FaCheck /> Zero artificial sulfates, parabens, phthalates, or silicones
                </li>
                <li>
                  <FaCheck /> Cruelty-free, vegan, and environmentally conscious packaging
                </li>
                <li>
                  <FaCheck /> Dermatologist-tested and pH balanced for sensitive skin & scalp
                </li>
              </ul>
            </MainText>

            <SidebarHighlights>
              <h4>
                <FaLeaf style={{ color: "#10b981" }} /> Purity Highlights
              </h4>

              <HighlightItem>
                <strong>Ethical Botanical Sourcing</strong>
                <span>Directly sourced from sustainable small-batch organic farmers.</span>
              </HighlightItem>

              <HighlightItem>
                <strong>Active Efficacy</strong>
                <span>Clinically tested for rapid absorption and moisture retention.</span>
              </HighlightItem>

              <HighlightItem>
                <strong>Recyclable Glass Packaging</strong>
                <span>Preserves essential nutrient potency while safeguarding the planet.</span>
              </HighlightItem>
            </SidebarHighlights>
          </DescriptionGrid>
        )}

        {activeTab === "reviews" && (
          <Reviews productId={item.id} />
        )}
      </ContentPanel>
    </Container>
  );
}
