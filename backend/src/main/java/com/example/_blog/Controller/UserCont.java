package com.example._blog.Controller;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.AuthResponse;
import com.example._blog.Dto.UserLoginRequest;
import com.example._blog.Dto.UserProfileUpdateRequest;
import com.example._blog.Dto.UserRegisterRequest;
import com.example._blog.Dto.UserResponse;
import com.example._blog.Dto.UserIssuedStatsResponse;
import com.example._blog.Security.UserPrincipal;
import com.example._blog.Service.UserService;

import jakarta.validation.Valid;

@RestController
public class UserCont {
    private final UserService userService;

    public UserCont(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/users/register")
    public AuthResponse register(@Valid @RequestBody UserRegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/users/login")
    public AuthResponse login(@Valid @RequestBody UserLoginRequest request) {
        return userService.login(request);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAll();
    }

    @GetMapping("/users/{userId}")
    public UserResponse getUserById(@PathVariable Long userId) {
        return userService.getById(userId);
    }

    @PutMapping("/users/{userId}")
    public UserResponse updateUser(@PathVariable Long userId, @Valid @RequestBody UserRegisterRequest request) {
        return userService.update(userId, request);
    }

    @DeleteMapping("/users/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        userService.delete(userId);
    }

    @GetMapping("/api/users/me")
    public UserResponse getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getUser() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Unauthorized");
        }
        return userService.getById(principal.getUser().getUserId());
    }

    @PutMapping("/api/users/me")
    public UserResponse updateMe(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        if (principal == null || principal.getUser() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Unauthorized");
        }
        return userService.updateProfile(principal.getUser().getUserId(), request);
    }

    @GetMapping("/api/users/me/issued-stats")
    public UserIssuedStatsResponse getMyIssuedStats(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getUser() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Unauthorized");
        }
        return userService.getIssuedStats(principal.getUser().getUserId());
    }
}
