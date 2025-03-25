package org.project.repository;

import org.project.model.product_model.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface RatingRepository extends MongoRepository<Rating, String>{
    List<Rating> findByUserIdAndProductId(String user_id, String product_id);
    List<Rating> findByProductId(String product_id);
}
