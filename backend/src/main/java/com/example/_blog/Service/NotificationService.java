package com.example._blog.Service;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example._blog.Dto.NotificationResponse;
import com.example._blog.Entity.Notification;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Repositories.NotificationRepo;

@Service
public class NotificationService {
    private final NotificationRepo notificationRepo;

    public NotificationService(NotificationRepo notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    public void notifyRole(UserRole role, String title, String message, String type) {
        Notification notification = Notification.builder()
                .recipientRole(role)
                .title(title)
                .message(message)
                .type(type)
                .build();
        notificationRepo.save(notification);
    }

    public void notifyUser(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .recipientUser(user)
                .title(title)
                .message(message)
                .type(type)
                .build();
        notificationRepo.save(notification);
    }

    public List<NotificationResponse> getNotifications(User user) {
        return notificationRepo.findAllForUser(user.getUserId(), user.getRole()).stream()
                .limit(30)
                .map(this::toDto)
                .toList();
    }

    public long getUnreadCount(User user) {
        return notificationRepo.countUnreadForUser(user.getUserId(), user.getRole());
    }

    public NotificationResponse markAsRead(User user, Long id) {
        Notification notification = notificationRepo.findVisibleForUser(id, user.getUserId(), user.getRole())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Notification not found"));
        notification.setRead(true);
        return toDto(notificationRepo.save(notification));
    }

    private NotificationResponse toDto(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}

