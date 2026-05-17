package com.likhaai.controller;

import com.likhaai.config.JwtUtil;
import com.likhaai.model.Task;
import com.likhaai.model.User;
import com.likhaai.repository.TaskRepository;
import com.likhaai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired private TaskRepository taskRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> body,
                                         @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        User student = userRepo.findById(userId).orElseThrow();

        Task task = new Task();
        task.setStudentId(userId);
        task.setStudentName(student.getName());
        task.setTitle((String) body.get("title"));
        task.setDescription((String) body.get("description"));
        task.setSubject((String) body.get("subject"));
        task.setPages(Integer.parseInt(body.get("pages").toString()));
        task.setDeadline((String) body.get("deadline"));
        task.setUrgency((String) body.getOrDefault("urgency", "MEDIUM"));
        task.setBudget(Double.parseDouble(body.get("budget").toString()));
        task.setSpecialInstructions((String) body.getOrDefault("specialInstructions", ""));
        task.setDeliveryType((String) body.getOrDefault("deliveryType", "HAND_TO_HAND"));
        task.setPaymentMethod((String) body.getOrDefault("paymentMethod", "COD"));
        task.setStudentLat(student.getLatitude());
        task.setStudentLng(student.getLongitude());
        task.setStudentCity(student.getCity());
        task.setStatus("OPEN");

        Task saved = taskRepo.save(task);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/open")
    public ResponseEntity<?> getOpenTasks(@RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        User writer = userRepo.findById(userId).orElseThrow();
        List<Task> cityTasks = taskRepo.findByStudentCityAndStatusOrderByCreatedAtDesc(writer.getCity(), "OPEN");
        if (cityTasks.isEmpty()) {
            return ResponseEntity.ok(taskRepo.findByStatusOrderByCreatedAtDesc("OPEN"));
        }
        return ResponseEntity.ok(cityTasks);
    }

    @GetMapping("/my")
    public ResponseEntity<?> myTasks(@RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        return ResponseEntity.ok(taskRepo.findByStudentIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/assigned")
    public ResponseEntity<?> assignedTasks(@RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        return ResponseEntity.ok(taskRepo.findByWriterIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(@PathVariable String id,
                                      @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        return taskRepo.findById(id)
                .map(task -> {
                    // Only student or assigned writer can view task
                    if (!userId.equals(task.getStudentId()) && !userId.equals(task.getWriterId())
                            && !"OPEN".equals(task.getStatus())) {
                        return ResponseEntity.status(403).<Task>build();
                    }
                    return ResponseEntity.ok(task);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptTask(@PathVariable String id,
                                         @RequestHeader("Authorization") String auth) {
        String writerId = jwtUtil.extractUserId(auth.substring(7));
        Optional<Task> opt = taskRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Task task = opt.get();
        if (!"OPEN".equals(task.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "This task has already been assigned to another writer."));
        }

        task.setWriterId(writerId);
        task.setStatus("ASSIGNED");
        task.setAssignedAt(LocalDateTime.now());
        taskRepo.save(task);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectTask(@PathVariable String id,
                                         @RequestHeader("Authorization") String auth) {
        String writerId = jwtUtil.extractUserId(auth.substring(7));
        Optional<Task> opt = taskRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Task task = opt.get();
        if (writerId.equals(task.getWriterId())) {
            task.setWriterId(null);
            task.setStatus("OPEN");
            task.setAssignedAt(null);
            taskRepo.save(task);
        }
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @RequestBody Map<String, String> body,
                                           @RequestHeader("Authorization") String auth) {
        Optional<Task> opt = taskRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Task task = opt.get();
        String newStatus = body.get("status");
        task.setStatus(newStatus);

        if ("COMPLETED".equals(newStatus)) task.setCompletedAt(LocalDateTime.now());
        if ("DELIVERED".equals(newStatus)) {
            task.setDeliveredAt(LocalDateTime.now());
            userRepo.findById(task.getWriterId()).ifPresent(w -> {
                w.setCompletedTasks(w.getCompletedTasks() + 1);
                userRepo.save(w);
            });
        }

        taskRepo.save(task);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}/assign/{writerId}")
    public ResponseEntity<?> assignWriter(@PathVariable String id,
                                           @PathVariable String writerId,
                                           @RequestHeader("Authorization") String auth) {
        Optional<Task> opt = taskRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Task task = opt.get();
        task.setWriterId(writerId);
        task.setStatus("ASSIGNED");
        task.setAssignedAt(LocalDateTime.now());
        taskRepo.save(task);
        return ResponseEntity.ok(task);
    }

    /**
     * Simulated payment endpoint - marks task as paid with chosen method
     */
    @PutMapping("/{id}/pay")
    public ResponseEntity<?> processPayment(@PathVariable String id,
                                             @RequestBody Map<String, Object> body,
                                             @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        Optional<Task> opt = taskRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Task task = opt.get();
        if (!userId.equals(task.getStudentId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Only the student can make payment."));
        }

        task.setPaid(true);
        task.setPaymentMethod((String) body.getOrDefault("paymentMethod", "UPI"));
        if (body.containsKey("agreedPrice")) {
            task.setAgreedPrice(Double.parseDouble(body.get("agreedPrice").toString()));
        }
        taskRepo.save(task);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Payment processed successfully.",
            "transactionId", "LKH" + System.currentTimeMillis(),
            "amount", task.getAgreedPrice() > 0 ? task.getAgreedPrice() : task.getBudget(),
            "method", task.getPaymentMethod()
        ));
    }
}
