package org.project.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class User {

    @Id
    private String account_id;
    private String name;
    private String surname;
    private String email;
    private String password;


}
