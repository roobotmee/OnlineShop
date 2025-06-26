import Database from "better-sqlite3"
import { join } from "path"
import bcrypt from "bcryptjs"
import fs from "fs"

// Database file path
const db_fayl_yoli = join(process.cwd(), "malumotlar.db")

// Create database directory if it doesn't exist
// Odatda, agar malumotlar.db loyiha ildizida bo'lsa, bu qism shart emas,
// chunki process.cwd() allaqachon mavjud bo'ladi. Lekin zarari yo'q.
const dbDir = join(process.cwd())
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Initialize database with error handling
let malumotlar_bazasi: Database.Database

try {
  malumotlar_bazasi = new Database(db_fayl_yoli)
  console.log("Database connection established successfully")

  // Enable foreign keys for relational integrity
  malumotlar_bazasi.pragma("foreign_keys = ON")

  // Create tables with error handling
  try {
    // Google Sheets table
    malumotlar_bazasi.exec(`
      CREATE TABLE IF NOT EXISTS google_sheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        link TEXT NOT NULL,
        sheet_id TEXT NOT NULL,
        varoqlar TEXT NOT NULL,
        yaratilgan_vaqt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Admin users table
    malumotlar_bazasi.exec(`
      CREATE TABLE IF NOT EXISTS adminlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        parol TEXT NOT NULL,
        yaratilgan_vaqt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Products table with rasmlar column
    malumotlar_bazasi.exec(`
      CREATE TABLE IF NOT EXISTS mahsulotlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        tavsif TEXT,
        narx REAL NOT NULL,
        chegirma_narx REAL,
        miqdor INTEGER NOT NULL,
        sheet_id INTEGER NOT NULL,
        varoq_nomi TEXT NOT NULL,
        link TEXT UNIQUE NOT NULL,
        ranglar TEXT NOT NULL DEFAULT '[]',
        rasmlar TEXT DEFAULT '[]',
        yaratilgan_vaqt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sheet_id) REFERENCES google_sheets (id)
      )
    `)

    // Orders table
    malumotlar_bazasi.exec(`
      CREATE TABLE IF NOT EXISTS buyurtmalar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mahsulot_id INTEGER NOT NULL,
        ism TEXT NOT NULL,
        telefon TEXT NOT NULL,
        tanlangan_rang TEXT NOT NULL,
        narx REAL NOT NULL,
        holat TEXT DEFAULT 'yangi',
        buyurtma_vaqti DATETIME NOT NULL,
        FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar (id)
      )
    `)

    // Legacy tables for backward compatibility (if still needed)
    malumotlar_bazasi.exec(`
      CREATE TABLE IF NOT EXISTS sahifalar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        link TEXT UNIQUE NOT NULL,
        sheet_id INTEGER NOT NULL,
        varoq_nomi TEXT NOT NULL,
        yaratilgan_vaqt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sheet_id) REFERENCES google_sheets (id)
      )
    `)

    malumotlar_bazasi.exec(`
      CREATE TABLE IF NOT EXISTS yuborilgan_malumotlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sahifa_id INTEGER NOT NULL,
        ism TEXT NOT NULL,
        telefon TEXT NOT NULL,
        yuborilgan_vaqt DATETIME NOT NULL,
        FOREIGN KEY (sahifa_id) REFERENCES sahifalar (id)
      )
    `)

    console.log("Database tables created successfully")

    // Create default admin user if not exists
    // Eslatma: Ishlab chiqarish muhitida bu qismni olib tashlash yoki
    // faqat bir marta ishlaydigan migratsiya skripti orqali amalga oshirish tavsiya etiladi.
    const admin_mavjud = malumotlar_bazasi.prepare("SELECT COUNT(*) as count FROM adminlar").get() as { count: number }
    if (admin_mavjud.count === 0) {
      const default_password = "T@deC3nt#r!2025xZ" // Sizning standart parolingiz
      const hashed_password = bcrypt.hashSync(default_password, 10)
      malumotlar_bazasi
        .prepare("INSERT INTO adminlar (email, parol) VALUES (?, ?)")
        .run("tradeonline@rava.films", hashed_password) // Sizning standart emailingiz
      console.log(`Default admin created: tradeonline@rava.films / ${default_password}`)
    }
  } catch (error) {
    console.error("Error creating database tables:", error)
  }
} catch (error) {
  console.error("Database connection error:", error)
  // Databasega ulanishda xato bo'lsa, ilovani ishdan chiqarmaslik uchun
  // "dummy" ma'lumotlar bazasi ob'ektini yaratish.
  // Haqiqiy ilovalarda bu yerda yanada mustahkam xato boshqaruvi bo'lishi kerak.
  malumotlar_bazasi = {
    prepare: () => ({
      get: () => null,
      all: () => [],
      run: () => ({ changes: 0, lastInsertRowid: 0 }), // run uchun ham to'g'ri qaytarish qiymati
    }),
    exec: () => null,
    pragma: () => null, // pragma uchun ham dummy funksiya
  } as any
}

export { malumotlar_bazasi }
