CREATE TABLE IF NOT EXISTS diploma_certificates (
    id BIGSERIAL PRIMARY KEY,
    diplome_id BIGINT NOT NULL REFERENCES diplomes(id) ON DELETE CASCADE,
    certificate_id BIGINT NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    CONSTRAINT uk_diploma_certificate UNIQUE (diplome_id, certificate_id)
);

CREATE TABLE IF NOT EXISTS user_diplomas (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diplome_id BIGINT NOT NULL REFERENCES diplomes(id) ON DELETE CASCADE,
    claimed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    serial_number TEXT UNIQUE NULL,
    CONSTRAINT uk_user_diploma UNIQUE (user_id, diplome_id)
);

