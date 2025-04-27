package org.project.model;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;


@Document("receipts")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Invoice {

    @Id
    private String InvoiceId;
    private Customer purchaser;
    private Map<String, Integer> purchased;
    private double total_price;
    private String orderStatus;

}
