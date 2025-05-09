package org.project.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.project.model.Invoice;
import org.project.model.product_model.Comment;
import org.project.repository.CommentRepository;
import org.project.repository.ShoppingHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ProductManagerService {

    @Autowired
    private CommentRepository comment_repo;

    @Autowired
    private ShoppingHistory invoice_repo;

    
    public List<Comment> list_waiting_approvals(){
        List<Comment> all = comment_repo.findAll();
        return all == null ? new ArrayList<>() : 
           all.stream()
              .filter(comment -> "waiting-approval".equals(comment.getApprovalStatus()))
              .collect(Collectors.toList());
    }

    public Comment approve_comment(Comment comment){

        comment.setApprovalStatus("approved");
        return comment_repo.save(comment);
    }

    public Comment reject_comment(Comment comment){
    
        comment.setApprovalStatus("rejected");
        return comment_repo.save(comment);
    }

    public List<Invoice> get_all_orders() {
        List<Invoice> all = invoice_repo.findAll();
        return all != null ? all : Collections.emptyList();
    }

    public Invoice advance_order_status(Invoice invoice){
        switch(invoice.getOrderStatus()){
            case "processing":
                invoice.setOrderStatus("in-transit");
                break;
            case "in-transit":
                invoice.setOrderStatus("delivered");
                break;
            default:
                break;

        }
        return invoice_repo.save(invoice);
    }
}
