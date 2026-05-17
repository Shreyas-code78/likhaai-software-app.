package com.likhaai.controller;

import com.likhaai.config.JwtUtil;
import com.likhaai.model.User;
import com.likhaai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "This email is already registered. Please log in."));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode((String) body.get("password")));
        user.setName((String) body.get("name"));
        user.setPhone((String) body.getOrDefault("phone", ""));
        user.setRole((String) body.get("role"));
        user.setCity((String) body.getOrDefault("city", ""));
        user.setState((String) body.getOrDefault("state", ""));

        if (body.containsKey("latitude")) user.setLatitude(Double.parseDouble(body.get("latitude").toString()));
        if (body.containsKey("longitude")) user.setLongitude(Double.parseDouble(body.get("longitude").toString()));

        if ("WRITER".equals(user.getRole())) {
            user.setAvailable(true);
            user.setPricePerPage(body.containsKey("pricePerPage") ?
                    Double.parseDouble(body.get("pricePerPage").toString()) : 5.0);
            user.setBio((String) body.getOrDefault("bio", ""));
        }

        User saved = userRepo.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getId());

        return ResponseEntity.ok(buildAuthResponse(saved, token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        Optional<User> opt = userRepo.findByEmail(body.get("email"));
        if (opt.isEmpty() || !passwordEncoder.matches(body.get("password"), opt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect email or password. Please try again."));
        }

        User user = opt.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String userId = jwtUtil.extractUserId(token);
        return userRepo.findById(userId)
                .map(u -> ResponseEntity.ok(sanitizeUser(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("user", sanitizeUser(user));
        return res;
    }

    private Map<String, Object> sanitizeUser(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        // phone returned only to the user themselves
        m.put("phone", u.getPhone());
        m.put("role", u.getRole());
        m.put("city", u.getCity());
        m.put("state", u.getState());
        m.put("latitude", u.getLatitude());
        m.put("longitude", u.getLongitude());
        m.put("bio", u.getBio());
        m.put("rating", u.getRating());
        m.put("totalReviews", u.getTotalReviews());
        m.put("completedTasks", u.getCompletedTasks());
        m.put("pricePerPage", u.getPricePerPage());
        m.put("available", u.isAvailable());
        m.put("handwritingSamples", u.getHandwritingSamples());
        m.put("subjects", u.getSubjects());
        m.put("profilePic", u.getProfilePic());
        return m;
    }
}
