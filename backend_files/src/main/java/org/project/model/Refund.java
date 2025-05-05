package org.project.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;


@Document("refunds")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Refund {
    @Id
    private String refundID;
    private Customer refundCustomer;
    private String refund_productID;
    private int refund_pieces;
    private double refund_amount;
    private String approvalStatus;
}
