package org.project.service;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;


import org.project.model.Customer;
import org.project.model.Invoice;
import org.project.model.product_model.Product;
import org.project.repository.ShoppingHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class CustomerService {

    @Autowired
    private ShoppingHistory receipt;

    private String generate_id() {
        return UUID.randomUUID().toString();
    }
    


    public Invoice checkout(Customer current_customer){
        Invoice new_receipt = new Invoice();
        new_receipt.setInvoiceId(generate_id());
        new_receipt.setPurchased(current_customer.getShopping_cart());
        new_receipt.setPurchaser(current_customer);

        double total_price = current_customer.getShopping_cart().entrySet()
            .stream()
            .mapToDouble(entry -> entry.getKey().getUnit_price() * entry.getValue())
            .sum();
        
        new_receipt.setTotal_price(total_price);

        current_customer.getShopping_cart().clear();
        return receipt.save(new_receipt);
    }

    public String delete_from_cart(Product certain_product, Customer current_customer){
        HashMap<Product, Integer> shopping_cart = current_customer.getShopping_cart();
        Integer amount_in_cart = shopping_cart.get(certain_product);

        if(amount_in_cart == 1){
            shopping_cart.remove(certain_product);
            return "dropped item";
        }
        else{
           amount_in_cart--;
           return "decreased amount";
        }
    }

    public String add_to_cart(Product certain_product, Customer current_customer){
        HashMap<Product, Integer> shopping_cart = current_customer.getShopping_cart();
        if (shopping_cart.containsKey(certain_product)){
            Integer amount_in_cart = shopping_cart.get(certain_product);
            amount_in_cart++;
            return "increased amount";
        }
        else{
            shopping_cart.put(certain_product, 1);
            return "added to cart";
        }
    }  

    public List<Invoice> see_shopping_history(Customer current_customer){
        return receipt.findByPurchaser(current_customer);
    }
}
