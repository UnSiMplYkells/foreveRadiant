import { useState, useEffect } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "../../Validation/schemas";
import { useCreateProduct } from "../../Hooks/useCreateProduct";
import { useUpdateProduct } from "../../Hooks/useUpdateProduct";
import { useUploadProductImage } from "../../Hooks/useUploadProductImage";
import MiniLoader from "../../ui/MiniLoader";
import toast from "react-hot-toast";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e5e5e5;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
    font-weight: 600;
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #777;
  cursor: pointer;
  &:hover {
    color: #000;
  }
`;

const Form = styled.form`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.88rem;
    font-weight: 600;
    color: #444;
  }

  input,
  select,
  textarea {
    padding: 10px 12px;
    border: 1px solid ${(props) => (props.$hasError ? "#e53e3e" : "#d1d5db")};
    border-radius: 6px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: ${(props) => (props.$hasError ? "#e53e3e" : "#7c2d12")};
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
`;

const ErrorText = styled.span`
  color: #e53e3e;
  font-size: 0.8rem;
  font-weight: 500;
`;

const VariantsContainer = styled.div`
  background: #fdfaf7;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VariantsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const AddVariantBtn = styled.button`
  background: #fef3c7;
  color: #78350f;
  border: 1px solid #fde68a;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fde68a;
  }
`;

const PresetRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: #4b5563;

  button {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 0.78rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: #7c2d12;
      color: white;
      border-color: #7c2d12;
    }
  }
`;

const VariantRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    outline: none;

    &:focus {
      border-color: #7c2d12;
    }
  }

  .remove-btn {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    flex-shrink: 0;

    &:hover:not(:disabled) {
      background: #fca5a5;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const PreviewThumb = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    cursor: pointer;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 24px;
  background: #7c2d12;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #5c200c;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function ProductFormModal({ isOpen, onClose, productToEdit }) {
  const isEditing = Boolean(productToEdit);
  const { addProduct, isCreating } = useCreateProduct();
  const { editProduct, isUpdating } = useUpdateProduct();
  const { uploadImage, isUploading } = useUploadProductImage();

  const [images, setImages] = useState([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [sizeVariants, setSizeVariants] = useState([
    { size: "50ml", price: 5000 },
    { size: "100ml", price: 7500 },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "skincare",
      price: "",
      available: "",
      discount: 0,
      description: "",
      image_url: [],
    },
  });

  useEffect(() => {
    if (productToEdit) {
      reset({
        name: productToEdit.name || "",
        category: productToEdit.category || "skincare",
        price: productToEdit.price || "",
        available: productToEdit.available ?? "",
        discount: productToEdit.discount ?? 0,
        description: productToEdit.description || "",
        image_url: Array.isArray(productToEdit.image_url)
          ? productToEdit.image_url
          : productToEdit.image_url
          ? [productToEdit.image_url]
          : [],
      });
      setImages(
        Array.isArray(productToEdit.image_url)
          ? productToEdit.image_url
          : productToEdit.image_url
          ? [productToEdit.image_url]
          : []
      );

      // Parse and normalize size variants
      let loadedSizes = [];
      if (Array.isArray(productToEdit.size)) {
        loadedSizes = productToEdit.size.map((v) => {
          if (typeof v === "object" && v !== null && v.size) {
            return {
              size: String(v.size),
              price: Number(v.price) || Number(productToEdit.price) || 5000,
            };
          }
          const label = String(v).includes("ml") || String(v).includes("g") ? String(v) : `${v}ml`;
          return { size: label, price: Number(productToEdit.price) || 5000 };
        });
      } else if (typeof productToEdit.size === "string") {
        try {
          const parsed = JSON.parse(productToEdit.size);
          if (Array.isArray(parsed)) {
            loadedSizes = parsed.map((v) =>
              typeof v === "object" && v !== null && v.size
                ? { size: String(v.size), price: Number(v.price) || Number(productToEdit.price) || 5000 }
                : { size: String(v), price: Number(productToEdit.price) || 5000 }
            );
          }
        } catch {
          loadedSizes = [{ size: productToEdit.size, price: Number(productToEdit.price) || 5000 }];
        }
      }

      if (loadedSizes.length === 0) {
        const base = Number(productToEdit?.price) || 5000;
        loadedSizes = [
          { size: "50ml", price: base },
          { size: "100ml", price: Math.round(base * 1.5) },
        ];
      }
      setSizeVariants(loadedSizes);
    } else {
      reset({
        name: "",
        category: "skincare",
        price: "",
        available: "",
        discount: 0,
        description: "",
        image_url: [],
      });
      setImages([]);
      setSizeVariants([
        { size: "50ml", price: 5000 },
        { size: "100ml", price: 7500 },
      ]);
    }
  }, [productToEdit, reset, isOpen]);

  if (!isOpen) return null;

  function handleAddSizeVariant(sizeLabel = "", priceVal = "") {
    setSizeVariants((prev) => [...prev, { size: sizeLabel, price: priceVal }]);
  }

  function handleRemoveSizeVariant(index) {
    setSizeVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUpdateSizeVariant(index, field, value) {
    setSizeVariants((prev) => {
      const updated = prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      // Auto-sync first variant price to base price if updating price of index 0
      if (index === 0 && field === "price" && Number(value) > 0) {
        setValue("price", Number(value), { shouldValidate: true });
      }
      return updated;
    });
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadImage(file);
      const updated = [...images, publicUrl];
      setImages(updated);
      setValue("image_url", updated, { shouldValidate: true });
      toast.success("Image uploaded to Supabase Storage");
    } catch {
      // Error is handled in hook
    }
  }

  function handleAddUrl() {
    if (!customImageUrl.trim()) return;
    try {
      new URL(customImageUrl);
      const updated = [...images, customImageUrl.trim()];
      setImages(updated);
      setValue("image_url", updated, { shouldValidate: true });
      setCustomImageUrl("");
    } catch {
      toast.error("Please enter a valid URL");
    }
  }

  function handleRemoveImage(index) {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    setValue("image_url", updated, { shouldValidate: true });
  }

  function onSubmit(formData) {
    if (images.length === 0) {
      return toast.error("Please upload or provide at least one product image");
    }

    const cleanSizes = sizeVariants
      .filter((v) => v.size && String(v.size).trim() !== "")
      .map((v) => ({
        size: String(v.size).trim(),
        price: Number(v.price) > 0 ? Number(v.price) : Number(formData.price) || 5000,
      }));

    if (cleanSizes.length === 0) {
      return toast.error("Please configure at least one size variant with a valid price");
    }

    const payload = {
      ...formData,
      size: cleanSizes,
      price: cleanSizes[0]?.price || Number(formData.price) || 5000,
      image_url: images,
    };

    if (isEditing) {
      editProduct(
        { productId: productToEdit.id, productData: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      addProduct(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  }

  const isSubmitting = isCreating || isUpdating || isUploading;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{isEditing ? `Edit Product: ${productToEdit.name}` : "Create New Product"}</h3>
          <CloseBtn onClick={onClose}>&times;</CloseBtn>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup $hasError={Boolean(errors.name)}>
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Radiant Glow Vitamin C Serum"
              {...register("name")}
            />
            {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
          </FormGroup>

          <FormRow>
            <FormGroup $hasError={Boolean(errors.category)}>
              <label htmlFor="category">Category *</label>
              <select id="category" {...register("category")}>
                <option value="skincare">Skincare</option>
                <option value="haircare">Haircare</option>
                <option value="wellness">Wellness</option>
                <option value="bodycare">Bodycare</option>
              </select>
              {errors.category && <ErrorText>{errors.category.message}</ErrorText>}
            </FormGroup>

            <FormGroup $hasError={Boolean(errors.price)}>
              <label htmlFor="price">Price (₦) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                placeholder="e.g. 15000"
                {...register("price")}
              />
              {errors.price && <ErrorText>{errors.price.message}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup $hasError={Boolean(errors.available)}>
              <label htmlFor="available">Inventory Stock (Units) *</label>
              <input
                id="available"
                type="number"
                placeholder="e.g. 50"
                {...register("available")}
              />
              {errors.available && <ErrorText>{errors.available.message}</ErrorText>}
            </FormGroup>

            <FormGroup $hasError={Boolean(errors.discount)}>
              <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                {...register("discount")}
              />
              {errors.discount && <ErrorText>{errors.discount.message}</ErrorText>}
            </FormGroup>
          </FormRow>

          {/* SIZE & PRICING VARIANTS MANAGER */}
          <VariantsContainer>
            <VariantsHeader>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#374151" }}>Size & Volume Variants</h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                  Configure each available size/volume (e.g. 50ml, 100ml, 250g) and its unique price
                </p>
              </div>
              <AddVariantBtn type="button" onClick={() => handleAddSizeVariant("", "")}>
                + Add Variant
              </AddVariantBtn>
            </VariantsHeader>

            <PresetRow>
              <span>Quick Add:</span>
              {["50ml", "100ml", "250ml", "500ml", "100g", "250g", "500g"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    if (!sizeVariants.some((v) => v.size.toLowerCase() === preset.toLowerCase())) {
                      const basePrice = Number(watch("price")) || 5000;
                      let factor = 1;
                      if (preset === "100ml" || preset === "250g") factor = 1.45;
                      if (preset === "250ml" || preset === "500g") factor = 2.4;
                      if (preset === "500ml") factor = 3.8;
                      handleAddSizeVariant(preset, Math.round(basePrice * factor));
                    }
                  }}
                >
                  + {preset}
                </button>
              ))}
            </PresetRow>

            {sizeVariants.map((item, idx) => (
              <VariantRow key={idx}>
                <div style={{ flex: "1 1 45%" }}>
                  <input
                    type="text"
                    placeholder="Size label (e.g. 50ml, 100g)"
                    value={item.size}
                    onChange={(e) => handleUpdateSizeVariant(idx, "size", e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: "1 1 45%", position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "8px",
                      color: "#9ca3af",
                      fontSize: "0.9rem",
                    }}
                  >
                    ₦
                  </span>
                  <input
                    type="number"
                    step="1"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleUpdateSizeVariant(idx, "price", e.target.value)}
                    style={{ paddingLeft: "26px" }}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveSizeVariant(idx)}
                  title="Remove variant"
                  disabled={sizeVariants.length === 1}
                >
                  &times;
                </button>
              </VariantRow>
            ))}
          </VariantsContainer>

          <FormGroup $hasError={Boolean(errors.description)}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              placeholder="Enter comprehensive product description, ingredients, and usage guidelines..."
              {...register("description")}
            />
            {errors.description && <ErrorText>{errors.description.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <label>Product Images (Supabase Storage Bucket: `products`)</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading && <MiniLoader />}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input
                type="url"
                placeholder="Or paste external image URL..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddUrl}
                style={{
                  padding: "6px 14px",
                  background: "#eee",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Add URL
              </button>
            </div>

            {images.length > 0 && (
              <ImagePreviewContainer>
                {images.map((img, idx) => (
                  <PreviewThumb key={idx}>
                    <img src={img} alt={`Preview ${idx + 1}`} />
                    <button type="button" onClick={() => handleRemoveImage(idx)}>
                      &times;
                    </button>
                  </PreviewThumb>
                ))}
              </ImagePreviewContainer>
            )}
          </FormGroup>

          <ButtonRow>
            <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <MiniLoader /> {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </SubmitButton>
          </ButtonRow>
        </Form>
      </ModalContent>
    </Overlay>
  );
}
