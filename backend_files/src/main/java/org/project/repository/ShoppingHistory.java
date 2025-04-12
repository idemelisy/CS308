package org.project.repository;

import java.util.List;

import org.project.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ShoppingHistory extends MongoRepository<Invoice, String>{
        public List<Invoice> findByPurchaserAccount_id(String customerID);
}
