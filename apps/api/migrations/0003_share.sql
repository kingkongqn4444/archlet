CREATE TABLE share_tokens (
  token TEXT PRIMARY KEY,
  diagram_id TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER
);
CREATE INDEX idx_share_diagram ON share_tokens(diagram_id);

ALTER TABLE diagrams ADD COLUMN public_embed INTEGER NOT NULL DEFAULT 0;
