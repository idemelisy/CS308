package org.project.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;
import org.project.model.product_model.Product;

import java.util.HashMap;

@Document(collection = "users")
@TypeAlias("customer")
@NoArgsConstructor
@Getter
@Setter

public class Customer extends User{

    private HashMap<String, Integer> shopping_cart;

    public Customer(String account_id, String name, String surname, String email, String password){
        super(account_id, name, surname, email, password);
        this.shopping_cart = null;
    }

}
