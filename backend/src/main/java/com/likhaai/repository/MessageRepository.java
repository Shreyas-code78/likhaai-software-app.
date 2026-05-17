package com.likhaai.repository;

import com.likhaai.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByTaskIdOrderByCreatedAtAsc(String taskId);
    long countByTaskIdAndSenderIdNotAndReadFalse(String taskId, String senderId);
}
