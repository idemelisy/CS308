package org.project.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public class EmailSenderService {
    @Autowired
    private JavaMailSender mailSender;

    public ResponseEntity<String> sendEmail(String toEmail, MultipartFile file) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        try {
            helper.setFrom("308projectinvoice@gmail.com");
            helper.setTo(toEmail);
            helper.setText("Below is the invoice receipt for your checkout.");
            helper.setSubject("Checkout Invoice");

            helper.addAttachment("invoice.pdf", new ByteArrayResource(file.getBytes()));

            mailSender.send(message);
            return ResponseEntity.ok("Invoice sent successfully.");
        }
        catch (Exception e){
            return ResponseEntity.status(500).body("Failed to send invoice.");
        }
    }
}
