package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example._blog.Dto.NotificationResponse;
import com.example._blog.Security.UserPrincipal;
import com.example._blog.Service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationCont {
    private final NotificationService notificationService;

    public NotificationCont(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getNotifications(principal.getUser()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        long count = notificationService.getUnreadCount(principal.getUser());
        return ResponseEntity.ok(new UnreadCountResponse(count));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(principal.getUser(), id));
    }

    public record UnreadCountResponse(long unreadCount) {}
}

