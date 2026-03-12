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
import com.example._blog.Dto.UserProfileUpdateRequest;
import com.example._blog.Dto.UserRegisterRequest;
import com.example._blog.Dto.UserResponse;
import com.example._blog.Dto.UserIssuedStatsResponse;
import com.example._blog.Entity.User;
import com.example._blog.Entity.IssuedCredential;
import com.example._blog.Entity.enums.IssueType;
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
    private final NotificationService notificationService;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    public UserService(
            UserRepo repo,
            JoinRequestRepo joinRequestRepo,
            DiplomaJoinRequestRepo diplomaJoinRequestRepo,
            IssuedCredentialRepo issuedCredentialRepo,
            NotificationService notificationService,
            PasswordEncoder encoder,
            JwtService jwtService
    ) {
        this.repo = repo;
        this.joinRequestRepo = joinRequestRepo;
        this.diplomaJoinRequestRepo = diplomaJoinRequestRepo;
        this.issuedCredentialRepo = issuedCredentialRepo;
        this.notificationService = notificationService;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    // REGISTER
    public AuthResponse register(UserRegisterRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw new ResponseStatusException(CONFLICT, "Email already used");
        }
        String requestedUserName = req.userName() == null ? "" : req.userName().trim();
        String userName = requestedUserName.isEmpty()
                ? generateUniqueUserName(req.email())
                : requestedUserName;
        if (repo.existsByUserName(userName)) {
            throw new ResponseStatusException(CONFLICT, "Username already used");
        }

        boolean isFirstUser = repo.count() == 0;
        User user = User.builder()
                .firstName(req.firstName())
                .lastName(req.lastName())
                .userName(userName)
                .email(req.email())
                .password(encoder.encode(req.password()))
                .phone(req.phone() == null ? null : req.phone().trim())
                .city(req.city() == null ? null : req.city().trim())
                .role(isFirstUser ? UserRole.ADMIN : UserRole.USER)
                .build();

        // INSERT
        User saved = repo.save(user);

        notificationService.notifyRole(
                UserRole.ADMIN,
                "New User Registration",
                "New user registered: " + saved.getUserName() + " (" + saved.getEmail() + ")",
                "USER_REGISTERED"
        );

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
        String requestedUserName = req.userName() == null ? "" : req.userName().trim();
        String nextUserName = requestedUserName.isEmpty() ? existing.getUserName() : requestedUserName;
        if (!existing.getUserName().equals(nextUserName) && repo.existsByUserName(nextUserName)) {
            throw new ResponseStatusException(CONFLICT, "Username already used");
        }

        existing.setFirstName(req.firstName());
        existing.setLastName(req.lastName());
        existing.setUserName(nextUserName);
        existing.setEmail(req.email());
        existing.setPassword(encoder.encode(req.password()));
        existing.setPhone(req.phone() == null ? null : req.phone().trim());
        existing.setCity(req.city() == null ? null : req.city().trim());

        return toResponse(repo.save(existing));
    }

    private String generateUniqueUserName(String email) {
        String base = (email == null ? "user" : email.split("@")[0]).replaceAll("[^a-zA-Z0-9_]", "");
        if (base.isBlank()) {
            base = "user";
        }
        String candidate = base;
        int counter = 1;
        while (repo.existsByUserName(candidate)) {
            candidate = base + counter;
            counter++;
        }
        return candidate;
    }

    public UserResponse updateProfile(Long userId, UserProfileUpdateRequest req) {
        User existing = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        String nextEmail = req.email().trim();
        String nextUserName = req.userName().trim();

        if (!existing.getEmail().equalsIgnoreCase(nextEmail) && repo.existsByEmail(nextEmail)) {
            throw new ResponseStatusException(CONFLICT, "Email already used");
        }
        if (!existing.getUserName().equalsIgnoreCase(nextUserName) && repo.existsByUserName(nextUserName)) {
            throw new ResponseStatusException(CONFLICT, "Username already used");
        }

        existing.setFirstName(req.firstName().trim());
        existing.setLastName(req.lastName().trim());
        existing.setUserName(nextUserName);
        existing.setEmail(nextEmail);
        existing.setCity(req.city() == null ? null : req.city().trim());
        existing.setPhone(req.phone() == null ? null : req.phone().trim());

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

    public UserIssuedStatsResponse getIssuedStats(Long userId) {
        long issuedCertificates = issuedCredentialRepo.countByUserIdAndType(userId, IssueType.CERTIFICATE);
        long issuedDiplomas = issuedCredentialRepo.countByUserIdAndType(userId, IssueType.DIPLOMA);
        IssuedCredential latest = issuedCredentialRepo.findTop1ByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        return new UserIssuedStatsResponse(
                issuedCertificates,
                issuedDiplomas,
                latest == null ? null : latest.getIssueDate()
        );
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
