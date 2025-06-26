import { type NextRequest, NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function GET(request: NextRequest, { params }: { params: Promise<{ link: string }> }) {
  try {
    const { link } = await params

    // Check cache first
    const cacheKey = CACHE_KEYS.PRODUCT(link)
    const cachedProduct = cache.get(cacheKey)
    if (cachedProduct) {
      return NextResponse.json(cachedProduct)
    }

    const mahsulot = malumotlar_bazasi
      .prepare(`
      SELECT m.*, gs.nom as sheet_nomi, gs.sheet_id as google_sheet_id
      FROM mahsulotlar m 
      LEFT JOIN google_sheets gs ON m.sheet_id = gs.id
      WHERE m.link = ?
    `)
      .get(link)

    if (!mahsulot) {
      return NextResponse.json({ xato: "Mahsulot topilmadi" }, { status: 404 })
    }

    const formattedMahsulot = {
      ...mahsulot,
      ranglar: JSON.parse(mahsulot.ranglar || "[]"),
      rasmlar: JSON.parse(mahsulot.rasmlar || "[]"),
    }

    // Cache the result for 10 minutes
    cache.set(cacheKey, formattedMahsulot, 10 * 60 * 1000)

    // Set cache headers
    const response = NextResponse.json(formattedMahsulot)
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300")

    return response
  } catch (xato) {
    console.error("Mahsulot malumotini yuklashda xato:", xato)
    return NextResponse.json({ xato: "Mahsulot malumotini yuklashda xato" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ link: string }> }) {
  try {
    const { link } = await params

    // First find the product by link to get its ID
    const mahsulot = malumotlar_bazasi.prepare("SELECT id FROM mahsulotlar WHERE link = ?").get(link)

    if (!mahsulot) {
      return NextResponse.json({ xato: "Mahsulot topilmadi" }, { status: 404 })
    }

    // Delete the product
    const stmt = malumotlar_bazasi.prepare("DELETE FROM mahsulotlar WHERE link = ?")
    stmt.run(link)

    // Clear cache
    cache.delete(CACHE_KEYS.PRODUCT(link))
    cache.delete(CACHE_KEYS.PRODUCTS)

    return NextResponse.json({ muvaffaqiyat: true })
  } catch (xato) {
    console.error("Mahsulotni o'chirishda xato:", xato)
    return NextResponse.json({ xato: "Mahsulotni o'chirishda xato" }, { status: 500 })
  }
}
