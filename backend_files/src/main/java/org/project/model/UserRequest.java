package org.project.model;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter

public class UserRequest {

    private String userType;
    private String name;
    private String surname;
    private String email;
    private String password;
    private Map<String, String> additionalParams;
}
