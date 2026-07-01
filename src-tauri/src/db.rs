use tauri::Manager;
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

    // ==================== ایجاد جدول‌ها ====================

    // 1. جدول اعلان‌ها
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

    // 2. جدول تنظیمات اعلان‌ها
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

    // 3. جدول حساب‌ها
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            balance REAL DEFAULT 0,
            currency TEXT NOT NULL,
            category TEXT NOT NULL
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // 4. جدول دارایی‌ها
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            unit TEXT NOT NULL,
            category TEXT NOT NULL,
            buy_price REAL NOT NULL,
            current_price REAL NOT NULL,
            buy_date TEXT NOT NULL,
            note TEXT
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // 5. جدول فعالیت‌ها (تراکنش‌ها)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            account_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            description TEXT,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // 6. جدول اهداف
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            deadline TEXT NOT NULL,
            priority TEXT NOT NULL,
            note TEXT,
            repeat TEXT DEFAULT 'none',
            last_reset TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            status TEXT DEFAULT 'in-progress'
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // 7. جدول وام‌ها
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            remaining_amount REAL NOT NULL,
            interest_rate REAL DEFAULT 0,
            monthly_payment REAL NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            total_installments INTEGER NOT NULL,
            paid_installments INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            note TEXT
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // 8. جدول بدهی‌ها
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS debts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            person_name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            remaining_amount REAL NOT NULL,
            start_date TEXT NOT NULL,
            due_date TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            note TEXT
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // 9. جدول اشتراک‌ها
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            provider TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            cycle TEXT NOT NULL,
            start_date TEXT NOT NULL,
            next_renewal TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            note TEXT
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // 10. جدول یادآورها
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            category TEXT NOT NULL,
            note TEXT
        );
        "#
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // ==================== مقدار پیش‌فرض برای تنظیمات ====================
    sqlx::query(
        "INSERT OR IGNORE INTO notification_settings (id) VALUES (1)"
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // ==================== دیتای نمونه برای تست (اختیاری) ====================
    // بررسی اینکه آیا داده‌ای در جدول accounts وجود دارد یا نه
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM accounts")
        .fetch_one(&pool)
        .await
        .unwrap_or(0);

    if count == 0 {
        // اضافه کردن دیتای نمونه
        let _ = sqlx::query(
            r#"
            INSERT INTO accounts (name, balance, currency, category) VALUES 
                ('بایننس فیوچرز', 24856.32, 'USDT', 'trading'),
                ('صرافی نوبیتکس', 15000000, 'IRR', 'trading'),
                ('بانک ملی - حساب جاری', 12500000, 'IRR', 'bank'),
                ('بانک صادرات - پس‌انداز', 8000000, 'IRR', 'bank'),
                ('کیف پول متامسک', 0.87, 'BTC', 'crypto')
            "#
        )
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            r#"
            INSERT INTO assets (name, amount, unit, category, buy_price, current_price, buy_date) VALUES 
                ('سکه تمام بهار آزادی', 5, 'عدد', 'gold', 42000000, 45000000, '1402/08/15'),
                ('طلای آب شده', 12.4, 'گرم', 'gold', 3500000, 3800000, '1403/01/10'),
                ('نقره', 500, 'گرم', 'silver', 45000, 52000, '1403/02/20')
            "#
        )
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            r#"
            INSERT INTO activities (type, account_id, amount, date, description) VALUES 
                ('profit', 1, 150, '1403/04/25', 'سود ترید BTC'),
                ('loss', 2, 45, '1403/04/24', 'ضرر ترید ETH'),
                ('deposit', 3, 5000000, '1403/04/20', 'واریز ماهانه')
            "#
        )
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            r#"
            INSERT INTO goals (title, type, target_amount, current_amount, deadline, priority) VALUES 
                ('خرید آپارتمان', 'savings', 2000000000, 450000000, '1405/06/01', 'high'),
                ('صندوق اضطراری', 'savings', 100000000, 75000000, '1403/12/01', 'high'),
                ('رسیدن به ۱۰ هزار دلار', 'investment', 100000, 24856, '1404/06/01', 'medium')
            "#
        )
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            r#"
            INSERT INTO loans (name, bank_name, total_amount, remaining_amount, interest_rate, monthly_payment, start_date, end_date, total_installments) VALUES 
                ('وام خرید خودرو', 'بانک ملی', 200000000, 150000000, 18, 8500000, '1402/06/01', '1404/06/01', 24)
            "#
        )
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            r#"
            INSERT INTO debts (name, person_name, total_amount, remaining_amount, start_date, due_date) VALUES 
                ('بدهی به علی', 'علی محمدی', 50000000, 30000000, '1403/01/15', '1403/10/15'),
                ('بدهی به رضا', 'رضا احمدی', 20000000, 0, '1402/08/01', '1403/02/01')
            "#
        )
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            r#"
            INSERT INTO subscriptions (name, provider, amount, currency, cycle, start_date, next_renewal) VALUES 
                ('ChatGPT Plus', 'OpenAI', 20, 'USD', 'monthly', '1403/01/01', '1403/05/01'),
                ('Netflix', 'Netflix', 15, 'USD', 'monthly', '1402/10/15', '1403/05/15')
            "#
        )
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            r#"
            INSERT INTO reminders (title, date, time, category) VALUES 
                ('پرداخت قسط وام', '1403/05/01', '10:00', 'financial'),
                ('تمدید اشتراک ChatGPT', '1403/05/01', '00:00', 'subscription'),
                ('بررسی پورتفوی', '1403/05/15', '18:00', 'investment')
            "#
        )
        .execute(&pool)
        .await;
    }

    Ok(pool)
}