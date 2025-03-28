package org.project.controller;

import org.project.model.product_model.Comment;
import org.project.service.CommentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/add")
    public Comment addComment(@RequestBody Comment comment) {
        return commentService.saveComment(comment);
    }

    @GetMapping("/product/{productId}")
    public List<Comment> getCommentsByProductId(@PathVariable String productId) {
        return commentService.getCommentsByProductId(productId);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable String commentId) {
        commentService.deleteCommentById(commentId);
    }
}
