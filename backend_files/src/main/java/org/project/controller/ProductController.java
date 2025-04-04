package org.project.controller;

import org.project.model.product_model.Comment;
import org.project.model.product_model.Product;
import org.project.model.product_model.Rating;
import org.project.model.product_model.ReviewObject;
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
    public Product getProductById(@PathVariable("product_id") String product_id) {
        return productService.find_product(product_id);
    }

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.list_all_products();
    }



    @GetMapping("/{product_id}/reviews")
    public List<ReviewObject> getProductReviews(@PathVariable("product_id") String product_id) {
        return productService.get_merged_reviews(product_id);
    }

    @GetMapping("/{product_id}/average_rating")
    public double getAverageRating(@PathVariable("product_id") String product_id) {
        return productService.calculate_average_rating(product_id);
    }

    @PostMapping("/add_only_comment")
    public Comment add_comment(@RequestBody Comment only_comment){
        return productService.add_only_comment(only_comment.getProductId(), only_comment.getUserId(), only_comment.getContent());   
    }

    @PostMapping("/add_only_rating")
    public Rating add_rating(@RequestBody Rating only_rating){
        return productService.add_only_rating(only_rating.getProductId(), only_rating.getUserId(), only_rating.getRating());
    } 

    @PostMapping("/add_both")
    public String add_comment_rating(@RequestBody ReviewObject review_object){
        return productService.add_comment_and_rating(
            review_object.getUserId(), 
            review_object.getProductId(), 
            review_object.getContent(), 
            review_object.getRating()
        );
    }



    @PostMapping("/add")
    public Product addProduct(@RequestBody Product newProduct) {
        return productService.addProduct(newProduct);
    }

    @PutMapping("/{product_id}/update")
    public Product updateProduct(@PathVariable("product_id") String product_id, @RequestBody Product updatedProduct) {
        return productService.updateProduct(product_id, updatedProduct);
    }

    @DeleteMapping("/{product_id}/delete")
    public String deleteProduct(@PathVariable("product_id") String product_id) {
        return productService.deleteProduct(product_id);
    }

}
