-- Admin users table
CREATE TABLE IF NOT EXISTS adminlar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  parol TEXT NOT NULL,
  yaratilgan_vaqt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
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
  ranglar TEXT NOT NULL,
  yaratilgan_vaqt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sheet_id) REFERENCES google_sheets (id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS buyurtmalar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mahsulot_id INTEGER NOT NULL,
  ism TEXT NOT NULL,
  telefon TEXT NOT NULL,
  tanlangan_rang TEXT NOT NULL,
  narx REAL NOT NULL,
  buyurtma_vaqti DATETIME NOT NULL,
  FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar (id)
);

-- Insert default admin user
INSERT OR IGNORE INTO adminlar (email, parol) 
VALUES ('admin@techstore.uz', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- Default password: admin123
