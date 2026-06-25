-- Mentor feature: conversation history per (user, diagram, chapter).
-- BYOK keys NEVER stored server-side — only ciphertext in browser localStorage.

CREATE TABLE mentor_chats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  diagram_id TEXT,                                -- nullable: chat outside diagram context
  chapter_id TEXT,                                -- nullable: free-form chat
  messages TEXT NOT NULL DEFAULT '[]',            -- JSON: [{role, content, ts, tokens?}]
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_mentor_chats_user_diag ON mentor_chats(user_id, diagram_id);
CREATE INDEX idx_mentor_chats_user_chap ON mentor_chats(user_id, chapter_id);
