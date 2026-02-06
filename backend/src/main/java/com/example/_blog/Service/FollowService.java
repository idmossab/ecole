package com.example._blog.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import com.example._blog.Entity.Follow;
import com.example._blog.Entity.User;
import com.example._blog.Repositories.FollowRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class FollowService {
    private final FollowRepo followRepo;
    private final UserRepo userRepo;

    public FollowService(FollowRepo followRepo, UserRepo userRepo) {
        this.followRepo = followRepo;
        this.userRepo = userRepo;
    }

    public void followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            return;
        }
        if (followRepo.existsByFollowerUserIdAndFollowingUserId(followerId, followingId)) {
            return;
        }
        User follower = userRepo.findById(followerId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Follower not found"));
        User following = userRepo.findById(followingId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();
        followRepo.save(follow);
    }

    public void unfollowUser(Long followerId, Long followingId) {
        followRepo.deleteByFollowerUserIdAndFollowingUserId(followerId, followingId);
    }

    public List<Long> getFollowingIds(Long followerId) {
        return followRepo.findByFollowerUserId(followerId)
                .stream()
                .map(follow -> follow.getFollowing().getUserId())
                .toList();
    }
}
