package org.project.repository;

import org.project.model.Refund;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RefundRepository extends MongoRepository<Refund, String>{
    
}
