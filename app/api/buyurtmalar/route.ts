import { NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"

export async function GET() {
  try {
    const buyurtmalar = malumotlar_bazasi
      .prepare(`
      SELECT 
        b.*, 
        m.nom as mahsulot_nomi,
        COALESCE(b.muddat, 'To''liq to''lov') as muddat,
        COALESCE(b.jami_narx, b.narx) as jami_narx,
        COALESCE(b.oylik_tolov, 0) as oylik_tolov
      FROM buyurtmalar b 
      LEFT JOIN mahsulotlar m ON b.mahsulot_id = m.id
      ORDER BY b.buyurtma_vaqti DESC
    `)
      .all()

    return NextResponse.json(buyurtmalar)
  } catch (xato) {
    console.error("Buyurtmalarni yuklashda xato:", xato)
    return NextResponse.json({ xato: "Buyurtmalarni yuklashda xato" }, { status: 500 })
  }
}
