-- Mahsulotlar jadvalini tekshirish va yaratish
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
);

-- Mavjud jadval strukturasini tekshirish
PRAGMA table_info(mahsulotlar);

-- Agar rasmlar ustuni mavjud bo'lmasa, uni qo'shish
-- SQLite ALTER TABLE orqali ustun qo'shish uchun
-- Bu script faqat ma'lumot uchun, amalda kod ichida tekshiriladi
-- ALTER TABLE mahsulotlar ADD COLUMN rasmlar TEXT DEFAULT '[]';
