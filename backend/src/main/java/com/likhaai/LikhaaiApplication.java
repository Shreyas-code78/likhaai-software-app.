package com.likhaai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class LikhaaiApplication {
    public static void main(String[] args) {
        SpringApplication.run(LikhaaiApplication.class, args);
    }
}
