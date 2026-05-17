package com.likhaai.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String name;
    private String phone;
    private String role; // STUDENT or WRITER
    private String profilePic;
    private String city;
    private String state;

    // Location for nearby matching
    private double latitude;
    private double longitude;

    // Writer-specific fields
    private String bio;
    private List<String> subjects;
    private List<String> handwritingSamples; // file paths
    private boolean available;
    private double pricePerPage;
    private double rating;
    private int totalReviews;
    private int completedTasks;

    // Student-specific
    private int postedTasks;

    @CreatedDate
    private LocalDateTime createdAt;

    private boolean active = true;
}
