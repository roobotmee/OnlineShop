import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { malumotlar_bazasi } from "@/lib/database"

const google_hisob_malumoti = {
  type: "service_account",
  project_id: "aqueous-argon-454316-h5",
  private_key_id: "80fc48e37cada54f579db2956a51a283c8a58a10",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVbt9djX+Mra3X\nuFx9i5/eE9DnkHGWvrqj5P/bXYbZc11ieufl1WBDTGxhY/7IGsW637dUUUVLW7vN\nmmF7a27VTU9WB8G08b32IzbekG8ccyxPqhPI7JeXuhlo6+6WMKm1eqHAG+lPyRFZ\nizkBd4rD/1ZnKhcrZ52zHUX05RxzuN3jhP8/sw4xfiPf8FtD55M5Ag0j77+Yn3ku\n2mcVDBonrzkH64+sol/XNAkispKtEyfG46QgLFf0hCxMvr8Vy3AZcVIHT0wY3X4a\nUr9LIgYJRNIwabQcZVrNlDAh1pIOuy5sRDKyeWRxvwiP3LIOp4aL9ExYtymMTdJc\nWder68znAgMBAAECggEAFyoMj7TXYLLW9SQ77i2T4XntPcrgg3owdic8WZXUyWY+\nmSgCmlhVJ57ersrbRstjpbV39qbx2MiGbczwhJB2/14Qc35t/YMl1n8cn9aq6rGY\nh7GOh0HUZALyB8I0W219Y/JNGvnDVTNkMEnKffA5KhXYSn4LVmv7AGDZedN+8W8q\nXw0s94eYwybWnR5rEhU2ja2Mdn06yik5cO3bJNcDNxfkBPpleGUYAsRCxcjGJhKn\nqXh4axpqf2ADgzLuy4Aem4SeET4giS88mjNx3X4BUydBoUc6PW/kn6qqD0TuFzZY\nlDG0xeUVfJHfpq6uWfRnHvcspVgUFxdC35HAW0Ao6QKBgQDIop9QXn7aglBhp5/5\nSPH4uzCiy7QKrN2VJ6nY/tCjr/Co21G0FIXdu7GgR7Bs7+IoK4qybWNbqLQ9x7PJ\n9CzHm7bkNK/iAnurLdFRpUupVPB8J94biRYIE3GgRC1MpfiN12eoLC22D2sFB9jL\n/YNVt6WC6W0mCi164/ebZZb+PwKBgQC+qzOsXgM2SCvjI6VYMdgIh4z2lHMYZo44\n07R6WNIXlByLPREA9xnsa8clpQf4VZ2/Mw3e9x/hp08o4RVOWYrh+Hh/gewnpqoM\npL8L4KnNbYKRpiFccUVrH1F1uUHnjWFNPUARuyVDpE1ualF+ZBgQX0sYuyYlCzZR\n+yzyIHpXWQKBgF7Z+uVc9y3IY8X3IDsTEEod/P1JvmE5njvwl2yd8vcfq2+41+SB\nu1O7c1sp6S9nLQz+oMB/1HQ1yphWfBni1PS9GfbDLc90ixC/RXEK6z0vic24b1mn\nMoI45wP0l1HgOSSdjETGNgoXOeoT7ptpy5hPjPDZ+B7+useZVKrjmUGzAoGBALQh\nk/jk/I3c0zGMrJnMxTcRsJgIGVBVG0oOn/PyU9GYyPq2n4jU6fXUwNkMt6HiaNyI\nxDMAL2uFICETvIg/yhjAID7+JHg1WXQGdMMo5eLA8djeJahrDtUsSk44zk2O4P0S\nv6PAtWzZHZoR8ZnBwIY/MPhVXq0ikZgT/xtkmZBJAoGAIRiO4cGLkgPR4FLZwO+g\nQ0zvaKoxTQJpeiwmwTPT1EmhOC1jrydC9ZV2sx04dW/DmDdLRCszbom+p2PeY+aK\nfnO7n2Ldo0wriEA3TYH91JrjqeKPOJBiSvQZwOrnFo3FJ5pGcWUClP3Dd2EQkqwy\nZFodarS4NReVEkE2stM/F6I=\n-----END PRIVATE KEY-----\n",
  client_email: "web-malumotlari@aqueous-argon-454316-h5.iam.gserviceaccount.com",
  client_id: "115618197435548741093",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/web-malumotlari%40aqueous-argon-454316-h5.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
}

