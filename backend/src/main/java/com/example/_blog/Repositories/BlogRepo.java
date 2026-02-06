package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Blog;

@Repository
public interface BlogRepo extends JpaRepository<Blog, Long> {
    Page<Blog> findByUserUserIdInOrderByCreatedAtDesc(List<Long> userIds, Pageable pageable);
    Page<Blog> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Blog> findByUserUserId(Long userId);
}
