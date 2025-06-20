# 🛍️ CS308 E-Commerce Web Application

This repository contains a full-stack e-commerce web application developed as part of the **CS308 Software Engineering** course at **Sabancı University**.

## 📌 Project Overview

The application allows customers to browse products, manage their cart, place orders, and download invoices. It also includes role-based dashboards for product managers and sales managers, with features like product stock management and revenue analytics.

## 🔧 Technologies Used

- **Frontend**: React.js, JavaScript, CSS
- **Backend**: Java (Spring Boot), Gradle
- **Database**: MongoDB
- **Authentication**: Firebase Authentication (JWT)
- **DevOps**: Docker (mandatory), Kubernetes (optional)

## 👥 User Roles

- **Customer**
  - Browse and search products
  - Add/remove from cart
  - Checkout and view order history
  - Download invoice PDFs

- **Product Manager**
  - Add, edit, delete products
  - Update stock quantities

- **Sales Manager**
  - View revenue charts
  - Access and download invoices

## 🚀 How to Run the Project

### 1. Backend

```bash
cd backend_files
./gradlew bootRun
