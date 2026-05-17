package com.likhaai.controller;

import com.likhaai.config.JwtUtil;
import com.likhaai.model.User;
import com.likhaai.repository.ReviewRepository;
import com.likhaai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/writers")
public class WriterController {

    @Autowired private UserRepository userRepo;
    @Autowired private ReviewRepository reviewRepo;
    @Autowired private JwtUtil jwtUtil;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyWriters(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "20") double radius,
            @RequestHeader("Authorization") String auth) {

        List<User> writers = userRepo.findByRoleAndAvailable("WRITER", true);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User w : writers) {
            double dist = calculateDistance(lat, lng, w.getLatitude(), w.getLongitude());
            if (dist <= radius) {
                Map<String, Object> writerMap = buildPublicWriterProfile(w);
                writerMap.put("distance", Math.round(dist * 10.0) / 10.0);
                result.add(writerMap);
            }
        }
        result.sort(Comparator.comparingDouble(m -> (Double) m.get("distance")));
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<?> getAllWriters(
            @RequestParam(required = false) String city,
            @RequestHeader("Authorization") String auth) {

        List<User> writers;
        if (city != null && !city.isEmpty()) {
            writers = userRepo.findByRoleAndCity("WRITER", city);
        } else {
            writers = userRepo.findByRoleAndAvailable("WRITER", true);
        }

        List<Map<String, Object>> result = writers.stream()
                .map(this::buildPublicWriterProfile).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWriterById(@PathVariable String id) {
        return userRepo.findById(id)
                .map(w -> ResponseEntity.ok(buildPublicWriterProfile(w)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body,
                                            @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        User writer = userRepo.findById(userId).orElseThrow();

        if (body.containsKey("bio")) writer.setBio((String) body.get("bio"));
        if (body.containsKey("pricePerPage")) writer.setPricePerPage(Double.parseDouble(body.get("pricePerPage").toString()));
        if (body.containsKey("available")) writer.setAvailable((Boolean) body.get("available"));
        if (body.containsKey("subjects")) writer.setSubjects((List<String>) body.get("subjects"));
        if (body.containsKey("city")) writer.setCity((String) body.get("city"));
        if (body.containsKey("latitude")) writer.setLatitude(Double.parseDouble(body.get("latitude").toString()));
        if (body.containsKey("longitude")) writer.setLongitude(Double.parseDouble(body.get("longitude").toString()));
        if (body.containsKey("name")) writer.setName((String) body.get("name"));

        userRepo.save(writer);
        return ResponseEntity.ok(buildPublicWriterProfile(writer));
    }

    @PostMapping("/samples/upload")
    public ResponseEntity<?> uploadSample(@RequestParam("file") MultipartFile file,
                                           @RequestHeader("Authorization") String auth) throws IOException {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        User writer = userRepo.findById(userId).orElseThrow();

        String dir = uploadDir + "/samples/" + userId;
        Files.createDirectories(Paths.get(dir));

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(dir, filename);
        Files.write(filePath, file.getBytes());

        List<String> samples = writer.getHandwritingSamples() == null ? new ArrayList<>() : writer.getHandwritingSamples();
        samples.add("/api/files/samples/" + userId + "/" + filename);
        writer.setHandwritingSamples(samples);
        userRepo.save(writer);

        return ResponseEntity.ok(Map.of("url", "/api/files/samples/" + userId + "/" + filename));
    }

    @PutMapping("/availability")
    public ResponseEntity<?> toggleAvailability(@RequestBody Map<String, Boolean> body,
                                                  @RequestHeader("Authorization") String auth) {
        String userId = jwtUtil.extractUserId(auth.substring(7));
        User writer = userRepo.findById(userId).orElseThrow();
        writer.setAvailable(body.get("available"));
        userRepo.save(writer);
        return ResponseEntity.ok(Map.of("available", writer.isAvailable()));
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // SECURITY FIX: Phone number is NOT included in public writer profile
    private Map<String, Object> buildPublicWriterProfile(User w) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", w.getId());
        m.put("name", w.getName());
        // phone intentionally omitted for security
        m.put("city", w.getCity());
        m.put("bio", w.getBio());
        m.put("rating", w.getRating());
        m.put("totalReviews", w.getTotalReviews());
        m.put("completedTasks", w.getCompletedTasks());
        m.put("pricePerPage", w.getPricePerPage());
        m.put("available", w.isAvailable());
        m.put("handwritingSamples", w.getHandwritingSamples());
        m.put("subjects", w.getSubjects());
        m.put("profilePic", w.getProfilePic());
        m.put("latitude", w.getLatitude());
        m.put("longitude", w.getLongitude());
        return m;
    }
}
