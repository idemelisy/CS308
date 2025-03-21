package org.project.controller;

import org.project.model.product_model.Product;
import org.project.model.product_model.RatingAndComment;
import org.project.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/{product_id}")
    public Product getProductById(@PathVariable String product_id) {
        return productService.find_product(product_id);
    }

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.list_all_products();
    }

    @GetMapping("/{product_id}/reviews")
    public List<RatingAndComment> getProductReviews(@PathVariable String product_id) {
        return productService.past_user_experience(product_id);
    }

    @GetMapping("/{product_id}/average-rating")
    public double getAverageRating(@PathVariable String product_id) {
        return productService.calculate_average_rating(product_id);
    }
/*
    @PostMapping("/add")
    public Product addProduct(@RequestBody Product newProduct) {
        return productService.addProduct(newProduct);
    }

    @PutMapping("/{product_id}/update")
    public Product updateProduct(@PathVariable String product_id, @RequestBody Product updatedProduct) {
        return productService.updateProduct(product_id, updatedProduct);
    }

    @DeleteMapping("/{product_id}/delete")
    public String deleteProduct(@PathVariable String product_id) {
        return productService.deleteProduct(product_id);
    }
*/
}
