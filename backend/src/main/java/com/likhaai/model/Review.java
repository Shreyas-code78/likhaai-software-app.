package com.likhaai.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "reviews")
public class Review {
    @Id
    private String id;

    private String taskId;
    private String writerId;
    private String studentId;
    private String studentName;

    private int rating; // 1-5
    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;
}
