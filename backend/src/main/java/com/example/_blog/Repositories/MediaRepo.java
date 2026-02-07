package com.example._blog.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Media;

@Repository
public interface MediaRepo extends JpaRepository<Media, Long> {
    List<Media> findByBlogIdBlog(Long blogId);
    Media findFirstByBlogIdBlogOrderByIdAsc(Long blogId);
    List<Media> findByCourseId(Long courseId);

    @Query("select count(m) from Media m where m.course.certificate.id = :certificateId")
    long countByCertificateId(@Param("certificateId") Long certificateId);

    @Query("select m.course.certificate.id from Media m where m.id = :videoId")
    Optional<Long> findCertificateIdByVideoId(@Param("videoId") Long videoId);
}
