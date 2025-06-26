import { type NextRequest, NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ link: string }> }) {
  try {
    const { link } = await params

    const sahifa = malumotlar_bazasi
      .prepare(`
      SELECT s.*, gs.nom as sheet_nomi, gs.sheet_id as google_sheet_id
      FROM sahifalar s 
      LEFT JOIN google_sheets gs ON s.sheet_id = gs.id
      WHERE s.link = ?
    `)
      .get(link)

    if (!sahifa) {
      return NextResponse.json({ xato: "Sahifa topilmadi" }, { status: 404 })
    }

    return NextResponse.json(sahifa)
  } catch (xato) {
    return NextResponse.json({ xato: "Sahifa malumotini yuklashda xato" }, { status: 500 })
  }
}
