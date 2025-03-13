package org.project.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@TypeAlias("customer")
@NoArgsConstructor
@Getter
@Setter

public class Customer extends User{

    public Customer(String account_id, String name, String surname, String email, String password){
        super(account_id, name, surname, email, password);
    }

}
