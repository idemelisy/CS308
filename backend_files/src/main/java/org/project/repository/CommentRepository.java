package org.project.repository;

import org.project.model.product_model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String>{
    List<Comment> findByUserIdAndProductId(String user_id, String product_id);
    List<Comment> findByProductId(String product_id);
}
