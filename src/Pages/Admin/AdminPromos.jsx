import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  FaClock,
  FaInfinity,
  FaPercent,
  FaPlus,
  FaTag,
  FaTimes,
  FaToggleOff,
  FaToggleOn,
  FaTrashAlt,
  FaEdit,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  useAdminPromoCodes,
  useCreatePromoCode,
  useDeletePromoCode,
  useUpdatePromoCode,
} from "../../Hooks/usePromos";
import { promoCodeSchema } from "../../Validation/schemas";
import Loader from "../../ui/Loader";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .intro {
    h2 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
    }

    p {
      margin: 4px 0 0;
      font-size: 0.88rem;
      color: var(--color-grey-500, #6b7280);
    }
  }
`;

const PrimaryButton = styled.button`
  background: var(--color-brown, #7c2d12);
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--color-brown-hover, #5c200c);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
`;

const StatCard = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 18px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: ${(props) => props.$accent || "#7c2d12"};
  }

  .label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-grey-500, #6b7280);
    margin-bottom: 6px;

    svg {
      color: ${(props) => props.$accent || "#7c2d12"};
    }
  }

  .value {
    font-size: 1.65rem;
    font-weight: 800;
    color: var(--text-primary, #111827);
  }

  .sub {
    margin-top: 4px;
    font-size: 0.76rem;
    color: var(--color-grey-500, #9ca3af);
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 12px 16px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TabBtn = styled.button`
  background: ${(props) => (props.$active ? "var(--color-brown, #7c2d12)" : "var(--bg-surface-soft, #f3f4f6)")};
  color: ${(props) => (props.$active ? "#ffffff" : "var(--text-secondary, #4b5563)")};
  border: 1px solid ${(props) => (props.$active ? "var(--color-brown, #7c2d12)" : "var(--border-color, #e5e7eb)")};
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-brown, #7c2d12);
  }
`;

const SchemaNotice = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 4px solid #d97706;
  border-radius: 8px;
  padding: 16px 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  color: #78350f;

  svg {
    color: #d97706;
    font-size: 1.3rem;
    margin-top: 2px;
    flex-shrink: 0;
  }

  h4 {
    margin: 0 0 4px;
    font-size: 0.95rem;
    color: #92400e;
  }

  p {
    margin: 0;
    font-size: 0.86rem;
    line-height: 1.5;
  }

  code {
    background: rgba(217, 119, 6, 0.14);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.82rem;
  }
`;

