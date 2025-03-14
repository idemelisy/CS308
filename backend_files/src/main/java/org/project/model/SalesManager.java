package org.project.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@TypeAlias("sales_manager")
@NoArgsConstructor
@Getter
@Setter

public class SalesManager extends User{

    private String company_name;

    public SalesManager(String account_id, String name, String surname, String email, String password, String company_name){
        super(account_id, name, surname, email, password);
        this.company_name = company_name;
    }
}
