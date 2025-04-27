package org.project.repository;

import org.project.model.ProductManager;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.project.model.User;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String>{
    User findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("{ '_class' : 'product_manager' }")
    List<ProductManager> findAllProductManagers();
}
