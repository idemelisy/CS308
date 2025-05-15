package org.project.repository;


import org.project.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ShoppingHistory extends MongoRepository<Invoice, String>{
}
