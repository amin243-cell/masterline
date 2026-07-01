#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

use tauri::Manager;
use serde::{Deserialize, Serialize};
use sqlx::{SqlitePool, Row};
use chrono::Utc;

// ==================== Structها ====================
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

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Account {
    pub id: i64,
    pub name: String,
    pub balance: f64,
    pub currency: String,
    pub category: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Asset {
    pub id: i64,
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub category: String,
    pub buy_price: f64,
    pub current_price: f64,
    pub buy_date: String,
    pub note: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Activity {
    pub id: i64,
    pub r#type: String,
    pub account_id: i64,
    pub amount: f64,
    pub date: String,
    pub description: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Goal {
    pub id: i64,
    pub title: String,
    pub r#type: String,
    pub target_amount: f64,
    pub current_amount: f64,
    pub deadline: String,
    pub priority: String,
    pub note: Option<String>,
    pub repeat: String,
    pub last_reset: Option<String>,
    pub created_at: String,
    pub status: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Loan {
    pub id: i64,
    pub name: String,
    pub bank_name: String,
    pub total_amount: f64,
    pub remaining_amount: f64,
    pub interest_rate: f64,
    pub monthly_payment: f64,
    pub start_date: String,
    pub end_date: String,
    pub total_installments: i64,
    pub paid_installments: i64,
    pub status: String,
    pub note: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Debt {
    pub id: i64,
    pub name: String,
    pub person_name: String,
    pub total_amount: f64,
    pub remaining_amount: f64,
    pub start_date: String,
    pub due_date: String,
    pub status: String,
    pub note: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Subscription {
    pub id: i64,
    pub name: String,
    pub provider: String,
    pub amount: f64,
    pub currency: String,
    pub cycle: String,
    pub start_date: String,
    pub next_renewal: String,
    pub status: String,
    pub note: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Reminder {
    pub id: i64,
    pub title: String,
    pub date: String,
    pub time: String,
    pub category: String,
    pub note: Option<String>,
}

pub struct AppState {
    pub pool: SqlitePool,
}

// ==================== Commandها ====================
#[tauri::command]
fn ping() -> String {
    "pong".to_string()
}

#[tauri::command]
async fn get_notifications(state: tauri::State<'_, AppState>) -> Result<Vec<Notification>, String> {
    let rows = sqlx::query(
        "SELECT id, title, body, notification_type, related_id, related_type, is_read, scheduled_for, created_at 
         FROM notifications ORDER BY created_at DESC"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

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
    state: tauri::State<'_, AppState>,
    title: String,
    body: String,
    notification_type: String,
    related_id: Option<i64>,
    related_type: Option<String>,
    scheduled_for: Option<String>,
) -> Result<i64, String> {
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
    .map_err(|e| e.to_string())?;

    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn mark_notification_as_read(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("UPDATE notifications SET is_read = 1 WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_notification(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM notifications WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn clear_all_notifications(state: tauri::State<'_, AppState>) -> Result<(), String> {
    sqlx::query("DELETE FROM notifications")
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_settings(state: tauri::State<'_, AppState>) -> Result<NotificationSettings, String> {
    let row = sqlx::query(
        "SELECT loan_days, subscription_days, goal_percent, general_minutes, dnd_enabled, dnd_start, dnd_end 
         FROM notification_settings WHERE id = 1"
    )
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

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
async fn update_settings(state: tauri::State<'_, AppState>, settings: NotificationSettings) -> Result<(), String> {
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
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Accounts ----------
#[tauri::command]
async fn get_accounts(state: tauri::State<'_, AppState>) -> Result<Vec<Account>, String> {
    let rows = sqlx::query(
        "SELECT id, name, balance, currency, category FROM accounts ORDER BY id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut accounts = Vec::new();
    for row in rows {
        accounts.push(Account {
            id: row.get(0),
            name: row.get(1),
            balance: row.get(2),
            currency: row.get(3),
            category: row.get(4),
        });
    }
    Ok(accounts)
}

#[tauri::command]
async fn add_account(
    state: tauri::State<'_, AppState>,
    name: String,
    balance: f64,
    currency: String,
    category: String,
) -> Result<i64, String> {
    let result = sqlx::query(
        "INSERT INTO accounts (name, balance, currency, category) VALUES (?, ?, ?, ?)"
    )
    .bind(&name)
    .bind(balance)
    .bind(&currency)
    .bind(&category)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_account(
    state: tauri::State<'_, AppState>,
    id: i64,
    name: String,
    balance: f64,
    currency: String,
    category: String,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE accounts SET name = ?, balance = ?, currency = ?, category = ? WHERE id = ?"
    )
    .bind(&name)
    .bind(balance)
    .bind(&currency)
    .bind(&category)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_account(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM accounts WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Assets ----------
#[tauri::command]
async fn get_assets(state: tauri::State<'_, AppState>) -> Result<Vec<Asset>, String> {
    let rows = sqlx::query(
        "SELECT id, name, amount, unit, category, buy_price, current_price, buy_date, note FROM assets ORDER BY id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut assets = Vec::new();
    for row in rows {
        assets.push(Asset {
            id: row.get(0),
            name: row.get(1),
            amount: row.get(2),
            unit: row.get(3),
            category: row.get(4),
            buy_price: row.get(5),
            current_price: row.get(6),
            buy_date: row.get(7),
            note: row.get(8),
        });
    }
    Ok(assets)
}

#[tauri::command]
async fn add_asset(
    state: tauri::State<'_, AppState>,
    name: String,
    amount: f64,
    unit: String,
    category: String,
    buy_price: f64,
    current_price: f64,
    buy_date: String,
    note: Option<String>,
) -> Result<i64, String> {
    let result = sqlx::query(
        "INSERT INTO assets (name, amount, unit, category, buy_price, current_price, buy_date, note) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&name)
    .bind(amount)
    .bind(&unit)
    .bind(&category)
    .bind(buy_price)
    .bind(current_price)
    .bind(&buy_date)
    .bind(note)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_asset(
    state: tauri::State<'_, AppState>,
    id: i64,
    current_price: f64,
) -> Result<(), String> {
    sqlx::query("UPDATE assets SET current_price = ? WHERE id = ?")
        .bind(current_price)
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_asset(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM assets WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Activities (CRUD کامل) ----------
#[tauri::command]
async fn get_activities(state: tauri::State<'_, AppState>) -> Result<Vec<Activity>, String> {
    let rows = sqlx::query(
        "SELECT id, type, account_id, amount, date, description FROM activities ORDER BY date DESC"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut activities = Vec::new();
    for row in rows {
        activities.push(Activity {
            id: row.get(0),
            r#type: row.get(1),
            account_id: row.get(2),
            amount: row.get(3),
            date: row.get(4),
            description: row.get(5),
        });
    }
    Ok(activities)
}

#[tauri::command]
async fn add_activity(
    state: tauri::State<'_, AppState>,
    r#type: String,
    account_id: i64,
    amount: f64,
    date: String,
    description: Option<String>,
) -> Result<i64, String> {
    let result = sqlx::query(
        "INSERT INTO activities (type, account_id, amount, date, description) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&r#type)
    .bind(account_id)
    .bind(amount)
    .bind(&date)
    .bind(description)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_activity(
    state: tauri::State<'_, AppState>,
    id: i64,
    r#type: String,
    account_id: i64,
    amount: f64,
    date: String,
    description: Option<String>,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE activities SET type = ?, account_id = ?, amount = ?, date = ?, description = ? WHERE id = ?"
    )
    .bind(&r#type)
    .bind(account_id)
    .bind(amount)
    .bind(&date)
    .bind(description)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_activity(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM activities WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Goals (CRUD کامل) ----------
#[tauri::command]
async fn get_goals(state: tauri::State<'_, AppState>) -> Result<Vec<Goal>, String> {
    let rows = sqlx::query(
        "SELECT id, title, type, target_amount, current_amount, deadline, priority, note, repeat, last_reset, created_at, status 
         FROM goals ORDER BY id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut goals = Vec::new();
    for row in rows {
        goals.push(Goal {
            id: row.get(0),
            title: row.get(1),
            r#type: row.get(2),
            target_amount: row.get(3),
            current_amount: row.get(4),
            deadline: row.get(5),
            priority: row.get(6),
            note: row.get(7),
            repeat: row.get(8),
            last_reset: row.get(9),
            created_at: row.get(10),
            status: row.get(11),
        });
    }
    Ok(goals)
}

#[tauri::command]
async fn add_goal(
    state: tauri::State<'_, AppState>,
    title: String,
    r#type: String,
    target_amount: f64,
    current_amount: f64,
    deadline: String,
    priority: String,
    note: Option<String>,
    repeat: String,
) -> Result<i64, String> {
    let status = if current_amount >= target_amount { "completed" } else { "in-progress" };
    let result = sqlx::query(
        "INSERT INTO goals (title, type, target_amount, current_amount, deadline, priority, note, repeat, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&title)
    .bind(&r#type)
    .bind(target_amount)
    .bind(current_amount)
    .bind(&deadline)
    .bind(&priority)
    .bind(note)
    .bind(&repeat)
    .bind(status)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_goal(
    state: tauri::State<'_, AppState>,
    id: i64,
    title: String,
    r#type: String,
    target_amount: f64,
    current_amount: f64,
    deadline: String,
    priority: String,
    note: Option<String>,
    repeat: String,
) -> Result<(), String> {
    let status = if current_amount >= target_amount { "completed" } else { "in-progress" };
    sqlx::query(
        "UPDATE goals SET title = ?, type = ?, target_amount = ?, current_amount = ?, deadline = ?, 
         priority = ?, note = ?, repeat = ?, status = ? WHERE id = ?"
    )
    .bind(&title)
    .bind(&r#type)
    .bind(target_amount)
    .bind(current_amount)
    .bind(&deadline)
    .bind(&priority)
    .bind(note)
    .bind(&repeat)
    .bind(status)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_goal(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM goals WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Loans (CRUD کامل) ----------
#[tauri::command]
async fn get_loans(state: tauri::State<'_, AppState>) -> Result<Vec<Loan>, String> {
    let rows = sqlx::query(
        "SELECT id, name, bank_name, total_amount, remaining_amount, interest_rate, monthly_payment, 
                start_date, end_date, total_installments, paid_installments, status, note 
         FROM loans ORDER BY id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut loans = Vec::new();
    for row in rows {
        loans.push(Loan {
            id: row.get(0),
            name: row.get(1),
            bank_name: row.get(2),
            total_amount: row.get(3),
            remaining_amount: row.get(4),
            interest_rate: row.get(5),
            monthly_payment: row.get(6),
            start_date: row.get(7),
            end_date: row.get(8),
            total_installments: row.get(9),
            paid_installments: row.get(10),
            status: row.get(11),
            note: row.get(12),
        });
    }
    Ok(loans)
}

#[tauri::command]
async fn add_loan(
    state: tauri::State<'_, AppState>,
    name: String,
    bank_name: Option<String>,
    total_amount: f64,
    remaining_amount: f64,
    interest_rate: f64,
    monthly_payment: f64,
    start_date: String,
    end_date: Option<String>,
    total_installments: i64,
    paid_installments: i64,
    note: Option<String>,
) -> Result<i64, String> {
    let status = if remaining_amount <= 0.0 { "paid" } else { "active" };
    let result = sqlx::query(
        "INSERT INTO loans (name, bank_name, total_amount, remaining_amount, interest_rate, monthly_payment,
         start_date, end_date, total_installments, paid_installments, status, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&name)
    .bind(bank_name)
    .bind(total_amount)
    .bind(remaining_amount)
    .bind(interest_rate)
    .bind(monthly_payment)
    .bind(&start_date)
    .bind(end_date)
    .bind(total_installments)
    .bind(paid_installments)
    .bind(&status)
    .bind(note)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_loan(
    state: tauri::State<'_, AppState>,
    id: i64,
    name: String,
    bank_name: Option<String>,
    total_amount: f64,
    remaining_amount: f64,
    interest_rate: f64,
    monthly_payment: f64,
    start_date: String,
    end_date: Option<String>,
    total_installments: i64,
    paid_installments: i64,
    note: Option<String>,
) -> Result<(), String> {
    let status = if remaining_amount <= 0.0 { "paid" } else { "active" };
    sqlx::query(
        "UPDATE loans SET name = ?, bank_name = ?, total_amount = ?, remaining_amount = ?, interest_rate = ?,
         monthly_payment = ?, start_date = ?, end_date = ?, total_installments = ?, paid_installments = ?,
         status = ?, note = ? WHERE id = ?"
    )
    .bind(&name)
    .bind(bank_name)
    .bind(total_amount)
    .bind(remaining_amount)
    .bind(interest_rate)
    .bind(monthly_payment)
    .bind(&start_date)
    .bind(end_date)
    .bind(total_installments)
    .bind(paid_installments)
    .bind(&status)
    .bind(note)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_loan(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM loans WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn pay_loan_installment(
    state: tauri::State<'_, AppState>,
    id: i64,
    amount: f64,
) -> Result<(), String> {
    // دریافت اطلاعات وام
    let row = sqlx::query(
        "SELECT remaining_amount, paid_installments, total_installments FROM loans WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    
    let remaining: f64 = row.get(0);
    let paid: i64 = row.get(1);
    let total: i64 = row.get(2);
    
    let new_remaining = (remaining - amount).max(0.0);
    let new_paid = paid + 1;
    let status = if new_remaining <= 0.0 { "paid" } else { "active" };
    
    sqlx::query(
        "UPDATE loans SET remaining_amount = ?, paid_installments = ?, status = ? WHERE id = ?"
    )
    .bind(new_remaining)
    .bind(new_paid)
    .bind(&status)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}
// ---------- Debts (CRUD کامل) ----------
#[tauri::command]
async fn get_debts(state: tauri::State<'_, AppState>) -> Result<Vec<Debt>, String> {
    let rows = sqlx::query(
        "SELECT id, name, person_name, total_amount, remaining_amount, start_date, due_date, status, note 
         FROM debts ORDER BY id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut debts = Vec::new();
    for row in rows {
        debts.push(Debt {
            id: row.get(0),
            name: row.get(1),
            person_name: row.get(2),
            total_amount: row.get(3),
            remaining_amount: row.get(4),
            start_date: row.get(5),
            due_date: row.get(6),
            status: row.get(7),
            note: row.get(8),
        });
    }
    Ok(debts)
}

#[tauri::command]
async fn add_debt(
    state: tauri::State<'_, AppState>,
    name: String,
    person_name: Option<String>,
    total_amount: f64,
    remaining_amount: f64,
    start_date: String,
    due_date: Option<String>,
    note: Option<String>,
) -> Result<i64, String> {
    let status = if remaining_amount <= 0.0 { "paid" } else { "active" };
    let result = sqlx::query(
        "INSERT INTO debts (name, person_name, total_amount, remaining_amount, start_date, due_date, status, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&name)
    .bind(person_name)
    .bind(total_amount)
    .bind(remaining_amount)
    .bind(&start_date)
    .bind(due_date)
    .bind(&status)
    .bind(note)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_debt(
    state: tauri::State<'_, AppState>,
    id: i64,
    name: String,
    person_name: Option<String>,
    total_amount: f64,
    remaining_amount: f64,
    start_date: String,
    due_date: Option<String>,
    note: Option<String>,
) -> Result<(), String> {
    let status = if remaining_amount <= 0.0 { "paid" } else { "active" };
    sqlx::query(
        "UPDATE debts SET name = ?, person_name = ?, total_amount = ?, remaining_amount = ?,
         start_date = ?, due_date = ?, status = ?, note = ? WHERE id = ?"
    )
    .bind(&name)
    .bind(person_name)
    .bind(total_amount)
    .bind(remaining_amount)
    .bind(&start_date)
    .bind(due_date)
    .bind(&status)
    .bind(note)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_debt(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM debts WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn pay_debt(
    state: tauri::State<'_, AppState>,
    id: i64,
    amount: f64,
) -> Result<(), String> {
    // دریافت اطلاعات بدهی
    let row = sqlx::query("SELECT remaining_amount FROM debts WHERE id = ?")
        .bind(id)
        .fetch_one(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let remaining: f64 = row.get(0);
    let new_remaining = (remaining - amount).max(0.0);
    let status = if new_remaining <= 0.0 { "paid" } else { "active" };
    
    sqlx::query(
        "UPDATE debts SET remaining_amount = ?, status = ? WHERE id = ?"
    )
    .bind(new_remaining)
    .bind(&status)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Subscriptions (CRUD کامل) ----------
#[tauri::command]
async fn get_subscriptions(state: tauri::State<'_, AppState>) -> Result<Vec<Subscription>, String> {
    let rows = sqlx::query(
        "SELECT id, name, provider, amount, currency, cycle, start_date, next_renewal, status, note 
         FROM subscriptions ORDER BY id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut subscriptions = Vec::new();
    for row in rows {
        subscriptions.push(Subscription {
            id: row.get(0),
            name: row.get(1),
            provider: row.get(2),
            amount: row.get(3),
            currency: row.get(4),
            cycle: row.get(5),
            start_date: row.get(6),
            next_renewal: row.get(7),
            status: row.get(8),
            note: row.get(9),
        });
    }
    Ok(subscriptions)
}

#[tauri::command]
async fn add_subscription(
    state: tauri::State<'_, AppState>,
    name: String,
    provider: Option<String>,
    amount: f64,
    currency: String,
    cycle: String,
    start_date: String,
    next_renewal: String,
    status: String,
    note: Option<String>,
) -> Result<i64, String> {
    let result = sqlx::query(
        "INSERT INTO subscriptions (name, provider, amount, currency, cycle, start_date, next_renewal, status, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&name)
    .bind(provider)
    .bind(amount)
    .bind(&currency)
    .bind(&cycle)
    .bind(&start_date)
    .bind(&next_renewal)
    .bind(&status)
    .bind(note)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_subscription(
    state: tauri::State<'_, AppState>,
    id: i64,
    name: String,
    provider: Option<String>,
    amount: f64,
    currency: String,
    cycle: String,
    start_date: String,
    next_renewal: String,
    status: String,
    note: Option<String>,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE subscriptions SET name = ?, provider = ?, amount = ?, currency = ?, cycle = ?,
         start_date = ?, next_renewal = ?, status = ?, note = ? WHERE id = ?"
    )
    .bind(&name)
    .bind(provider)
    .bind(amount)
    .bind(&currency)
    .bind(&cycle)
    .bind(&start_date)
    .bind(&next_renewal)
    .bind(&status)
    .bind(note)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_subscription(state: tauri::State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM subscriptions WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ---------- Reminders (CRUD کامل) ----------
#[tauri::command]
async fn get_reminders(state: tauri::State<'_, AppState>) -> Result<Vec<Reminder>, String> {
    let rows = sqlx::query(
        "SELECT id, title, date, time, category, note FROM reminders ORDER BY date, time"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut reminders = Vec::new();
    for row in rows {
        reminders.push(Reminder {
            id: row.get(0),
            title: row.get(1),
            date: row.get(2),
            time: row.get(3),
            category: row.get(4),
            note: row.get(5),
        });
    }
    Ok(reminders)
}

#[tauri::command]
async fn add_reminder(
    state: tauri::State<'_, AppState>,
    title: String,
    date: String,
    time: String,
    category: String,
    note: Option<String>,
) -> Result<i64, String> {
    let result = sqlx::query(
        "INSERT INTO reminders (title, date, time, category, note) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&title)
    .bind(&date)
    .bind(&time)
    .bind(&category)
    .bind(note)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(result.last_insert_rowid())
}

#[tauri::command]
async fn update_reminder(
    state: tauri::State<'_, AppState>,
    id: i64,
    title: String,
    date: String,
    time: String,
    category: String,
    note: Option<String>,
) -> Result<(), String> {
    sqlx::query(
        "UPDATE reminders SET title = ?, date = ?, time = ?, category = ?, note = ? WHERE id = ?"
    )
    .bind(&title)
    .bind(&date)
    .bind(&time)
    .bind(&category)
    .bind(note)
    .bind(id)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_reminder(
    state: tauri::State<'_, AppState>,
    id: i64,
) -> Result<(), String> {
    sqlx::query("DELETE FROM reminders WHERE id = ?")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ==================== تابع اصلی ====================
fn main() {
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
    ping,
    // Notifications
    get_notifications,
    add_notification,
    mark_notification_as_read,
    delete_notification,
    clear_all_notifications,
    get_settings,
    update_settings,
    // Accounts
    get_accounts,
    add_account,
    update_account,
    delete_account,
    // Assets
    get_assets,
    add_asset,
    update_asset,
    delete_asset,
    // Activities
    get_activities,
    add_activity,
    update_activity,
    delete_activity,
    // Goals
    get_goals,
    add_goal,
    update_goal,
    delete_goal,
    // Loans
    get_loans,
    add_loan,
    update_loan,
    delete_loan,
    pay_loan_installment,
    // Debts
    get_debts,
    add_debt,
    update_debt,
    delete_debt,
    pay_debt,
    // Subscriptions
    get_subscriptions,
    add_subscription,
    update_subscription,
    delete_subscription,
    // Reminders
    get_reminders,
    add_reminder,
    update_reminder,
    delete_reminder,
])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}