const TableCard = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;

  th {
    text-align: left;
    padding: 13px 16px;
    background: var(--bg-surface-soft, #f9fafb);
    color: var(--color-grey-600, #4b5563);
    font-weight: 700;
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color, #f3f4f6);
    color: var(--text-primary, #1f2937);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const CodeBadge = styled.code`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--bg-surface-soft, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--color-brown, #7c2d12);
  font-family: "Sono", monospace;
  font-weight: 700;
  font-size: 0.86rem;
  letter-spacing: 0.5px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) => props.$bg || "#f3f4f6"};
  color: ${(props) => props.$color || "#374151"};
  white-space: nowrap;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const IconActionBtn = styled.button`
  background: ${(props) => props.$bg || "var(--bg-surface-soft, #f8f9fa)"};
  color: ${(props) => props.$color || "var(--text-primary, #374151)"};
  border: 1px solid ${(props) => props.$border || "var(--border-color, #e5e7eb)"};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalCard = styled.div`
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

  .modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    background: var(--bg-surface-soft, #f9fafb);

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary, #111827);
    }

    button {
      background: transparent;
      border: none;
      color: var(--color-grey-500, #6b7280);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 4px;
    }
  }
`;

const ModalForm = styled.form`
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-primary, #374151);
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 6px;
    background: var(--bg-surface, #ffffff);
    color: var(--text-primary, #111827);
    font-size: 0.9rem;
    outline: none;

    &:focus {
      border-color: var(--color-brown, #7c2d12);
    }
  }

  .field-error {
    color: #dc2626;
    font-size: 0.78rem;
    font-weight: 500;
  }
`;

const ModeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ModeOption = styled.button`
  text-align: left;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1.5px solid ${(props) => (props.$selected ? "var(--color-brown, #7c2d12)" : "var(--border-color, #e5e7eb)")};
  background: ${(props) => (props.$selected ? "var(--color-yellow-100, #fef3c7)" : "var(--bg-surface-soft, #f9fafb)")};
  color: var(--text-primary, #111827);

  strong {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.88rem;
    margin-bottom: 4px;
  }

  span {
    display: block;
    font-size: 0.76rem;
    color: var(--text-secondary, #6b7280);
    line-height: 1.35;
  }
`;

const PresetRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;

  button {
    background: var(--bg-surface-soft, #f3f4f6);
    border: 1px solid var(--border-color, #d1d5db);
    color: var(--text-primary, #374151);
    border-radius: 9999px;
    padding: 4px 10px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      border-color: var(--color-brown, #7c2d12);
      color: var(--color-brown, #7c2d12);
    }
  }
`;

function toLocalDateTimeInput(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function getPromoStatusInfo(promo) {
  const now = Date.now();
  const isExpired =
    promo.mode === "timed" &&
    promo.expires_at &&
    new Date(promo.expires_at).getTime() <= now;
  const maxReached =
    promo.max_uses !== null &&
    promo.max_uses !== undefined &&
    Number(promo.usage_count) >= Number(promo.max_uses);

  if (!promo.is_active) {
    return { key: "paused", label: "Turned Off", bg: "#f3f4f6", color: "#4b5563" };
  }
  if (isExpired) {
    return { key: "expired", label: "Expired", bg: "#fee2e2", color: "#b91c1c" };
  }
  if (maxReached) {
    return { key: "limit", label: "Limit Reached", bg: "#fef3c7", color: "#92400e" };
  }
  return { key: "active", label: "Active", bg: "#dcfce7", color: "#15803d" };
}

const INITIAL_FORM = {
  code: "",
  discount_percent: 15,
  description: "",
  mode: "manual",
  expires_at: "",
  max_uses: "",
  is_active: true,
};

export default function AdminPromos() {
  const { promoCodes, schemaMissing, isLoading } = useAdminPromoCodes();
  const { createPromo, isCreating } = useCreatePromoCode();
  const { updatePromo, isUpdating } = useUpdatePromoCode();
  const { removePromo, isDeleting } = useDeletePromoCode();

  const [filterTab, setFilterTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const stats = useMemo(() => {
    let activeNow = 0;
    let timedCount = 0;
    let manualCount = 0;
    let totalRedemptions = 0;

    promoCodes.forEach((p) => {
      const status = getPromoStatusInfo(p);
      if (status.key === "active") activeNow += 1;
      if (p.mode === "timed") timedCount += 1;
      else manualCount += 1;
      totalRedemptions += Number(p.usage_count || 0);
    });

    return { activeNow, timedCount, manualCount, totalRedemptions };
  }, [promoCodes]);

  const filteredPromos = useMemo(() => {
    return promoCodes.filter((p) => {
      const status = getPromoStatusInfo(p);
      if (filterTab === "active") return status.key === "active";
      if (filterTab === "manual") return p.mode === "manual";
      if (filterTab === "timed") return p.mode === "timed";
      if (filterTab === "inactive") return status.key !== "active";
      return true;
    });
  }, [promoCodes, filterTab]);

  function openCreateModal() {
    setEditingPromo(null);
    setFormState(INITIAL_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(promo) {
    setEditingPromo(promo);
    setFormState({
      code: promo.code || "",
      discount_percent: promo.discount_percent || 10,
      description: promo.description || "",
      mode: promo.mode || "manual",
      expires_at: toLocalDateTimeInput(promo.expires_at),
      max_uses: promo.max_uses ?? "",
      is_active: promo.is_active !== false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  function applyQuickDuration(hours) {
    const target = new Date(Date.now() + hours * 3600 * 1000);
    setFormState((prev) => ({
      ...prev,
      mode: "timed",
      expires_at: toLocalDateTimeInput(target.toISOString()),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErrors({});

    const parsed = promoCodeSchema.safeParse({
      ...formState,
      expires_at: formState.mode === "timed" ? formState.expires_at : null,
    });

    if (!parsed.success) {
      const nextErrors = {};
      parsed.error.errors.forEach((issue) => {
        const key = issue.path[0] || "form";
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      });
      setFormErrors(nextErrors);
      return;
    }

    if (editingPromo) {
      await updatePromo({
        id: editingPromo.id,
        updates: parsed.data,
      });
    } else {
      await createPromo(parsed.data);
    }

    setIsModalOpen(false);
  }

  function handleToggleActive(promo) {
    updatePromo({
      id: promo.id,
      updates: { is_active: !promo.is_active },
    });
  }

  function handleDelete(promo) {
    if (window.confirm(`Delete promo code "${promo.code}" permanently?`)) {
      removePromo(promo.id);
    }
  }

  if (isLoading) return <Loader />;

  return (
    <PageWrapper>
      <HeaderBar>
        <div className="intro">
          <h2>Promo Codes &amp; Campaigns</h2>
          <p>Issue permanent toggleable discounts or scheduled time-based promo codes</p>
        </div>

        <PrimaryButton type="button" onClick={openCreateModal} disabled={schemaMissing}>
          <FaPlus /> Issue Promo Code
        </PrimaryButton>
      </HeaderBar>

      {schemaMissing && (
        <SchemaNotice>
          <FaExclamationTriangle />
          <div>
            <h4>Database Migration Needed for Promo Codes</h4>
            <p>
              Run <code>supabase/migrations/20261127000001_promo_codes_system.sql</code> in your Supabase SQL
              Editor to initialize the <code>promo_codes</code> table, order discount columns, and seed{" "}
              <code>RADIANT15</code>.
            </p>
          </div>
        </SchemaNotice>
      )}

      <StatsGrid>
        <StatCard $accent="#7c2d12">
          <div className="label">
            <span>Total Codes</span>
            <FaTag />
          </div>
          <div className="value">{promoCodes.length}</div>
          <div className="sub">Issued storewide</div>
        </StatCard>

        <StatCard $accent="#16a34a">
          <div className="label">
            <span>Active Now</span>
            <FaToggleOn />
          </div>
          <div className="value">{stats.activeNow}</div>
          <div className="sub">Redeemable at checkout</div>
        </StatCard>

        <StatCard $accent="#0284c7">
          <div className="label">
            <span>Time-Based</span>
            <FaClock />
          </div>
          <div className="value">{stats.timedCount}</div>
          <div className="sub">{stats.manualCount} manual (until turned off)</div>
        </StatCard>

        <StatCard $accent="#d97706">
          <div className="label">
            <span>Redemptions</span>
            <FaPercent />
          </div>
          <div className="value">{stats.totalRedemptions}</div>
          <div className="sub">Total orders discounted</div>
        </StatCard>
      </StatsGrid>

      <FilterBar>
        <Tabs>
          {[
            { id: "all", label: "All Promos" },
            { id: "active", label: "Active" },
            { id: "manual", label: "Until Turned Off" },
            { id: "timed", label: "Time-Based" },
            { id: "inactive", label: "Paused / Expired" },
          ].map((tab) => (
            <TabBtn
              key={tab.id}
              type="button"
              $active={filterTab === tab.id}
              onClick={() => setFilterTab(tab.id)}
            >
              {tab.label}
            </TabBtn>
          ))}
        </Tabs>
      </FilterBar>

      <TableCard>
        {filteredPromos.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-grey-500, #6b7280)" }}>
            No promo codes match this filter yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Duration Rule</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromos.map((promo) => {
                  const status = getPromoStatusInfo(promo);
                  return (
                    <tr key={promo.id}>
                      <td>
                        <CodeBadge>{promo.code}</CodeBadge>
                        {promo.description && (
                          <div style={{ fontSize: "0.78rem", color: "var(--color-grey-500, #6b7280)", marginTop: "4px" }}>
                            {promo.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{Number(promo.discount_percent)}% OFF</strong>
                      </td>
                      <td>
                        {promo.mode === "timed" ? (
                          <div>
                            <Pill $bg="#e0f2fe" $color="#0369a1">
                              <FaClock /> Timed
                            </Pill>
                            <div style={{ fontSize: "0.76rem", color: "var(--color-grey-500, #6b7280)", marginTop: "4px" }}>
                              Ends: {promo.expires_at ? new Date(promo.expires_at).toLocaleString() : "N/A"}
                            </div>
                          </div>
                        ) : (
                          <Pill $bg="#fef3c7" $color="#92400e">
                            <FaInfinity /> Until Turned Off
                          </Pill>
                        )}
                      </td>
                      <td>
                        <strong>{promo.usage_count || 0}</strong>
                        {promo.max_uses ? ` / ${promo.max_uses}` : " / ∞"}
                      </td>
                      <td>
                        <Pill $bg={status.bg} $color={status.color}>
                          {status.label}
                        </Pill>
                      </td>
                      <td>
                        <ActionGroup>
                          <IconActionBtn
                            type="button"
                            disabled={isUpdating}
                            $bg={promo.is_active ? "#fef2f2" : "#ecfdf5"}
                            $color={promo.is_active ? "#b91c1c" : "#15803d"}
                            $border={promo.is_active ? "#fecaca" : "#a7f3d0"}
                            onClick={() => handleToggleActive(promo)}
                          >
                            {promo.is_active ? <FaToggleOff /> : <FaToggleOn />}
                            {promo.is_active ? "Turn Off" : "Activate"}
                          </IconActionBtn>

                          <IconActionBtn type="button" onClick={() => openEditModal(promo)}>
                            <FaEdit /> Edit
                          </IconActionBtn>

                          <IconActionBtn
                            type="button"
                            disabled={isDeleting}
                            $bg="#fef2f2"
                            $color="#dc2626"
                            $border="#fecaca"
                            onClick={() => handleDelete(promo)}
                            aria-label={`Delete ${promo.code}`}
                          >
                            <FaTrashAlt />
                          </IconActionBtn>
                        </ActionGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </TableCard>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editingPromo ? `Edit Promo (${editingPromo.code})` : "Issue New Promo Code"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <FaTimes />
              </button>
            </div>

            <ModalForm onSubmit={handleSubmit}>
              <Field>
                <label htmlFor="promo-code">Promo Code</label>
                <input
                  id="promo-code"
                  type="text"
                  placeholder="e.g. RADIANT15 or WEEKEND20"
                  value={formState.code}
                  onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  required
                />
                {formErrors.code && <span className="field-error">{formErrors.code}</span>}
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field>
                  <label htmlFor="promo-discount">Discount (%)</label>
                  <input
                    id="promo-discount"
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={formState.discount_percent}
                    onChange={(e) => setFormState((prev) => ({ ...prev, discount_percent: e.target.value }))}
                    required
                  />
                  {formErrors.discount_percent && (
                    <span className="field-error">{formErrors.discount_percent}</span>
                  )}
                </Field>

                <Field>
                  <label htmlFor="promo-max-uses">Max Uses (Optional)</label>
                  <input
                    id="promo-max-uses"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formState.max_uses}
                    onChange={(e) => setFormState((prev) => ({ ...prev, max_uses: e.target.value }))}
                  />
                  {formErrors.max_uses && <span className="field-error">{formErrors.max_uses}</span>}
                </Field>
              </div>

              <Field>
                <label htmlFor="promo-description">Description</label>
                <input
                  id="promo-description"
                  type="text"
                  placeholder="e.g. Holiday flash sale or 15% storewide offer"
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                />
              </Field>

              <Field>
                <label>Duration Rule</label>
                <ModeSelector>
                  <ModeOption
                    type="button"
                    $selected={formState.mode === "manual"}
                    onClick={() => setFormState((prev) => ({ ...prev, mode: "manual", expires_at: "" }))}
                  >
                    <strong>
                      <FaInfinity /> Until Turned Off
                    </strong>
                    <span>Stays active until an admin manually turns it off.</span>
                  </ModeOption>

                  <ModeOption
                    type="button"
                    $selected={formState.mode === "timed"}
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        mode: "timed",
                        expires_at:
                          prev.expires_at ||
                          toLocalDateTimeInput(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()),
                      }))
                    }
                  >
                    <strong>
                      <FaClock /> Time-Based
                    </strong>
                    <span>Automatically stops working after the expiration date/time.</span>
                  </ModeOption>
                </ModeSelector>
              </Field>

              {formState.mode === "timed" && (
                <Field>
                  <label htmlFor="promo-expiry">Expires At</label>
                  <input
                    id="promo-expiry"
                    type="datetime-local"
                    value={formState.expires_at}
                    onChange={(e) => setFormState((prev) => ({ ...prev, expires_at: e.target.value }))}
                    required
                  />
                  <PresetRow>
                    <button type="button" onClick={() => applyQuickDuration(24)}>
                      +24 Hours
                    </button>
                    <button type="button" onClick={() => applyQuickDuration(72)}>
                      +3 Days
                    </button>
                    <button type="button" onClick={() => applyQuickDuration(24 * 7)}>
                      +7 Days
                    </button>
                    <button type="button" onClick={() => applyQuickDuration(24 * 30)}>
                      +30 Days
                    </button>
                  </PresetRow>
                  {formErrors.expires_at && <span className="field-error">{formErrors.expires_at}</span>}
                </Field>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <IconActionBtn type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </IconActionBtn>
                <PrimaryButton type="submit" disabled={isCreating || isUpdating}>
                  {editingPromo ? "Save Changes" : "Issue Promo Code"}
                </PrimaryButton>
              </div>
            </ModalForm>
          </ModalCard>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}
