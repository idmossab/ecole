package com.example._blog.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import com.example._blog.Entity.Blog;
import com.example._blog.Entity.Media;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.BlogStatus;
import com.example._blog.Entity.enums.MediaType;
import com.example._blog.Repositories.BlogRepo;
import com.example._blog.Repositories.FollowRepo;
import com.example._blog.Repositories.MediaRepo;
import com.example._blog.Repositories.UserRepo;

@Service
public class BlogService {
    private static final long MAX_TOTAL_MEDIA_SIZE = 10L * 1024 * 1024;
    private static final Path UPLOAD_DIR = Paths.get("uploads");

    private final BlogRepo blogRepo;
    private final UserRepo userRepo;
    private final MediaRepo mediaRepo;
    private final FollowRepo followRepo;

    public BlogService(BlogRepo blogRepo, UserRepo userRepo, MediaRepo mediaRepo, FollowRepo followRepo) {
        this.blogRepo = blogRepo;
        this.userRepo = userRepo;
        this.mediaRepo = mediaRepo;
        this.followRepo = followRepo;
    }

    public Page<Blog> getFeed(Long userId, int page, int size) {
        List<Long> ids = new ArrayList<>();
        ids.add(userId);
        followRepo.findByFollowerUserId(userId)
                .forEach(follow -> ids.add(follow.getFollowing().getUserId()));
        return blogRepo.findByUserUserIdInOrderByCreatedAtDesc(ids, PageRequest.of(page, size));
    }

    public Blog createWithMedia(Long userId, String title, String content, BlogStatus status, List<MultipartFile> files) {
        long totalSize = files.stream().mapToLong(MultipartFile::getSize).sum();
        if (totalSize > MAX_TOTAL_MEDIA_SIZE) {
            throw new ResponseStatusException(BAD_REQUEST, "Total media size exceeds 10MB");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        Blog blog = Blog.builder()
                .title(title)
                .content(content)
                .status(status == null ? BlogStatus.ACTIVE : status)
                .user(user)
                .createdAt(Instant.now())
                .build();
        Blog saved = blogRepo.save(blog);

        if (!files.isEmpty()) {
            ensureUploadDir();
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String filename = UUID.randomUUID() + "-" + sanitizeFilename(file.getOriginalFilename());
            Path target = UPLOAD_DIR.resolve(filename);
            try {
                Files.copy(file.getInputStream(), target);
            } catch (IOException ex) {
                throw new ResponseStatusException(BAD_REQUEST, "Failed to store media");
            }
            String url = "/uploads/" + filename;
            Media media = Media.builder()
                    .blog(saved)
                    .url(url)
                    .type(guessMediaType(file.getContentType()))
                    .build();
            mediaRepo.save(media);
        }

        return saved;
    }

    private void ensureUploadDir() {
        try {
            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }
        } catch (IOException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Failed to create upload directory");
        }
    }

    private String sanitizeFilename(String name) {
        if (name == null || name.isBlank()) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private MediaType guessMediaType(String contentType) {
        if (contentType == null) return MediaType.FILE;
        if (contentType.startsWith("video")) return MediaType.VIDEO;
        if (contentType.startsWith("image")) return MediaType.IMAGE;
        if (contentType.startsWith("audio")) return MediaType.AUDIO;
        return MediaType.FILE;
    }
}
