import { NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"

export async function GET() {
  try {
    const buyurtmalar = malumotlar_bazasi
      .prepare(`
      SELECT b.*, m.nom as mahsulot_nomi
      FROM buyurtmalar b 
      LEFT JOIN mahsulotlar m ON b.mahsulot_id = m.id
      ORDER BY b.buyurtma_vaqti DESC
      LIMIT 10
    `)
      .all()

    return NextResponse.json(buyurtmalar)
  } catch (xato) {
    console.error("So'nggi buyurtmalarni yuklashda xato:", xato)
    return NextResponse.json({ xato: "So'nggi buyurtmalarni yuklashda xato" }, { status: 500 })
  }
}
