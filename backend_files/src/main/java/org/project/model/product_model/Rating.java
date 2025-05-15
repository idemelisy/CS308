package org.project.model.product_model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;

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
    private String userEmail;
    private int rating;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant date;
    
}
