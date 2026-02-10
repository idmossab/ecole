package com.example._blog.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.UserRole;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User findByUserName(String userName);
    User findByEmail(String email);

    boolean existsByUserName(String userName);
    boolean existsByEmail(String email);

    long countByRole(UserRole role);
    Optional<User> findFirstByRoleOrderByUserIdAsc(UserRole role);

    @Query("""
            select u from User u
            where u.role = com.example._blog.Entity.enums.UserRole.USER
              and (
                lower(concat(u.firstName, ' ', u.lastName)) like lower(concat('%', :q, '%'))
                or lower(u.userName) like lower(concat('%', :q, '%'))
                or lower(u.email) like lower(concat('%', :q, '%'))
              )
            order by u.createdAt desc
            """)
    List<User> searchStudents(@Param("q") String q);
}
