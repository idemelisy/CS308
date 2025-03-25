package org.project.model.product_model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "ratings")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Rating {

    @Id
    private String rating_id;
    private String productId;
    private String userId;
    private int rating;
    private LocalDateTime date;
    
}
