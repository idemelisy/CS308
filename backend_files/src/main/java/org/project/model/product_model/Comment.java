package org.project.model.product_model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "comments")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Comment {

    @Id
    private String comment_id;
    private String productId;
    private String userId;
    private String content;
    private LocalDateTime date;
    
}
