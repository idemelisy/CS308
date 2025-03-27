package org.project.service;

import org.project.model.product_model.Rating;
import org.project.repository.RatingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    public Rating saveRating(Rating rating) {
        return ratingRepository.save(rating);
    }

    public List<Rating> getRatingsByProductId(String productId) {
        return ratingRepository.findByProductId(productId);
    }

    // Optional: add delete, update, or getByUserId methods later
}
