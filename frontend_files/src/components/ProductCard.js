import React, { useContext } from "react";
import "./ProductCard.css";
import { CartContext } from "../CartContext";
import { normalizeProduct } from "../utils/normalizeProduct";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <p className="product-price">
  ${Number.isFinite(product?.unitPrice) ? product.unitPrice.toFixed(2) : "0.00"}
</p>


      <p className="product-stock">
        {product.quantity > 0 ? `Stock: ${product.quantity}` : "Out of Stock"}
      </p>
      <button
        className="add-to-cart"
        disabled={product.quantity === 0}
        onClick={() => addToCart(normalizeProduct(product))}
      >
        {product.quantity > 0 ? "Add to Cart" : "Sold Out"}
      </button>
    </div>
  );
};

export default ProductCard;
