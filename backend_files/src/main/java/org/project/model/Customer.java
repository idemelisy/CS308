package org.project.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.HashMap;
import java.util.HashSet;

@Document(collection = "users")
@TypeAlias("customer")
@NoArgsConstructor
@Getter
@Setter

public class Customer extends User{

    @Field("customer_cart")
    private HashMap<String, Integer> shopping_cart;
    private HashSet<String> wishlist;

    public Customer(String account_id, String name, String surname, String email, String password){
        super(account_id, name, surname, email, password);
        this.shopping_cart = new HashMap<String, Integer>();
        this.wishlist = new HashSet<String>();
    }

}
