import { NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"

export async function GET() {
  try {
    const mahsulotlar = malumotlar_bazasi
      .prepare(`
      SELECT m.*, COUNT(b.id) as buyurtmalar_soni
      FROM mahsulotlar m 
      LEFT JOIN buyurtmalar b ON m.id = b.mahsulot_id
      GROUP BY m.id
      ORDER BY buyurtmalar_soni DESC
      LIMIT 10
    `)
      .all()

    return NextResponse.json(mahsulotlar)
  } catch (xato) {
    console.error("Mashhur mahsulotlarni yuklashda xato:", xato)
    return NextResponse.json({ xato: "Mashhur mahsulotlarni yuklashda xato" }, { status: 500 })
  }
}