export async function POST(request: NextRequest) {
  try {
    const { mahsulot_id, ism, telefon, tanlangan_rang, tolov_usuli, tolov_miqdori } = await request.json()

    // Ma'lumotlarni tekshirish
    if (!mahsulot_id || !ism || !telefon) {
      return NextResponse.json({ xato: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 })
    }

    const mahsulot_malumoti = malumotlar_bazasi
      .prepare(`
    SELECT m.*, gs.sheet_id as google_sheet_id
    FROM mahsulotlar m 
    LEFT JOIN google_sheets gs ON m.sheet_id = gs.id
    WHERE m.id = ?
  `)
      .get(mahsulot_id)

    if (!mahsulot_malumoti) {
      return NextResponse.json({ xato: "Mahsulot topilmadi" }, { status: 404 })
    }

    // Narx va to'lov ma'lumotlarini hisoblash
    const asosiy_narx = mahsulot_malumoti.chegirma_narx || mahsulot_malumoti.narx
    let muddat = "To'liq to'lov"
    let muddat_oy = 0
    let jami_narx = asosiy_narx
    let oylik_tolov = asosiy_narx

    // Muddatli to'lov hisoblash
    if (tolov_usuli !== "toliq" && typeof tolov_usuli === "number") {
      const tolov_variantlari = [
        { oy: 3, foiz: 10 },
        { oy: 6, foiz: 29 },
        { oy: 12, foiz: 44 },
      ]

      const variant = tolov_variantlari.find((v) => v.oy === tolov_usuli)
      if (variant) {
        const qoshimcha_foiz = (asosiy_narx * variant.foiz) / 100
        jami_narx = asosiy_narx + qoshimcha_foiz
        oylik_tolov = Math.ceil(jami_narx / variant.oy)
        muddat = `${variant.oy} oy`
        muddat_oy = variant.oy
      }
    }

    const hozirgi_vaqt = new Date().toLocaleString("uz-UZ")

    // Google Sheets ga ma'lumot yuborish
    let sheets_success = false
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: google_hisob_malumoti,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })

      const sheets = google.sheets({ version: "v4", auth })

      // Avval sheet bo'sh ekanligini tekshiramiz va sarlavha qo'shamiz
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: mahsulot_malumoti.google_sheet_id,
        range: `${mahsulot_malumoti.varoq_nomi}!A1:G1`, // O'zgartirildi H1 dan G1 ga
      })

      // Agar birinchi qator bo'sh bo'lsa, sarlavhalarni qo'shamiz
      if (!existingData.data.values || existingData.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: mahsulot_malumoti.google_sheet_id,
          range: `${mahsulot_malumoti.varoq_nomi}!A1:G1`, // O'zgartirildi H1 dan G1 ga
          valueInputOption: "RAW",
          requestBody: {
            values: [
              [
                // "Buyurtma vaqti", // A ustuni - OLIB TASHLANDI
                "Mijoz ismi", // A ustuni (avval B)
                "Telefon raqam", // B ustuni (avval C)
                "Mahsulot nomi", // C ustuni (avval D)
                "Mahsulot rangi", // D ustuni (avval E)
                "To'lov muddati", // E ustuni (avval F)
                "Oylik to'lov", // F ustuni (avval G)
                "Jami narx", // G ustuni (avval H)
              ],
            ],
          },
        })
      }

      // Ma'lumotlarni qo'shish
      const sheets_data = [
        // hozirgi_vaqt, // Buyurtma vaqti - OLIB TASHLANDI
        ism, // Mijoz ismi
        telefon, // Telefon raqam
        mahsulot_malumoti.nom, // Mahsulot nomi
        tanlangan_rang || "Standart", // Mahsulot rangi
        muddat_oy > 0 ? `${muddat_oy} oy` : "To'liq to'lov", // To'lov muddati
        oylik_tolov.toLocaleString() + " so'm", // Oylik to'lov
        jami_narx.toLocaleString() + " so'm", // Jami narx
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId: mahsulot_malumoti.google_sheet_id,
        range: `${mahsulot_malumoti.varoq_nomi}!A:G`, // O'zgartirildi A:H dan A:G ga
        valueInputOption: "RAW",
        requestBody: {
          values: [sheets_data],
        },
      })

      sheets_success = true
      console.log("Google Sheets ga ma'lumot muvaffaqiyatli saqlandi")
    } catch (sheetsError) {
      console.error("Google Sheets xatosi:", sheetsError)
      // Google Sheets xatosi bo'lsa ham, ma'lumotlar bazasiga saqlashni davom ettiramiz
    }

    // Ma'lumotlar bazasiga saqlash
    try {
      // Jadval strukturasini tekshirish va yangilash
      const columns = malumotlar_bazasi.prepare("PRAGMA table_info(buyurtmalar)").all()
      const hasNewColumns = columns.some((col: any) => col.name === "muddat")

      if (!hasNewColumns) {
        // Yangi ustunlarni qo'shish
        malumotlar_bazasi.prepare("ALTER TABLE buyurtmalar ADD COLUMN muddat TEXT DEFAULT 'To''liq to''lov'").run()
        malumotlar_bazasi.prepare("ALTER TABLE buyurtmalar ADD COLUMN jami_narx REAL DEFAULT 0").run()
        malumotlar_bazasi.prepare("ALTER TABLE buyurtmalar ADD COLUMN oylik_tolov REAL DEFAULT 0").run()
      }

      const stmt = malumotlar_bazasi.prepare(`
      INSERT INTO buyurtmalar (
        mahsulot_id, ism, telefon, tanlangan_rang, narx, 
        muddat, jami_narx, oylik_tolov, buyurtma_vaqti
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

      stmt.run(
        mahsulot_id,
        ism,
        telefon,
        tanlangan_rang || "Standart",
        asosiy_narx,
        muddat,
        jami_narx,
        oylik_tolov,
        hozirgi_vaqt,
      )

      // Telefon raqamini tozalash (faqat raqamlar)
      const tozalangan_telefon = telefon.replace(/[^\d]/g, "")

      return NextResponse.json({
        muvaffaqiyat: true,
        sheets_saqlandi: sheets_success,
        buyurtma_malumoti: {
          ism,
          telefon,
          tozalangan_telefon, // Tozalangan telefon raqami
          mahsulot: mahsulot_malumoti.nom,
          rang: tanlangan_rang || "Standart",
          muddat: muddat_oy > 0 ? `${muddat_oy} oy` : "To'liq to'lov",
          oylik_tolov: oylik_tolov,
          jami_narx: jami_narx,
        },
      })
    } catch (dbError) {
      console.error("Ma'lumotlar bazasi xatosi:", dbError)
      return NextResponse.json(
        {
          xato: "Ma'lumotlarni saqlashda xato yuz berdi",
          details: dbError instanceof Error ? dbError.message : "Noma'lum xato",
        },
        { status: 500 },
      )
    }
  } catch (xato) {
    console.error("Buyurtma berishda xato:", xato)
    return NextResponse.json(
      {
        xato: "Buyurtma berishda xato yuz berdi",
        details: xato instanceof Error ? xato.message : "Noma'lum xato",
      },
      { status: 500 },
    )
  }
}
