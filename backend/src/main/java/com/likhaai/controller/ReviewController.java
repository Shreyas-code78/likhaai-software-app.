package com.likhaai.controller;

import com.likhaai.config.JwtUtil;
import com.likhaai.model.Review;
import com.likhaai.model.User;
import com.likhaai.repository.ReviewRepository;
import com.likhaai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired private ReviewRepository reviewRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> body,
                                        @RequestHeader("Authorization") String auth) {
        String studentId = jwtUtil.extractUserId(auth.substring(7));

        String taskId = (String) body.get("taskId");
        String writerId = (String) body.get("writerId");

        if (reviewRepo.existsByTaskIdAndStudentId(taskId, studentId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Review already submitted!"));
        }

        Review review = new Review();
        review.setTaskId(taskId);
        review.setWriterId(writerId);
        review.setStudentId(studentId);
        review.setRating(Integer.parseInt(body.get("rating").toString()));
        review.setComment((String) body.getOrDefault("comment", ""));

        userRepo.findById(studentId).ifPresent(u -> review.setStudentName(u.getName()));
        reviewRepo.save(review);

        // Recalculate writer rating
        List<Review> allReviews = reviewRepo.findByWriterIdOrderByCreatedAtDesc(writerId);
        OptionalDouble avg = allReviews.stream().mapToInt(Review::getRating).average();
        userRepo.findById(writerId).ifPresent(w -> {
            w.setRating(avg.orElse(0));
            w.setTotalReviews(allReviews.size());
            userRepo.save(w);
        });

        return ResponseEntity.ok(review);
    }

    @GetMapping("/writer/{writerId}")
    public ResponseEntity<?> getWriterReviews(@PathVariable String writerId) {
        return ResponseEntity.ok(reviewRepo.findByWriterIdOrderByCreatedAtDesc(writerId));
    }
}
