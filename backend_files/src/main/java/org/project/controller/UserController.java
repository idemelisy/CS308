package org.project.controller;

import org.project.model.*;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    @Autowired UserService userService;

    @PostMapping("/register")
    public String registerUser(@RequestBody UserRequest userRequest){
        try{
            userService.general_register(
                    userRequest.getUserType(),
                    userRequest.getName(),
                    userRequest.getSurname(),
                    userRequest.getEmail(),
                    userRequest.getPassword(),
                    userRequest.getAdditionalParams()
            );

            return "Successfull - POST Register Request";
        } catch(IllegalArgumentException e){
            return "Error Detected.";
        }

    }

    @PostMapping("/login")
    public String loginUser(@RequestParam String email, @RequestParam String pass){
        try{
            userService.login(email, pass);

            return "Successfull - POST Login Request";
        } catch (RuntimeException e){
            return "Incorrect Password";
        }
    }
}
