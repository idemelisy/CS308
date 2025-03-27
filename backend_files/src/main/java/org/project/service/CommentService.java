package org.project.service;

import org.project.model.product_model.Comment;
import org.project.repository.CommentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public Comment saveComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByProductId(String productId) {
        return commentRepository.findByProductId(productId);
    }

    // Optional: add delete, update, or getByUserId methods later
}
