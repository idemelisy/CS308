package org.project.repository;

import org.project.model.product_model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;


public interface ProductRepository extends MongoRepository<Product, String>{
    Product findByName(String product_name);
    List<Product> findByCategory(String category);

    @Query(value = "{}", sort = "{ 'unitPrice': 1 }")
    List<Product> findAllByUnitPriceAsc();

    @Query(value = "{}", sort = "{ 'unitPrice': -1 }")
    List<Product> findAllByUnitPriceDesc();

    @Query(value = "{ $text: { $search: ?0 } }", fields = "{ score: { $meta: 'textScore' } }", sort = "{ score: { $meta: 'textScore' } }")
    List<Product> fullTextSearch(String searchText);
}
