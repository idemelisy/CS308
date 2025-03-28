package org.project.controller;

import org.project.model.product_model.Rating;
import org.project.service.RatingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping("/add")
    public Rating addRating(@RequestBody Rating rating) {
        return ratingService.saveRating(rating);
    }

    @GetMapping("/product/{productId}")
    public List<Rating> getRatingsByProductId(@PathVariable String productId) {
        return ratingService.getRatingsByProductId(productId);
    }

    @DeleteMapping("/{ratingId}")
    public void deleteRating(@PathVariable String ratingId) {
        ratingService.deleteRatingById(ratingId);
    }
}
