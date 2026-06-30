-- migration 1_initial.sql
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    related_id INTEGER,
    related_type TEXT,
    is_read INTEGER DEFAULT 0,
    scheduled_for TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_days TEXT DEFAULT '3,1,0',
    subscription_days TEXT DEFAULT '7,3,0',
    goal_percent TEXT DEFAULT '25,50,75,100',
    general_minutes TEXT DEFAULT '60,30,0',
    dnd_enabled INTEGER DEFAULT 0,
    dnd_start TEXT DEFAULT '23:00',
    dnd_end TEXT DEFAULT '08:00'
);

INSERT OR IGNORE INTO notification_settings (id) VALUES (1);