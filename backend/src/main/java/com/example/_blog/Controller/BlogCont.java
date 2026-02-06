package com.example._blog.Controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example._blog.Entity.Blog;
import com.example._blog.Entity.enums.BlogStatus;
import com.example._blog.Service.BlogService;

@RestController
@RequestMapping("/blogs")
public class BlogCont {
    private final BlogService blogService;

    public BlogCont(BlogService blogService) {
        this.blogService = blogService;
    }

    @PostMapping(value = "/with-media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Blog> createWithMedia(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) BlogStatus status,
            @RequestParam(required = false, name = "files") List<MultipartFile> files
    ) {
        List<MultipartFile> safeFiles = files == null ? List.of() : files;
        Blog created = blogService.createWithMedia(userId, title, content, status, safeFiles);
        return ResponseEntity.ok(created);
    }
}
