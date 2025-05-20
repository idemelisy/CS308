package org.project.model;

import java.util.Map;

import java.time.Instant;
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
    private String invoiceId;
    private Customer purchaser;
    private Map<String, Integer> purchased;
    private Map<String, Double> prices;
    private double total_price;
    private String orderStatus;
    private Instant date;
    private String address;

}
