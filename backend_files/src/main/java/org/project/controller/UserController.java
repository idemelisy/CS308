package org.project.controller;

import org.project.model.*;
import org.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    @Autowired UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequest userRequest){
        try{
            User newUser = userService.general_register(
                    userRequest.getUserType(),
                    userRequest.getName(),
                    userRequest.getSurname(),
                    userRequest.getEmail(),
                    userRequest.getPassword(),
                    userRequest.getAdditionalParams()
            );

            return ResponseEntity.ok(newUser);
        } catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserRequest userRequest){
        try{
            User loggedInUser = userService.login(
                    userRequest.getEmail(),
                    userRequest.getPassword()
            );

            return ResponseEntity.ok(loggedInUser);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/guest-to-user")
    public User guest_to_user(@RequestBody Customer customer, @RequestParam String guest_id){
        Guest guest = (Guest) user_repo.findById(guest_id).get();
        return userService.merge_carts(guest, customer);
    }
}
