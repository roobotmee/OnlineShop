import { type NextRequest, NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"
import { randomBytes } from "crypto"

export async function GET() {
  try {
    const sahifalar = malumotlar_bazasi
      .prepare(`
      SELECT s.*, gs.nom as sheet_nomi 
      FROM sahifalar s 
      LEFT JOIN google_sheets gs ON s.sheet_id = gs.id
    `)
      .all()
    return NextResponse.json(sahifalar)
  } catch (xato) {
    return NextResponse.json({ xato: "Sahifalarni yuklashda xato" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nom, sheet_id, varoq_nomi } = await request.json()

    const noyob_link = randomBytes(32).toString("hex")

    const stmt = malumotlar_bazasi.prepare(`
      INSERT INTO sahifalar (nom, link, sheet_id, varoq_nomi) 
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(nom, noyob_link, sheet_id, varoq_nomi)

    return NextResponse.json({ muvaffaqiyat: true, link: noyob_link })
  } catch (xato) {
    return NextResponse.json({ xato: "Sahifa yaratishda xato" }, { status: 500 })
  }
}
