package com.likhaai.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;

    @Indexed
    private String taskId;
    private String senderId;
    private String senderName;
    private String senderRole; // STUDENT or WRITER
    private String content;
    private boolean read = false;
    private LocalDateTime createdAt;
}
