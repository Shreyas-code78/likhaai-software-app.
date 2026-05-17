package com.likhaai.repository;

import com.likhaai.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByWriterIdOrderByCreatedAtDesc(String writerId);
    boolean existsByTaskIdAndStudentId(String taskId, String studentId);
}
