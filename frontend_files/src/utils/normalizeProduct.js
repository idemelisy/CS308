export const normalizeProduct = (product) => {
  console.log("Input product:", product); // Debug
  
  const productId = product?.id || product?.product_id;
  if (!product || !productId) {
    console.error("Invalid product object:", product);
    throw new Error("Product must have an ID (either 'id' or 'product_id')");
  }

  // Ensure all required fields are present and properly formatted
  return {
    product_id: productId.toString(), // Ensure ID is a string
    name: product.name || "",
    unit_price: Number(product.unitPrice) || 0, // Ensure price is a number
    quantity: 1
  };
};