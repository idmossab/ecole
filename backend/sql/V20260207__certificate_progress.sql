CREATE TABLE IF NOT EXISTS user_video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    watched BOOLEAN NOT NULL DEFAULT FALSE,
    watched_at TIMESTAMP NULL,
    CONSTRAINT uk_user_video_progress_user_video UNIQUE (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS user_certificates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certificate_id BIGINT NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    serial_number TEXT UNIQUE NULL,
    CONSTRAINT uk_user_certificates_user_certificate UNIQUE (user_id, certificate_id)
);

