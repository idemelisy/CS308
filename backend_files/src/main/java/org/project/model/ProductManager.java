package org.project.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@TypeAlias("product_manager")
@NoArgsConstructor
@Getter
@Setter

public class ProductManager extends User{

    private String department;

    public ProductManager(String account_id, String name, String surname, String email, String password, String department){
        super(account_id, name, surname, email, password);
        this.department = department;
    }
}
