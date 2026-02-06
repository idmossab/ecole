package com.example._blog.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.Course;

@Repository
public interface CourseRepo extends JpaRepository<Course, Long> {
    List<Course> findByCertificateId(Long certificateId);
}
