-- Mentor Phase 3: chapter progress tracking (read/unread + user notes) +
-- AI-generated chapter summary cache.

CREATE TABLE chapter_progress (
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  read_at INTEGER,                      -- nullable: marked unread = NULL
  notes TEXT,                           -- user's personal markdown notes
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE chapter_summary_cache (
  chapter_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,                -- AI-generated ~200 word abstract
  key_concepts TEXT NOT NULL,           -- JSON array string
  related_variants TEXT,                -- JSON array
  generated_at INTEGER NOT NULL
);
