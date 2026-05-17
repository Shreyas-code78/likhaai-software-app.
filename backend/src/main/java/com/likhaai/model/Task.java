package com.likhaai.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String writerId; // assigned writer

    private String title;
    private String description;
    private String subject;
    private int pages;
    private String deadline; // e.g. "2024-12-25"
    private String urgency; // LOW, MEDIUM, HIGH

    private double budget; // student's budget
    private double agreedPrice; // final agreed price

    // Status flow: OPEN → ASSIGNED → IN_PROGRESS → COMPLETED → DELIVERED
    private String status = "OPEN";

    private String deliveryType; // HAND_TO_HAND or DELIVERY_PERSON
    private double deliveryCharge;

    private String paymentMethod; // UPI or COD
    private boolean paid = false;

    private String specialInstructions;

    // Location of student for nearby matching
    private double studentLat;
    private double studentLng;
    private String studentCity;

    @CreatedDate
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private LocalDateTime deliveredAt;
}
