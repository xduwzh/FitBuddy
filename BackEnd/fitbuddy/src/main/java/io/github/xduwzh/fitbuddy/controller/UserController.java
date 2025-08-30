package io.github.xduwzh.fitbuddy.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
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
    public String login(@RequestParam String email, @RequestParam String password) {
        boolean success = userService.login(email, password);
        return success ? "Login successful" : "Invalid email or password";
    }
}
