import { type NextRequest, NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"
import { randomBytes } from "crypto"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function GET() {
  try {
    // Check cache first
    const cachedProducts = cache.get(CACHE_KEYS.PRODUCTS)
    if (cachedProducts) {
      return NextResponse.json(cachedProducts)
    }

    const mahsulotlar = malumotlar_bazasi
      .prepare(`
      SELECT m.*, gs.nom as sheet_nomi 
      FROM mahsulotlar m 
      LEFT JOIN google_sheets gs ON m.sheet_id = gs.id
      ORDER BY m.yaratilgan_vaqt DESC
    `)
      .all()

    // Handle empty result
    if (!mahsulotlar) {
      return NextResponse.json([])
    }

    const formattedMahsulotlar = mahsulotlar.map((mahsulot: any) => {
      try {
        return {
          ...mahsulot,
          ranglar: JSON.parse(mahsulot.ranglar || "[]"),
          rasmlar: JSON.parse(mahsulot.rasmlar || "[]"),
        }
      } catch (error) {
        console.error(`Error parsing data for product ${mahsulot.id}:`, error)
        return {
          ...mahsulot,
          ranglar: [],
          rasmlar: [],
        }
      }
    })

    // Cache for 5 minutes
    cache.set(CACHE_KEYS.PRODUCTS, formattedMahsulotlar, 5 * 60 * 1000)

    const response = NextResponse.json(formattedMahsulotlar)
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=150")

    return response
  } catch (xato) {
    console.error("Mahsulotlarni yuklashda xato:", xato)
    return NextResponse.json({ xato: "Mahsulotlarni yuklashda xato" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Request body'ni olish
    const body = await request.json().catch((error) => {
      console.error("JSON parse error:", error)
      return null
    })

    // Body tekshirish
    if (!body) {
      return NextResponse.json({ xato: "Noto'g'ri so'rov formati" }, { status: 400 })
    }

    const { nom, tavsif, narx, chegirma_narx, miqdor, sheet_id, varoq_nomi, ranglar, rasmlar } = body

    // Validate required fields
    if (!nom) {
      return NextResponse.json({ xato: "Mahsulot nomi kiritilmagan" }, { status: 400 })
    }

    if (!narx || isNaN(Number(narx))) {
      return NextResponse.json({ xato: "Narx noto'g'ri formatda" }, { status: 400 })
    }

    if (!miqdor || isNaN(Number(miqdor))) {
      return NextResponse.json({ xato: "Miqdor noto'g'ri formatda" }, { status: 400 })
    }

    if (!sheet_id) {
      return NextResponse.json({ xato: "Google Sheet tanlanmagan" }, { status: 400 })
    }

    if (!varoq_nomi) {
      return NextResponse.json({ xato: "Varoq tanlanmagan" }, { status: 400 })
    }

    // Sheet mavjudligini tekshirish
    const sheet = malumotlar_bazasi.prepare("SELECT id FROM google_sheets WHERE id = ?").get(sheet_id)
    if (!sheet) {
      return NextResponse.json({ xato: "Tanlangan Google Sheet topilmadi" }, { status: 404 })
    }

    const noyob_link = randomBytes(32).toString("hex")

    // Mahsulotni saqlash
    try {
      // Ma'lumotlarni tayyorlash
      const ranglarJson = JSON.stringify(ranglar || [])
      const rasmlarJson = JSON.stringify(rasmlar || [])

      // Mahsulotni saqlash
      const stmt = malumotlar_bazasi.prepare(`
        INSERT INTO mahsulotlar (nom, tavsif, narx, chegirma_narx, miqdor, sheet_id, varoq_nomi, link, ranglar, rasmlar) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        nom,
        tavsif || "",
        narx,
        chegirma_narx,
        miqdor,
        sheet_id,
        varoq_nomi,
        noyob_link,
        ranglarJson,
        rasmlarJson,
      )

      // Clear cache
      cache.delete(CACHE_KEYS.PRODUCTS)

      return NextResponse.json({ muvaffaqiyat: true, link: noyob_link })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          xato: "Ma'lumotlar bazasiga saqlashda xato",
          details: dbError instanceof Error ? dbError.message : "Noma'lum xato",
        },
        { status: 500 },
      )
    }
  } catch (xato) {
    console.error("Mahsulot yaratishda xato:", xato)
    return NextResponse.json(
      {
        xato: "Mahsulot yaratishda xato yuz berdi",
        details: xato instanceof Error ? xato.message : "Noma'lum xato",
      },
      { status: 500 },
    )
  }
}
