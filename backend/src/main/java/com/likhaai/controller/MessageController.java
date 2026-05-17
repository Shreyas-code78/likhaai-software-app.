package com.likhaai.controller;

import com.likhaai.config.JwtUtil;
import com.likhaai.model.Message;
import com.likhaai.model.Task;
import com.likhaai.repository.MessageRepository;
import com.likhaai.repository.TaskRepository;
import com.likhaai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired private MessageRepository messageRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private TaskRepository taskRepo;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    /**
     * GET messages for a task - accessible by the student OR the assigned writer
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<?> getMessages(@PathVariable String taskId,
                                          @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));

        // Verify user is authorized to view this chat
        Optional<Task> taskOpt = taskRepo.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!userId.equals(task.getStudentId()) && !userId.equals(task.getWriterId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied. You are not part of this task."));
        }

        List<Message> messages = messageRepo.findByTaskIdOrderByCreatedAtAsc(taskId);
        return ResponseEntity.ok(messages);
    }

    /**
     * POST - Send a message (REST fallback, works even without WebSocket)
     */
    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> body,
                                          @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        String role = jwtUtil.extractRole(auth.substring(7));
        String taskId = body.get("taskId");
        String content = body.get("content");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message content cannot be empty."));
        }

        // Verify task exists and user is authorized
        Optional<Task> taskOpt = taskRepo.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Task task = taskOpt.get();
        if (!userId.equals(task.getStudentId()) && !userId.equals(task.getWriterId())) {
            return ResponseEntity.status(403).body(Map.of("message", "You are not authorized to message on this task."));
        }

        var userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));
        }

        Message msg = new Message();
        msg.setTaskId(taskId);
        msg.setSenderId(userId);
        msg.setSenderName(userOpt.get().getName());
        msg.setSenderRole(role);
        msg.setContent(content.trim());
        msg.setCreatedAt(LocalDateTime.now());
        Message saved = messageRepo.save(msg);

        // Push via WebSocket to all subscribers of this task chat
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + taskId, saved);
        } catch (Exception e) {
            // WebSocket push failed - message was still saved, client can poll
        }

        return ResponseEntity.ok(saved);
    }

    /**
     * WebSocket message handler - /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload Map<String, String> payload) {
        String taskId = payload.get("taskId");
        String senderId = payload.get("senderId");
        String senderName = payload.get("senderName");
        String senderRole = payload.get("senderRole");
        String content = payload.get("content");

        if (taskId == null || content == null || content.trim().isEmpty()) return;

        Message msg = new Message();
        msg.setTaskId(taskId);
        msg.setSenderId(senderId);
        msg.setSenderName(senderName);
        msg.setSenderRole(senderRole);
        msg.setContent(content.trim());
        msg.setCreatedAt(LocalDateTime.now());
        Message saved = messageRepo.save(msg);

        messagingTemplate.convertAndSend("/topic/chat/" + taskId, saved);
    }

    @PutMapping("/{taskId}/read")
    public ResponseEntity<?> markRead(@PathVariable String taskId,
                                       @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        List<Message> messages = messageRepo.findByTaskIdOrderByCreatedAtAsc(taskId);
        messages.stream()
                .filter(m -> !m.getSenderId().equals(userId) && !m.isRead())
                .forEach(m -> { m.setRead(true); messageRepo.save(m); });
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/unread/{taskId}")
    public ResponseEntity<?> unreadCount(@PathVariable String taskId,
                                          @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        long count = messageRepo.countByTaskIdAndSenderIdNotAndReadFalse(taskId, userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
