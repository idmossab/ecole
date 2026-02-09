package com.example._blog.Controller;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
    public List<NotificationResponse> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.getNotifications(requireUser(principal));
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        long unread = notificationService.getUnreadCount(requireUser(principal));
        return new UnreadCountResponse(unread);
    }

    @PostMapping("/{id}/read")
    public NotificationResponse markRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return notificationService.markAsRead(requireUser(principal), id);
    }

    private com.example._blog.Entity.User requireUser(UserPrincipal principal) {
        if (principal == null || principal.getUser() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Unauthorized");
        }
        return principal.getUser();
    }

    public record UnreadCountResponse(long unreadCount) {}
}
