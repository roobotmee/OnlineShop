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

export async function GET() {
  try {
    const sheetlar = malumotlar_bazasi.prepare("SELECT * FROM google_sheets").all()

    // Parse the varoqlar JSON string to array for each sheet
    const formattedSheetlar = sheetlar.map((sheet) => {
      try {
        // Safely parse JSON or return empty array if parsing fails
        const varoqlar = typeof sheet.varoqlar === "string" ? JSON.parse(sheet.varoqlar) : []
        return {
          ...sheet,
          varoqlar: Array.isArray(varoqlar) ? varoqlar : [],
        }
      } catch (error) {
        console.error(`JSON parse error for sheet ${sheet.id}:`, error)
        return {
          ...sheet,
          varoqlar: [],
        }
      }
    })

    return NextResponse.json(formattedSheetlar)
  } catch (xato) {
    console.error("Sheetlarni yuklashda xato:", xato)
    return NextResponse.json({ xato: "Sheetlarni yuklashda xato" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { link } = await request.json()

    const sheet_id = link.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    if (!sheet_id) {
      return NextResponse.json({ xato: "Noto'g'ri Google Sheets link" }, { status: 400 })
    }

    const auth = new google.auth.GoogleAuth({
      credentials: google_hisob_malumoti,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const javob = await sheets.spreadsheets.get({
      spreadsheetId: sheet_id,
    })

    const varoqlar = javob.data.sheets?.map((sheet) => sheet.properties?.title || "") || []
    const nom = javob.data.properties?.title || "Nomsiz Sheet"

    const stmt = malumotlar_bazasi.prepare(`
      INSERT INTO google_sheets (nom, link, sheet_id, varoqlar) 
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(nom, link, sheet_id, JSON.stringify(varoqlar))

    return NextResponse.json({ muvaffaqiyat: true })
  } catch (xato) {
    console.error("Sheet qoshishda xato:", xato)
    return NextResponse.json({ xato: "Sheet qoshishda xato" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ xato: "ID kerak" }, { status: 400 })
    }

    const stmt = malumotlar_bazasi.prepare("DELETE FROM google_sheets WHERE id = ?")
    stmt.run(id)

    return NextResponse.json({ muvaffaqiyat: true })
  } catch (xato) {
    console.error("Sheet ochirishda xato:", xato)
    return NextResponse.json({ xato: "Sheet ochirishda xato" }, { status: 500 })
  }
}
