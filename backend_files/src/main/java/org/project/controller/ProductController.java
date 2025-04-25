package org.project.controller;

import org.project.model.product_model.Product;
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

    @GetMapping("/search")
    public List<Product> search(@RequestParam String keyword){
        return productService.search_engine(keyword);
    }

    @GetMapping("/category")
    public List<Product> category_search(@RequestParam String category){
        return productService.list_by_category(category);
    }

    @GetMapping("/ascending")
    public List<Product> ascending_price(){
        return productService.sort_asc();
    }

    @GetMapping("/descending")
    public List<Product> descending_price(){
        return productService.sort_desc();
    }

    @GetMapping("/popular")
    public List<Product> sort_popularity(){
        return productService.sort_popular();
    }



    @GetMapping("/reviews")
    public List<ReviewObject> getProductReviews(@RequestParam String product_id) {
        return productService.get_merged_reviews(product_id);
    }

    @GetMapping("/{product_id}/average_rating")
    public double getAverageRating(@RequestParam String product_id) {
        return productService.calculate_average_rating(product_id);
    }

    @PostMapping("/add-comment-rating")
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

    @DeleteMapping("/{product_id}/delete")
    public String deleteProduct(@PathVariable("product_id") String product_id) {
        return productService.deleteProduct(product_id);
    }

}

