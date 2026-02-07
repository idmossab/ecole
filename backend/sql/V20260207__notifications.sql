CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_role VARCHAR(32) NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_role_created
    ON notifications(recipient_role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications(recipient_user_id, created_at DESC);

