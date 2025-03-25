package org.project.model.product_model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class ReviewObject {
    
    private String rating_id;
    private String comment_id;
    private String productId;
    private String userId;
    private int rating;
    private String content;
    private LocalDateTime date;
    
}
