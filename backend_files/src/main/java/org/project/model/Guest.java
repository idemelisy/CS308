package org.project.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.HashMap;

@Document(collection = "users")
@TypeAlias("guest")
@NoArgsConstructor
@Getter
@Setter

public class Guest extends Customer{

    @Field("guest_cart")
    private HashMap<String, Integer> shopping_cart;

    public Guest(String account_id){
        super(account_id, null, null, "guest.mail", null);
        this.shopping_cart = null;
        this.setWishlist(null);
    }

}
