package com.likhaai.repository;

import com.likhaai.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Task> findByWriterIdOrderByCreatedAtDesc(String writerId);
    List<Task> findByStatusOrderByCreatedAtDesc(String status);
    List<Task> findByStudentCityAndStatusOrderByCreatedAtDesc(String city, String status);
    List<Task> findByWriterIdAndStatusOrderByCreatedAtDesc(String writerId, String status);
    long countByStudentId(String studentId);
    long countByWriterIdAndStatus(String writerId, String status);
}
