package org.project.service;

import org.project.model.product_model.*;
import org.project.repository.ProductRepository;
import org.project.repository.CommentRepository;
import org.project.repository.RatingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class ProductService {

    @Autowired
    private ProductRepository product_repo;
    @Autowired
    private CommentRepository comment_repo;
    @Autowired
    private RatingRepository rating_repo;

    private String generate_id() {
        return UUID.randomUUID().toString();
    }

    public Product find_product(String product_id){
        return product_repo.findById(product_id).get();   
    }

    public List<Product> list_all_products(){
        return product_repo.findAll();
    }

    public List<Product> list_by_category(String category){
        return product_repo.findByCategory(category);
    }

    public List<Product> search_engine(String keywords){
        return product_repo.findByNameContainingOrDecriptionContainingAllIgnoreCase(keywords, keywords);
    }

    public String add_comment_and_rating(String user_id, String product_id, String comment, int rating){
        String mutual_id = generate_id();
        LocalDateTime now = LocalDateTime.now();

        Rating new_rating = new Rating(mutual_id, product_id, user_id, rating, now);
        Comment new_comment = new Comment(mutual_id, product_id, user_id, comment, now);

        rating_repo.save(new_rating);
        comment_repo.save(new_comment);

        return mutual_id + " " + product_id + " " + user_id;
    }

    public Comment add_only_comment(String product_id, String user_id, String content){
        String comment_id = generate_id();
        LocalDateTime now = LocalDateTime.now();

        return comment_repo.save(new Comment(comment_id, product_id, user_id, content, now));
    }

    public Rating add_only_rating(String product_id, String user_id, int rating){
        String rating_id = generate_id();
        LocalDateTime now = LocalDateTime.now();

        return rating_repo.save(new Rating(rating_id, product_id, user_id, rating, now));
    }

    public List<ReviewObject> get_merged_reviews(String product_id){
        List<Rating> ratings = list_product_ratings(product_id);
        List<Comment> comments = list_product_comments(product_id);

        List<ReviewObject> merged_reviews = new ArrayList<>();

        for(Rating rating: ratings){
            ReviewObject new_review = new ReviewObject();
            new_review.setRating_id(rating.getRating_id());
            new_review.setProductId(rating.getProductId());
            new_review.setUserId(rating.getUserId());
            new_review.setRating(rating.getRating());
            new_review.setDate(rating.getDate());
            merged_reviews.add(new_review);
        }

        for (Comment comment: comments){
            boolean matched = false;
            
            for(ReviewObject review: merged_reviews){
                if(review.getUserId().equals(comment.getUserId()) && 
                   review.getProductId().equals(comment.getProductId()) &&
                   review.getDate().equals(comment.getDate())) {

                    review.setComment_id(comment.getComment_id());
                    review.setContent(comment.getContent());
                    matched = true;
                    break;
                }
            }

            if(!matched){
                ReviewObject newReview = new ReviewObject();
                newReview.setComment_id(comment.getComment_id());
                newReview.setProductId(comment.getProductId());
                newReview.setUserId(comment.getUserId());
                newReview.setDate(comment.getDate());
                
                merged_reviews.add(newReview);
            }
        }

        return merged_reviews;
    }

    public List<Comment> list_product_comments(String product_id){
        return comment_repo.findByProductId(product_id);
    }

    public List<Rating> list_product_ratings(String product_id){
        return rating_repo.findByProductId(product_id);
    }

    public double calculate_average_rating(String product_id){
        List<Rating> ratings = list_product_ratings(product_id);
        int total = 0;
        if (ratings == null || ratings.isEmpty()) {
            return 0.0;
        }
        for (Rating iterator: ratings){
            total += iterator.getRating();     
        }

        return (double) total / ratings.size();
    }


    public Product addProduct(Product newProduct) {
        return product_repo.save(newProduct);
    }

    public Product updateProduct(String product_id, Product updatedProduct) {
        Product existingProduct = product_repo.findById(product_id).orElse(null);
        if (existingProduct != null) {
            existingProduct.setProductName(updatedProduct.getProductName());
            existingProduct.setDescription(updatedProduct.getDescription());
            existingProduct.setUnit_price(updatedProduct.getUnit_price());
            existingProduct.setStock(updatedProduct.getStock());
            return product_repo.save(existingProduct);
        }
        return null;
    }

    public String deleteProduct(String product_id) {
        product_repo.deleteById(product_id);
        return "Product deleted successfully!";
    }

}
