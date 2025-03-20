package org.project.repository;

import org.project.model.product_model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface ProductRepository extends MongoRepository<Product, String>{
    Product findByProductName(String product_name);
    List<Product> findAll();
}
