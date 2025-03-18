package org.project.service;

import org.project.model.product_model.*;
import org.project.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List; 

            // genel olarak input almaktansa ekranda görünen ürünler üzerinden gideriz diye 
            // exception kontrolü yapmadım
@Service
public class ProductService {

    @Autowired
    private ProductRepository product_repo;

    public List<Product> list_all_products(){
        return product_repo.findAll();
    }

    public List<RatingAndComment> past_user_experience(String product_id){
        return product_repo.findById(product_id).get().getRatings_and_comments();
    }

    public double calculate_average_rating(String product_id){

        List<RatingAndComment> ratings_and_comments = past_user_experience(product_id);
        int total = 0;
        if (ratings_and_comments == null || ratings_and_comments.isEmpty()) {
            return 0.0;
        }
        for (RatingAndComment iterator: ratings_and_comments){
            total += iterator.getRating();     // comment bırakılırsa rating zorunludur mantığıyla null kontrolü yapmadım
        }

        return (double) total / ratings_and_comments.size();
    }
}
