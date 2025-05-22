package org.project.service;

import lombok.builder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.project.model.Customer;
import org.project.model.Invoice;
import org.project.model.product_model.Product;
import org.project.repository.ProductRepository;
import org.project.repository.ShoppingHistory;
import org.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
@ComponentScan(basePackages = "org.project")
public class NewUnitTests {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private UserRepository user_repo;

    @Autowired
    private ProductService productService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ShoppingHistory invoiceRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        TextIndexDefinition textIndex = TextIndexDefinition.builder()
                .onField("name")
                .onField("description")
                .build();
        mongoTemplate.indexOps(Product.class).ensureIndex(textIndex);

        invoiceRepository.deleteAll();
    }

    private Invoice createTestInvoice(String id, String status) {
        return Invoice.builder()
                .invoiceId(id)
                .customerId("cust123")
                .totalAmount(100.0)
                .orderStatus(status)
                .orderDate(new Date())
                .build();
    }
    }

    @Test
    void testSaveProduct() {
        Product product = new Product("1", "Laptop", "XPS 13", "SN12345", "High-performance laptop", 1000.0, 10, "Electronics", "Active", "DIST001");
        Product savedProduct = productRepository.save(product);
        assertNotNull(savedProduct);
        assertEquals("Laptop", savedProduct.getName());
    }

    @Test
    void testGetProductById() {
        Product product = new Product("emirhan", "Laptop", "XPS 13", "SN12345", "High-performance laptop", 1000.0, 10, "Electronics", "Active", "DIST001");
        productRepository.save(product);
        Optional<Product> foundProduct = productRepository.findById("emirhan");
        assertTrue(foundProduct.isPresent());
        assertEquals("Laptop", foundProduct.get().getName());
    }

    @Test
    void testGetProductById_notFound() {
        Optional<Product> foundProduct = productRepository.findById("zeynep");
        assertFalse(foundProduct.isPresent());
    }

    @Test
    void testFindAllByUnitPriceAsc_withMultipleProducts() {
        productRepository.save(new Product("1", "Laptop", "XPS 13", "SN12345", "High-performance laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        productRepository.save(new Product("2", "Phone", "Galaxy S21", "SN67890", "Smartphone with 5G", 500.0, 20, "Electronics", "Active", "DIST002"));
        productRepository.save(new Product("3", "Tablet", "iPad Air", "SN11223", "Lightweight tablet", 750.0, 15, "Electronics", "Active", "DIST003"));

        List<Product> products = productRepository.findAllByUnitPriceAsc();

        assertEquals(3, products.size());
        assertEquals(500.0, products.get(0).getUnitPrice()); 
        assertEquals(750.0, products.get(1).getUnitPrice()); 
        assertEquals(1000.0, products.get(2).getUnitPrice()); 
    }

    @Test
    void testFindAllByUnitPriceAsc_emptyDatabase() {
        List<Product> products = productRepository.findAllByUnitPriceAsc();
        assertTrue(products.isEmpty());
    }

    @Test
    void testFindAllByUnitPriceAsc_singleProduct() {
        productRepository.save(new Product("1", "Laptop", "XPS 13", "SN12345", "High-performance laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        List<Product> products = productRepository.findAllByUnitPriceAsc();
        assertEquals(1, products.size());
        assertEquals("Laptop", products.get(0).getName());
        assertEquals(1000.0, products.get(0).getUnitPrice());
    }

    @Test
    void testFindAllByUnitPriceDesc_withMultipleProducts() {
        productRepository.save(new Product("1", "Laptop", "XPS 13", "SN12345", "High-performance laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        productRepository.save(new Product("2", "Phone", "Galaxy S21", "SN67890", "Smartphone with 5G", 500.0, 20, "Electronics", "Active", "DIST002"));
        productRepository.save(new Product("3", "Tablet", "iPad Air", "SN11223", "Lightweight tablet", 750.0, 15, "Electronics", "Active", "DIST003"));

        List<Product> products = productRepository.findAllByUnitPriceDesc();

        assertEquals(3, products.size());
        assertEquals(1000.0, products.get(0).getUnitPrice()); 
        assertEquals(750.0, products.get(1).getUnitPrice()); 
        assertEquals(500.0, products.get(2).getUnitPrice()); 
    }

    @Test
    void testFindAllByUnitPriceDesc_emptyDatabase() {
        List<Product> products = productRepository.findAllByUnitPriceDesc();
        assertTrue(products.isEmpty());
    }

    @Test
    void testFindAllByUnitPriceDesc_singleProduct() {
        productRepository.save(new Product("1", "Laptop", "XPS 13", "SN12345", "High-performance laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        List<Product> products = productRepository.findAllByUnitPriceDesc();
        assertEquals(1, products.size());
        assertEquals("Laptop", products.get(0).getName());
        assertEquals(1000.0, products.get(0).getUnitPrice());
    }

    @Test
    void testFullTextSearch_matchingProducts() {
        productRepository.save(new Product("1", "Laptop Dell", "XPS 13", "SN12345", "High-performance Dell laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        productRepository.save(new Product("2", "Phone Samsung", "Galaxy S21", "SN67890", "Smartphone with 5G", 500.0, 20, "Electronics", "Active", "DIST002"));
        productRepository.save(new Product("3", "Tablet Apple", "iPad Air", "SN11223", "Lightweight tablet", 750.0, 15, "Electronics", "Active", "DIST003"));

        List<Product> products = productRepository.fullTextSearch("Laptop");

        assertEquals(1, products.size());
        assertEquals("Laptop Dell", products.get(0).getName());
    }

    @Test
    void testFullTextSearch_noMatches() {
        productRepository.save(new Product("1", "Laptop Dell", "XPS 13", "SN12345", "High-performance Dell laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        productRepository.save(new Product("2", "Phone Samsung", "Galaxy S21", "SN67890", "Smartphone with 5G", 500.0, 20, "Electronics", "Active", "DIST002"));

        List<Product> products = productRepository.fullTextSearch("Camera");

        assertTrue(products.isEmpty());
    }

    @Test
    void testFullTextSearch_multipleMatches() {
        productRepository.save(new Product("1", "Laptop Dell", "XPS 13", "SN12345", "High-performance Dell laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        productRepository.save(new Product("2", "Laptop HP", "Spectre x360", "SN98765", "Convertible HP laptop", 900.0, 5, "Electronics", "Active", "DIST002"));
        productRepository.save(new Product("3", "Phone Samsung", "Galaxy S21", "SN67890", "Smartphone with 5G", 500.0, 20, "Electronics", "Active", "DIST003"));

        List<Product> products = productRepository.fullTextSearch("Laptop");

        assertEquals(2, products.size());
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Laptop Dell")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Laptop HP")));
    }

    @Test
    void testFindByName_found() {
        productRepository.save(new Product("1", "Laptop Dell", "XPS 13", "SN12345", "High-performance Dell laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        Product foundProduct = productRepository.findByName("Laptop Dell");
        assertNotNull(foundProduct);
        assertEquals("Laptop Dell", foundProduct.getName());
        assertEquals("XPS 13", foundProduct.getModel());
    }

    @Test
    void testFindByName_notFound() {
        productRepository.save(new Product("1", "Laptop Dell", "XPS 13", "SN12345", "High-performance Dell laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        Product foundProduct = productRepository.findByName("Phone Samsung");
        assertNull(foundProduct);
    }

    @Test
    void testFindByCategory_multipleProducts() {
        productRepository.save(new Product("1", "Laptop Dell", "XPS 13", "SN12345", "High-performance Dell laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        productRepository.save(new Product("2", "Phone Samsung", "Galaxy S21", "SN67890", "Smartphone with 5G", 500.0, 20, "Electronics", "Active", "DIST002"));
        productRepository.save(new Product("3", "T-Shirt", "Cotton V-Neck", "SN11223", "Comfortable t-shirt", 25.0, 50, "Clothing", "Active", "DIST003"));

        List<Product> products = productRepository.findByCategory("Electronics");

        assertEquals(2, products.size());
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Laptop Dell")));
        assertTrue(products.stream().anyMatch(p -> p.getName().equals("Phone Samsung")));
    }

    @Test
    void testFindByCategory_noMatches() {
        productRepository.save(new Product("1", "Laptop Dell", "XPS 13", "SN12345", "High-performance Dell laptop", 1000.0, 10, "Electronics", "Active", "DIST001"));
        List<Product> products = productRepository.findByCategory("Clothing");
        assertTrue(products.isEmpty());
    }

    @Test
void testAddToWishlist_shouldAddProductToCustomerWishlist() {
    Product product = Product.builder()
            .product_id("1")
            .name("Laptop")
            .model("XPS 13")
            .serialNumber("SN123")
            .description("Desc")
            .unitPrice(1000.0)
            .stock(10)
            .category("Electronics")
            .warrantyStatus("Active")
            .distributorID("DIST1")
            .build();
    productRepository.save(product);
    
    Customer customer = Customer.builder()
            .account_id("cust1")
            .name("John")
            .surname("Doe")
            .email("john@example.com")
            .password("password")
            .build();
    user_repo.save(customer);
    
    Customer updatedCustomer = customerService.add_to_wishlist(product, "cust1");
    
    assertTrue(updatedCustomer.getWishlist().contains("1"));
    assertEquals(1, updatedCustomer.getWishlist().size());
}

@Test
void testAddToWishlist_whenCustomerNotFound_shouldThrowException() {
    Product product = Product.builder()
            .product_id("1")
            .name("Laptop")
            .model("XPS 13")
            .build();
    productRepository.save(product);
    
    assertThrows(NoSuchElementException.class, () -> {
        customerService.add_to_wishlist(product, "non-existent-id");
    });
}

@Test
void testAddToWishlist_whenProductAlreadyInWishlist_shouldNotDuplicate() {
    Product product = Product.builder()
            .product_id("1")
            .name("Laptop")
            .build();
    productRepository.save(product);
    
    Customer customer = Customer.builder()
            .account_id("cust1")
            .wishlist(new HashSet<>(Set.of("1")))
            .build();
    user_repo.save(customer);
    
    
    Customer updatedCustomer = customerService.add_to_wishlist(product, "cust1");
    
    assertEquals(1, updatedCustomer.getWishlist().size());
}

@Test
void testDropFromWishlist_shouldRemoveProductFromCustomerWishlist() {
    Product product = Product.builder()
            .product_id("1")
            .name("Laptop")
            .build();
    productRepository.save(product);
    
    Customer customer = Customer.builder()
            .account_id("cust1")
            .wishlist(new HashSet<>(Set.of("1")))
            .build();
    user_repo.save(customer);
    
    Customer updatedCustomer = customerService.drop_from_wishlist(product, "cust1");
    
    assertFalse(updatedCustomer.getWishlist().contains("1"));
    assertTrue(updatedCustomer.getWishlist().isEmpty());
}

@Test
void testDropFromWishlist_whenProductNotInWishlist_shouldNotChangeWishlist() {
    Product product = Product.builder()
            .product_id("1")
            .build();
    productRepository.save(product);
    
    Customer customer = Customer.builder()
            .account_id("cust1")
            .wishlist(new HashSet<>(Set.of("2", "3")))
            .build();
    user_repo.save(customer);
    
    Customer updatedCustomer = customerService.drop_from_wishlist(product, "cust1");
    
    assertEquals(2, updatedCustomer.getWishlist().size());
}

@Test
void testDropFromWishlist_whenCustomerNotFound_shouldThrowException() {
    Product product = Product.builder()
            .product_id("1")
            .build();
    productRepository.save(product);
    
    assertThrows(NoSuchElementException.class, () -> {
        customerService.drop_from_wishlist(product, "non-existent-id");
    });
}

@Test
    void testCancelOrder_WhenStatusIsProcessing_ShouldDeleteInvoice() {
        Invoice invoice = createTestInvoice("inv1", "processing");
        invoiceRepository.save(invoice);

        String result = customerService.cancel_order("inv1");

        assertEquals("Successfully deleted order", result);
        assertFalse(invoiceRepository.existsById("inv1"));
    }

    @Test
    void testCancelOrder_WhenStatusIsShipped_ShouldNotDeleteInvoice() {
        Invoice invoice = createTestInvoice("inv2", "shipped");
        invoiceRepository.save(invoice);

        String result = customerService.cancel_order("inv2");

        assertEquals("Could not delete order", result);
        assertTrue(invoiceRepository.existsById("inv2"));
    }

    @Test
    void testCancelOrder_WhenInvoiceNotFound_ShouldReturnErrorMessage() {

        String result = customerService.cancel_order("non-existent-id");

        assertEquals("Could not delete order", result);
    }

    @Test
    void testCancelOrder_WhenStatusIsNull_ShouldNotDeleteInvoice() {
        Invoice invoice = createTestInvoice("inv3", null);
        invoiceRepository.save(invoice);

        String result = customerService.cancel_order("inv3");

        assertEquals("Could not delete order", result);
        assertTrue(invoiceRepository.existsById("inv3"));
    }

    @Test
    void testCancelOrder_WhenMultipleInvoicesExist_ShouldDeleteCorrectOne() {
        Invoice invoice1 = createTestInvoice("inv4", "processing");
        Invoice invoice2 = createTestInvoice("inv5", "shipped");
        invoiceRepository.save(invoice1);
        invoiceRepository.save(invoice2);

        String result = customerService.cancel_order("inv4");

        assertEquals("Successfully deleted order", result);
        assertFalse(invoiceRepository.existsById("inv4"));
        assertTrue(invoiceRepository.existsById("inv5"));
    }
}
