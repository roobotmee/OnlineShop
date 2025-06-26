import { NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"

export async function GET() {
  try {
    const mijozlar = malumotlar_bazasi
      .prepare(`
      SELECT 
        ism,
        telefon,
        COUNT(*) as buyurtmalar_soni,
        SUM(narx) as jami_xarid,
        MAX(buyurtma_vaqti) as oxirgi_buyurtma
      FROM buyurtmalar 
      GROUP BY ism, telefon
      ORDER BY jami_xarid DESC
    `)
      .all()

    return NextResponse.json(mijozlar)
  } catch (xato) {
    console.error("Mijozlarni yuklashda xato:", xato)
    return NextResponse.json({ xato: "Mijozlarni yuklashda xato" }, { status: 500 })
  }
}
