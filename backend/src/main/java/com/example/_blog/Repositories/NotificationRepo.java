package com.example._blog.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Notification;
import com.example._blog.Entity.enums.UserRole;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
    @Query("""
            select n from Notification n
            where (n.recipientUser.userId = :userId)
               or (n.recipientRole = :role)
            order by n.createdAt desc
            """)
    List<Notification> findAllForUser(@Param("userId") Long userId, @Param("role") UserRole role);

    @Query("""
            select count(n) from Notification n
            where n.read = false
              and ((n.recipientUser.userId = :userId) or (n.recipientRole = :role))
            """)
    long countUnreadForUser(@Param("userId") Long userId, @Param("role") UserRole role);

    @Query("""
            select n from Notification n
            where n.id = :id and ((n.recipientUser.userId = :userId) or (n.recipientRole = :role))
            """)
    Optional<Notification> findVisibleForUser(@Param("id") Long id, @Param("userId") Long userId, @Param("role") UserRole role);
}

