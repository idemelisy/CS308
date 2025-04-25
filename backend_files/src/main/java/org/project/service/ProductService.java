package org.project.service;

import org.project.model.Invoice;
import org.project.model.product_model.*;
import org.project.repository.ProductRepository;
import org.project.repository.CommentRepository;
import org.project.repository.RatingRepository;
import org.project.repository.ShoppingHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;

@Service
public class ProductService {

    @Autowired
    private ProductRepository product_repo;
    @Autowired
    private CommentRepository comment_repo;
    @Autowired
    private RatingRepository rating_repo;
    @Autowired
    private ShoppingHistory receipts;
    

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
        return product_repo.fullTextSearch(keywords);
    }

    public List<Product> sort_asc(){
        return product_repo.findAllByUnitPriceAsc();
    }

    public List<Product> sort_desc(){
        return product_repo.findAllByUnitPriceDesc();
    }

    public List<Product> sort_popular(){
        List<Invoice> all = receipts.findAll();
        HashMap<String, Integer> total_purchased = new HashMap<String, Integer>();

        for(Invoice i : all){
            Map<String, Integer> purchased = i.getPurchased();
            for(Map.Entry<String, Integer> entry : purchased.entrySet()){
                String productID = entry.getKey();
                Integer quantity = entry.getValue();
                total_purchased.merge(productID, quantity, Integer::sum);
            }
        }
        List<Product> products = product_repo.findAll();
        return products.stream()
                .sorted((p1, p2) -> {
                    Integer count1 = total_purchased.getOrDefault(p1.getProduct_id(), 0);
                    Integer count2 = total_purchased.getOrDefault(p2.getProduct_id(), 0);
                    return count2.compareTo(count1); 
                })
                .collect(Collectors.toList());
    }
    
    public String add_comment_and_rating(String user_id, String product_id, String comment, int rating){
        List<Invoice> all = receipts.findAll();
        
        String mutual_id = generate_id();
        Instant now = Instant.now();

        Rating new_rating = new Rating(mutual_id, product_id, user_id, rating, now);
        Comment new_comment = new Comment(mutual_id, product_id, user_id, comment, "waiting-approval", now);

        rating_repo.save(new_rating);
        comment_repo.save(new_comment);

        return mutual_id + " " + product_id + " " + user_id;
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
            if(comment.getApprovalStatus().equals("approved")){
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
                    newReview.setContent(comment.getContent());
                    
                    merged_reviews.add(newReview);
                }
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

    public String deleteProduct(String product_id) {
        product_repo.deleteById(product_id);
        return "Product deleted successfully!";
    }

}
