package org.project.repository;


import java.time.Instant;
import java.util.List;

import org.project.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface ShoppingHistory extends MongoRepository<Invoice, String>{
    Invoice findByInvoiceId(String InvoiceId);
    List<Invoice> findByDateBetween(Instant startDate, Instant endDate);
}
