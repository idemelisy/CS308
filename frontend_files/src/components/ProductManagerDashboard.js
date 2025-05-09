import React, { useEffect, useState } from 'react';

import "./ProductManagerDashboard.css";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    unitPrice: 0,
    stock: 0,
  });

  useEffect(() => {
    fetch("http://localhost:8080/products")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data); // Eğer veri bir dizi ise güncelle
        } else {
          console.error("API'den beklenen formatta veri gelmedi:", data);
          setProducts([]); // Hata durumunda boş bir dizi ata
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProducts([]); // Hata durumunda boş bir dizi ata
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddProduct = () => {
    // Yeni ürün ekleme
    fetch("http://localhost:8080/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts([...products, data]);
        setNewProduct({ name: "", description: "", unitPrice: 0, stock: 0 });
      })
      .catch((error) => console.error("Error adding product:", error));
  };

  const handleDeleteProduct = (id) => {
    // Ürün silme
    fetch(`http://localhost:8080/products/${id}`, { method: "DELETE" })
      .then(() => setProducts(products.filter((product) => product.id !== id)))
      .catch((error) => console.error("Error deleting product:", error));
  };

  return (
    <div className="product-manager">
      <h1>Product Manager</h1>

      <div className="add-product">
        <h2>Add New Product</h2>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="unitPrice"
          placeholder="Unit Price"
          value={newProduct.unitPrice}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={handleInputChange}
        />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>

      <div className="product-list">
        <h2>Product List</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> - ${product.unitPrice} - Stock: {product.stock}
              <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductManager;