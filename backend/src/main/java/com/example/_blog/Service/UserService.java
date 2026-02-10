package com.example._blog.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

import java.util.List;

import com.example._blog.Dto.AuthResponse;
import com.example._blog.Dto.UserLoginRequest;
import com.example._blog.Dto.UserRegisterRequest;
import com.example._blog.Dto.UserResponse;
import com.example._blog.Entity.User;
import com.example._blog.Entity.enums.UserRole;
import com.example._blog.Entity.enums.UserStatus;
import com.example._blog.Repositories.DiplomaJoinRequestRepo;
import com.example._blog.Repositories.JoinRequestRepo;
import com.example._blog.Repositories.IssuedCredentialRepo;
import com.example._blog.Repositories.UserRepo;
import com.example._blog.Security.JwtService;

@Service
public class UserService {
    private final UserRepo repo;
    private final JoinRequestRepo joinRequestRepo;
    private final DiplomaJoinRequestRepo diplomaJoinRequestRepo;
    private final IssuedCredentialRepo issuedCredentialRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    public UserService(
            UserRepo repo,
            JoinRequestRepo joinRequestRepo,
            DiplomaJoinRequestRepo diplomaJoinRequestRepo,
            IssuedCredentialRepo issuedCredentialRepo,
            PasswordEncoder encoder,
            JwtService jwtService
    ) {
        this.repo = repo;
        this.joinRequestRepo = joinRequestRepo;
        this.diplomaJoinRequestRepo = diplomaJoinRequestRepo;
        this.issuedCredentialRepo = issuedCredentialRepo;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    // REGISTER
    public AuthResponse register(UserRegisterRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw new ResponseStatusException(CONFLICT, "Email already used");
        }
        if (repo.existsByUserName(req.userName())) {
            throw new ResponseStatusException(CONFLICT, "Username already used");
        }

        boolean isFirstUser = repo.count() == 0;
        User user = User.builder()
                .firstName(req.firstName())
                .lastName(req.lastName())
                .userName(req.userName())
                .email(req.email())
                .password(encoder.encode(req.password()))
                .role(isFirstUser ? UserRole.ADMIN : UserRole.USER)
                .build();

        // INSERT
        User saved = repo.save(user);
        return new AuthResponse(jwtService.generateToken(saved), toResponse(saved));
    }

    // LOGIN (email OR username)
    public AuthResponse login(UserLoginRequest req) {
        User u = repo.findByEmail(req.emailOrUsername());
        if (u == null) {
            u = repo.findByUserName(req.emailOrUsername());
        }
        if (u == null) {
            throw new ResponseStatusException(NOT_FOUND, "User not found");
        }

        if (!encoder.matches(req.password(), u.getPassword())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Wrong password");
        }

        return new AuthResponse(jwtService.generateToken(u), toResponse(u));
    }

    public List<UserResponse> getAll() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse getById(Long userId) {
        return toResponse(repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found")));
    }

    public UserResponse update(Long userId, UserRegisterRequest req) {
        User existing = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (!existing.getEmail().equals(req.email()) && repo.existsByEmail(req.email())) {
            throw new ResponseStatusException(CONFLICT, "Email already used");
        }
        if (!existing.getUserName().equals(req.userName()) && repo.existsByUserName(req.userName())) {
            throw new ResponseStatusException(CONFLICT, "Username already used");
        }

        existing.setFirstName(req.firstName());
        existing.setLastName(req.lastName());
        existing.setUserName(req.userName());
        existing.setEmail(req.email());
        existing.setPassword(encoder.encode(req.password()));

        return toResponse(repo.save(existing));
    }

    public void delete(Long userId) {
        User existing = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        joinRequestRepo.deleteByUserId(userId);
        diplomaJoinRequestRepo.deleteByUserId(userId);
        issuedCredentialRepo.deleteByUserId(userId);
        repo.delete(existing);
    }

    public UserResponse changeRole(Long actorUserId, Long userId, String roleValue) {
        User actor = repo.findById(actorUserId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Actor user not found"));
        User existing = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        enforceAdminManagementRules(actor, existing);

        UserRole role;
        try {
            role = UserRole.valueOf(roleValue.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid role");
        }

        existing.setRole(role);
        return toResponse(repo.save(existing));
    }

    public UserResponse toggleActiveBanned(Long actorUserId, Long userId) {
        User actor = repo.findById(actorUserId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Actor user not found"));
        User existing = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        enforceAdminManagementRules(actor, existing);
        UserStatus next = existing.getStatus() == UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;
        existing.setStatus(next);
        return toResponse(repo.save(existing));
    }

    public void deleteAdminManaged(Long actorUserId, Long userId) {
        User actor = repo.findById(actorUserId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Actor user not found"));
        User existing = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        enforceAdminManagementRules(actor, existing);
        joinRequestRepo.deleteByUserId(userId);
        diplomaJoinRequestRepo.deleteByUserId(userId);
        issuedCredentialRepo.deleteByUserId(userId);
        repo.delete(existing);
    }

    private void enforceAdminManagementRules(User actor, User target) {
        User superAdmin = repo.findFirstByRoleOrderByUserIdAsc(UserRole.ADMIN)
                .orElse(null);
        Long superAdminId = superAdmin == null ? null : superAdmin.getUserId();
        boolean actorIsSuperAdmin = superAdminId != null && superAdminId.equals(actor.getUserId());
        boolean targetIsSuperAdmin = superAdminId != null && superAdminId.equals(target.getUserId());

        if (targetIsSuperAdmin) {
            throw new ResponseStatusException(FORBIDDEN, "Super admin account cannot be modified");
        }

        if (target.getRole() == UserRole.ADMIN && !actorIsSuperAdmin) {
            throw new ResponseStatusException(FORBIDDEN, "Only super admin can manage other admin accounts");
        }
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUserName(),
                user.getEmail(),
                user.getPhone(),
                user.getCity(),
                user.getStatus(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
