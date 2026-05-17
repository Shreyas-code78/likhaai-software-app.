package com.likhaai.repository;

import com.likhaai.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndAvailable(String role, boolean available);

    @Query("{ 'role': 'WRITER', 'available': true, $where: 'function() { " +
           "var R = 6371; var dLat = (?1 - this.latitude) * Math.PI/180; " +
           "var dLon = (?2 - this.longitude) * Math.PI/180; " +
           "var a = Math.sin(dLat/2)*Math.sin(dLat/2) + " +
           "Math.cos(this.latitude*Math.PI/180)*Math.cos(?1*Math.PI/180)*" +
           "Math.sin(dLon/2)*Math.sin(dLon/2); " +
           "var c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); " +
           "return R*c <= ?0; }' }")
    List<User> findNearbyWriters(double radiusKm, double lat, double lng);

    List<User> findByRoleAndCity(String role, String city);
}
