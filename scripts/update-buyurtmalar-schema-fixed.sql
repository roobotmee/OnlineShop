-- Buyurtmalar jadvalini yangilash - barcha kerakli ustunlarni qo'shish
ALTER TABLE buyurtmalar ADD COLUMN muddat TEXT DEFAULT 'To''liq to''lov';
ALTER TABLE buyurtmalar ADD COLUMN jami_narx REAL DEFAULT 0;
ALTER TABLE buyurtmalar ADD COLUMN oylik_tolov REAL DEFAULT 0;

-- Eski tolov_usuli ustunini o'chirish (agar mavjud bo'lsa)
-- ALTER TABLE buyurtmalar DROP COLUMN tolov_usuli;

-- Yangi buyurtmalar jadvali strukturasi:
-- id, mahsulot_id, ism, telefon, tanlangan_rang, narx, muddat, jami_narx, oylik_tolov, holat, buyurtma_vaqti
