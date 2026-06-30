use tauri::Manager;  // این خط را اضافه کنید
use sqlx::SqlitePool;

pub async fn init_db(app_handle: &tauri::AppHandle) -> Result<SqlitePool, String> {
    // مسیر دیتابیس در فضای اپلیکیشن
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

    let db_path = app_dir.join("masterline.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

    // اتصال مستقیم به SQLite
    let pool = SqlitePool::connect(&db_url)
        .await
        .map_err(|e| e.to_string())?;

    // ایجاد جدول‌ها (اگر وجود نداشته باشند)
    sqlx::query(
        r#"
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
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query(
        r#"
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
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // مقدار پیش‌فرض برای تنظیمات
    sqlx::query(
        "INSERT OR IGNORE INTO notification_settings (id) VALUES (1)"
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(pool)
}