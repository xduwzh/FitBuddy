package io.github.xduwzh.fitbuddy.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import io.github.xduwzh.fitbuddy.entity.User;
import io.github.xduwzh.fitbuddy.service.UserService; 

@RestController
@RequestMapping
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        return userService.authenticate(body.getEmail(), body.getPassword())
            .<ResponseEntity<?>>map(user -> ResponseEntity.ok(new LoginResponse(user.getId(), user.getEmail(), user.getUsername())))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password"));
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private Long id;
        private String email;
        private String username;

        public LoginResponse(Long id, String email, String username) {
            this.id = id;
            this.email = email;
            this.username = username;
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getUsername() { return username; }
    }
}
