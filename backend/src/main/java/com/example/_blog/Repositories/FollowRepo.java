package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Follow;

@Repository
public interface FollowRepo extends JpaRepository<Follow, Long> {
    boolean existsByFollowerUserIdAndFollowingUserId(Long followerId, Long followingId);
    List<Follow> findByFollowerUserId(Long followerId);
    void deleteByFollowerUserIdAndFollowingUserId(Long followerId, Long followingId);
    long countByFollowerUserId(Long followerId);
    long countByFollowingUserId(Long followingId);
}
