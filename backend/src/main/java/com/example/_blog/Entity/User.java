package com.example._blog.Entity;

import java.time.Instant;

import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Entity.enums.UserStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long userId;
    @Column(nullable = false, name = "first_name")
    private String firstName;
    @Column(nullable = false, name = "last_name")
    private String lastName;
    @Column(nullable = false, unique = true, name = "username")
    private String userName;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false, name = "password_hash")
    private String password;
    private String city;
    private String phone;
    //private String bio;
    //private String avatar;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.USER;
    @Builder.Default
    @Column(name = "created_at")
    private Instant createdAt=Instant.now();

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "users_specialites",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "specialite_id")
    )
    private Set<Specialite> specialites = new HashSet<>();
}
