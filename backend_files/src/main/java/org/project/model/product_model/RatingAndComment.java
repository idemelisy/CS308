package org.project.model.product_model;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class RatingAndComment {

    private String user_id;
    private int rating;
    private String comment;
    
}
