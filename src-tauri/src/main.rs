mod db;

use tauri::Manager;
use serde::{Deserialize, Serialize};
use sqlx::{SqlitePool, Row};
use tauri::State;
use chrono::Utc;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Notification {
    pub id: i64,
    pub title: String,
    pub body: String,
    pub notification_type: String,
    pub related_id: Option<i64>,
    pub related_type: Option<String>,
    pub is_read: bool,
    pub scheduled_for: Option<String>,
    pub created_at: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct NotificationSettings {
    pub loan_days: String,
    pub subscription_days: String,
    pub goal_percent: String,
    pub general_minutes: String,
    pub dnd_enabled: bool,
    pub dnd_start: String,
    pub dnd_end: String,
}

pub struct AppState {
    pub pool: SqlitePool,
}

// ==================== توابع کمکی برای اعتبارسنجی ====================
fn validate_title(title: &str) -> Result<(), String> {
    if title.is_empty() {
        return Err("Title cannot be empty".to_string());
    }
    if title.len() > 255 {
        return Err("Title cannot exceed 255 characters".to_string());
    }
    Ok(())
}

fn validate_body(body: &str) -> Result<(), String> {
    if body.is_empty() {
        return Err("Body cannot be empty".to_string());
    }
    if body.len() > 1000 {
        return Err("Body cannot exceed 1000 characters".to_string());
    }
    Ok(())
}

fn validate_notification_type(notif_type: &str) -> Result<(), String> {
    let valid_types = vec!["general", "loan", "subscription", "goal", "reminder"];
    if !valid_types.contains(&notif_type) {
        return Err(format!("Invalid notification type: {}", notif_type));
    }
    Ok(())
}

fn validate_time_format(time: &str) -> Result<(), String> {
    if time.is_empty() {
        return Ok(());
    }
    let parts: Vec<&str> = time.split(':').collect();
    if parts.len() != 2 {
        return Err("Time must be in HH:MM format".to_string());
    }
    let hours: u32 = parts[0].parse().map_err(|_| "Invalid hour format")?;
    let minutes: u32 = parts[1].parse().map_err(|_| "Invalid minute format")?;
    if hours > 23 || minutes > 59 {
        return Err("Invalid time value".to_string());
    }
    Ok(())
}

fn validate_days(days: &str) -> Result<(), String> {
    if days.is_empty() {
        return Ok(());
    }
    for day in days.split(',') {
        let num: i32 = day.parse().map_err(|_| "Invalid day value")?;
        if num < 0 {
            return Err("Days cannot be negative".to_string());
        }
        if num > 365 {
            return Err("Days cannot exceed 365".to_string());
        }
    }
    Ok(())
}

fn validate_percent(percent: &str) -> Result<(), String> {
    if percent.is_empty() {
        return Ok(());
    }
    for p in percent.split(',') {
        let num: i32 = p.parse().map_err(|_| "Invalid percent value")?;
        if num < 0 || num > 100 {
            return Err("Percent must be between 0 and 100".to_string());
        }
    }
    Ok(())
}

// ==================== Commandها با اعتبارسنجی ====================
#[tauri::command]
async fn get_notifications(state: State<'_, AppState>) -> Result<Vec<Notification>, String> {
    let rows = sqlx::query(
        "SELECT id, title, body, notification_type, related_id, related_type, is_read, scheduled_for, created_at 
         FROM notifications ORDER BY created_at DESC"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    let mut notifications = Vec::new();
    for row in rows {
        notifications.push(Notification {
            id: row.get(0),
            title: row.get(1),
            body: row.get(2),
            notification_type: row.get(3),
            related_id: row.get(4),
            related_type: row.get(5),
            is_read: row.get::<i64, _>(6) == 1,
            scheduled_for: row.get(7),
            created_at: row.get(8),
        });
    }
    Ok(notifications)
}

#[tauri::command]
async fn add_notification(
    state: State<'_, AppState>,
    title: String,
    body: String,
    notification_type: String,
    related_id: Option<i64>,
    related_type: Option<String>,
    scheduled_for: Option<String>,
) -> Result<i64, String> {
    // اعتبارسنجی ورودی‌ها
    validate_title(&title)?;
    validate_body(&body)?;
    validate_notification_type(&notification_type)?;
    
    // اعتبارسنجی time اگر وجود داشته باشد
    if let Some(scheduled) = &scheduled_for {
        validate_time_format(scheduled)?;
    }
    
    let created_at = Utc::now().to_rfc3339();
    let result = sqlx::query(
        "INSERT INTO notifications (title, body, notification_type, related_id, related_type, scheduled_for, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&title)
    .bind(&body)
    .bind(&notification_type)
    .bind(related_id)
    .bind(related_type)
    .bind(scheduled_for)
    .bind(&created_at)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn mark_notification_as_read(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    if id <= 0 {
        return Err("Invalid notification ID".to_string());
    }
    
    let result = sqlx::query("UPDATE notifications SET is_read = 1 WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Notification with ID {} not found", id));
    }
    
    Ok(())
}

#[tauri::command]
async fn delete_notification(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    if id <= 0 {
        return Err("Invalid notification ID".to_string());
    }
    
    let result = sqlx::query("DELETE FROM notifications WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    
    if result.rows_affected() == 0 {
        return Err(format!("Notification with ID {} not found", id));
    }
    
    Ok(())
}

#[tauri::command]
async fn clear_all_notifications(state: State<'_, AppState>) -> Result<(), String> {
    sqlx::query("DELETE FROM notifications")
        .execute(&state.pool)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn get_settings(state: State<'_, AppState>) -> Result<NotificationSettings, String> {
    let row = sqlx::query(
        "SELECT loan_days, subscription_days, goal_percent, general_minutes, dnd_enabled, dnd_start, dnd_end 
         FROM notification_settings WHERE id = 1"
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    Ok(NotificationSettings {
        loan_days: row.get(0),
        subscription_days: row.get(1),
        goal_percent: row.get(2),
        general_minutes: row.get(3),
        dnd_enabled: row.get::<i64, _>(4) == 1,
        dnd_start: row.get(5),
        dnd_end: row.get(6),
    })
}

#[tauri::command]
async fn update_settings(state: State<'_, AppState>, settings: NotificationSettings) -> Result<(), String> {
    // اعتبارسنجی تنظیمات
    validate_days(&settings.loan_days)?;
    validate_days(&settings.subscription_days)?;
    validate_percent(&settings.goal_percent)?;
    validate_days(&settings.general_minutes)?;
    validate_time_format(&settings.dnd_start)?;
    validate_time_format(&settings.dnd_end)?;
    
    sqlx::query(
        "UPDATE notification_settings 
         SET loan_days = ?, subscription_days = ?, goal_percent = ?, general_minutes = ?, 
             dnd_enabled = ?, dnd_start = ?, dnd_end = ? 
         WHERE id = 1"
    )
    .bind(&settings.loan_days)
    .bind(&settings.subscription_days)
    .bind(&settings.goal_percent)
    .bind(&settings.general_minutes)
    .bind(if settings.dnd_enabled { 1 } else { 0 })
    .bind(&settings.dnd_start)
    .bind(&settings.dnd_end)
    .execute(&state.pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let pool = db::init_db(&handle).await.unwrap();
                app.manage(AppState { pool });
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_notifications,
            add_notification,
            mark_notification_as_read,
            delete_notification,
            clear_all_notifications,
            get_settings,
            update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ==================== تابع main ====================
// نقطه ورود برنامه - از crate::run() برای فراخوانی تابع run استفاده می‌کنیم
fn main() {
    crate::run()
}