-- Mahsulotlar jadvaliga rasmlar ustunini qo'shish
ALTER TABLE mahsulotlar ADD COLUMN rasmlar TEXT DEFAULT '[]';

-- Eski asosiy_rasm ustunini olib tashlash (agar mavjud bo'lsa)
-- ALTER TABLE mahsulotlar DROP COLUMN asosiy_rasm;
