package org.project.service;

import org.project.model.*;
import org.project.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository user_repo;

    private String generate_id() {
        return UUID.randomUUID().toString();
    }

    public User merge_carts(String guestID, Customer customer){
        Guest guest = (Guest) user_repo.findById(guestID).get();

        customer.setShopping_cart(guest.getShopping_cart() != null ? new HashMap<>(guest.getShopping_cart()) : new HashMap<>());
        user_repo.delete(guest);
        return user_repo.save(customer);
    }

    public User general_register(String user_type, String name, String surname, String email, String password, Map<String, String> additional_params) {
        if (user_repo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use.");
        }

        String new_id = generate_id();
        User new_user;

        switch (user_type.toLowerCase()) {
            case "guest":
                new_user = new Guest(new_id);
                break;

            case "customer":
                new_user = new Customer(new_id, name, surname, email, password);
                break;

            case "sales_manager":
                String company_name = additional_params.get("company_name");
                new_user = new SalesManager(new_id, name, surname, email, password, company_name);
                break;

            case "product_manager":
                String department = additional_params.get("department");
                new_user = new ProductManager(new_id, name, surname, email, password, department);
                break;

            default:
                throw new IllegalArgumentException();
        }

        return user_repo.save(new_user);
    }

    public User login(String email, String password) {
        User user = user_repo.findByEmail(email);

        if (user == null || !password.matches(user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    public List<Customer> getAllCustomers() {
        return user_repo.findAll().stream()
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .collect(Collectors.toList());
    }
    
    public List<ProductManager> getAllProductManagers() {
        return user_repo.findAll().stream()
                .filter(user -> user instanceof ProductManager)
                .map(user -> (ProductManager) user)
                .collect(Collectors.toList());
    }

    public List<SalesManager> getAllSalesManagers() {
        return user_repo.findAll().stream()
                .filter(user -> user instanceof SalesManager)
                .map(user -> (SalesManager) user)
                .collect(Collectors.toList());
    }
}
