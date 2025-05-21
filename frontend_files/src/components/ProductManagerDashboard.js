import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./ProductManagerDashboard.css";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [stockInputs, setStockInputs] = useState({});
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    unitPrice: 0,
    stock: 0,
    product_id: "",
    model: "",
    serialNumber: "",
    category: "",
    warrantyStatus: "",
    distributorID: "",
  });

  useEffect(() => {
    fetch("http://localhost:8080/products/all")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          console.error("API'den beklenen formatta veri gelmedi:", data);
          setProducts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProducts([]);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddProduct = () => {
    fetch("http://localhost:8080/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts([...products, data]);
        setNewProduct({ name: "", description: "", unitPrice: 0, stock: 0, product_id: "", model: "", serialNumber: "", category: "", warrantyStatus: "", distributorID: "" });
      })
      .catch((error) => console.error("Error adding product:", error));
  };

  const handleDeleteProduct = (id) => {
    fetch(`http://localhost:8080/products/${id}/delete`, { method: "DELETE" })
      .then(() => setProducts(products.filter((product) => product.product_id !== id)))
      .catch((error) => console.error("Error deleting product:", error));
  };

  const handleUpdateStock = (product) => {
    const newStock = stockInputs[product.product_id];
    if (!newStock || isNaN(newStock)) {
      alert("Please enter a valid stock number.");
      return;
    }

    fetch(`http://localhost:8080/product-managers/update-product?quantity=${newStock}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then(res => res.json())
      .then(updated => {
        setProducts(prev =>
          prev.map(p =>
            p.product_id === updated.product_id ? updated : p
          )
        );
        alert(`Stock updated for ${product.name}`);
        setStockInputs(prev => ({ ...prev, [product.product_id]: "" }));
      })
      .catch(err => {
        console.error("Stock update error:", err);
        alert("Failed to update stock.");
      });
  };

  return (
    <div className="product-manager">
      <h1>Product Manager</h1>
      <button onClick={() => navigate("/product-managers/orders")}>Orders</button>
      <button onClick={() => navigate("/product-managers/comments")}>Comments</button>

      <div className="add-category">
        <h2>Add Category</h2>
        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={() => setCategories(prev => [...prev, newCategory])}>Add Category</button>
      </div>

      <div className="add-product">
        <h2>Add New Product</h2>
        <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleInputChange} />
        <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} />
        <input type="number" name="stock" placeholder="Stock" value={newProduct.stock} onChange={handleInputChange} />
        <input type="text" name="product_id" placeholder="Product ID" value={newProduct.product_id} onChange={handleInputChange} />
        <input type="text" name="model" placeholder="Model" value={newProduct.model} onChange={handleInputChange} />
        <input type="text" name="serialNumber" placeholder="Serial Number" value={newProduct.serialNumber} onChange={handleInputChange} />
        <select name="category" value={newProduct.category} onChange={handleInputChange}>
          <option value="">Select Category</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
        <input type="text" name="warrantyStatus" placeholder="Warranty Status" value={newProduct.warrantyStatus} onChange={handleInputChange} />
        <input type="text" name="distributorID" placeholder="Distributor ID" value={newProduct.distributorID} onChange={handleInputChange} />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>

      <div className="product-list">
        <h2>Product List by Category</h2>
        {categories.map((category, i) => (
          <div key={i} className="category-section">
            <h3>{category}</h3>
            <ul>
              {products.filter(p => p.category === category).map((product) => (
                <li key={product.product_id}>
                  <strong>{product.name}</strong> - ${product.unitPrice} - Stock: {product.stock}
                  <input
                    type="number"
                    placeholder="New Stock"
                    value={stockInputs[product.product_id] || ""}
                    onChange={(e) => setStockInputs(prev => ({ ...prev, [product.product_id]: e.target.value }))}
                  />
                  <button onClick={() => handleUpdateStock(product)}>Update Stock</button>
                  <button onClick={() => handleDeleteProduct(product.product_id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;
