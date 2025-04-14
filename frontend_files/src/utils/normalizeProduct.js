export const normalizeProduct = (product) => {
    return {
      product_id: product.product_id || product.id || null,
      name: product.name ?? "",
      description: product.description ?? "",
      unit_price: product.unit_price ?? product.price ?? 0,
      stock: product.stock ?? 0,
      category: product.category ?? "general",
    };
  };
  