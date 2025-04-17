package org.project.service;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


import org.project.model.Customer;
import org.project.model.Invoice;
import org.project.model.User;
import org.project.model.product_model.Product;
import org.project.repository.ShoppingHistory;
import org.project.repository.UserRepository;
import org.project.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class CustomerService {

    @Autowired
    private ShoppingHistory receipt;

    @Autowired
    private UserRepository user_repo;

    @Autowired
    private ProductRepository product_repo;

    private String generate_id() {
        return UUID.randomUUID().toString();
    }

    public Invoice checkout(Customer current_customer){
        Invoice new_receipt = new Invoice();
        new_receipt.setInvoiceId(generate_id());
        new_receipt.setPurchased(new HashMap<>(current_customer.getShopping_cart()));
        new_receipt.setPurchaser(current_customer);

        for(HashMap.Entry<String, Integer> entry: current_customer.getShopping_cart().entrySet()){
            Integer quantity = entry.getValue();
            String product_id = entry.getKey();
            Product curr_product = product_repo.findById(product_id).get();

            curr_product.setStock(curr_product.getStock() - quantity);
            product_repo.save(curr_product);
        }
        
        double total_price = current_customer.getShopping_cart().entrySet()
            .stream()
            .mapToDouble(entry -> {String productID = entry.getKey();
                                   Integer quantity = entry.getValue();
                                   Product product = product_repo.findById(productID).get();
                                   return product.getUnitPrice() * quantity;
                                })
            .sum();
        

        new_receipt.setTotal_price(total_price);

        current_customer.getShopping_cart().clear();
        user_repo.save(current_customer);
        return receipt.save(new_receipt);
    }

    public String delete_from_cart(Product certain_product, String email){
        User current_user = user_repo.findByEmail(email);
        Customer current_customer = (Customer) current_user;

        HashMap<String, Integer> shopping_cart = current_customer.getShopping_cart();
        if(shopping_cart == null){
            shopping_cart = new HashMap<>();
            current_customer.setShopping_cart(shopping_cart);
        }
        String productID = certain_product.getProduct_id();
        Integer amount_in_cart = shopping_cart.get(productID);

        if(amount_in_cart == 1){
            shopping_cart.remove(productID);
            user_repo.save(current_customer);
            return "dropped item";
        }
        else{
           amount_in_cart--;
           shopping_cart.put(productID, amount_in_cart);
           user_repo.save(current_customer);
           return "decreased amount";
        }
    }

    public String add_to_cart(Product product, String email){
        User current_user = user_repo.findByEmail(email);
        Customer current_customer = (Customer) current_user;

        HashMap<String, Integer> shopping_cart = current_customer.getShopping_cart();

        if(shopping_cart == null){
            shopping_cart = new HashMap<>();
            current_customer.setShopping_cart(shopping_cart);
        }

        String productID = product.getProduct_id();

        if (shopping_cart.containsKey(productID)){
            Integer amount_in_cart = shopping_cart.get(productID);
            amount_in_cart++;
            shopping_cart.put(productID, amount_in_cart);
        }
        else{
            shopping_cart.put(productID, 1);
        }

        user_repo.save(current_customer);

        return shopping_cart.containsKey(productID) ? "increased amount" : "added to cart";
    }  

    public HashMap<String, Integer> getShoppingCart(Customer current_customer){
        return current_customer.getShopping_cart();
    }

    public List<Invoice> see_shopping_history(String customerID){
        List<Invoice> all = receipt.findAll();

        return all.stream()
                .filter(invoice -> invoice.getPurchaser() != null 
                        && invoice.getPurchaser().getAccount_id() != null
                        && invoice.getPurchaser().getAccount_id().equals(customerID))
                .collect(Collectors.toList());
    }
}
