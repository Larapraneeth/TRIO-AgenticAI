import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path

DB_PATH = Path("./memory/devos.db")

def get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL DEFAULT 'New Chat',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            agents_used TEXT DEFAULT '[]',
            agent_statuses TEXT DEFAULT '[]',
            intent TEXT DEFAULT '',
            execution_steps TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_conv_updated ON conversations(updated_at DESC);
    """)
    conn.commit()
    conn.close()

def create_conversation(title: str = "New Chat") -> dict:
    conn = get_conn()
    now = datetime.utcnow().isoformat()
    cid = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
        (cid, title, now, now)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM conversations WHERE id = ?", (cid,)).fetchone()
    conn.close()
    return dict(row)

def get_conversations() -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 100"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_conversation(cid: str) -> dict | None:
    conn = get_conn()
    row = conn.execute("SELECT * FROM conversations WHERE id = ?", (cid,)).fetchone()
    conn.close()
    return dict(row) if row else None

def update_conversation_title(cid: str, title: str):
    conn = get_conn()
    now = datetime.utcnow().isoformat()
    conn.execute(
        "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?",
        (title, now, cid)
    )
    conn.commit()
    conn.close()

def touch_conversation(cid: str):
    conn = get_conn()
    now = datetime.utcnow().isoformat()
    conn.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, cid))
    conn.commit()
    conn.close()

def delete_conversation(cid: str):
    conn = get_conn()
    conn.execute("DELETE FROM conversations WHERE id = ?", (cid,))
    conn.commit()
    conn.close()

def add_message(conversation_id: str, role: str, content: str,
                agents_used: list = [], agent_statuses: list = [],
                intent: str = "", execution_steps: list = []) -> dict:
    conn = get_conn()
    now = datetime.utcnow().isoformat()
    mid = str(uuid.uuid4())
    conn.execute(
        """INSERT INTO messages
           (id, conversation_id, role, content, agents_used, agent_statuses, intent, execution_steps, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (mid, conversation_id, role, content,
         json.dumps(agents_used), json.dumps(agent_statuses),
         intent, json.dumps(execution_steps), now)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM messages WHERE id = ?", (mid,)).fetchone()
    conn.close()
    touch_conversation(conversation_id)
    return _parse_message(dict(row))

def get_messages(conversation_id: str) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        (conversation_id,)
    ).fetchall()
    conn.close()
    return [_parse_message(dict(r)) for r in rows]

def _parse_message(row: dict) -> dict:
    for field in ["agents_used", "agent_statuses", "execution_steps"]:
        try:
            row[field] = json.loads(row.get(field) or "[]")
        except Exception:
            row[field] = []
    return row

init_db()
