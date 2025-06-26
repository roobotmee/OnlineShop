import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { writeFile, mkdir } from "fs/promises"
import { randomBytes } from "crypto"
import { existsSync } from "fs"

const UPLOADS_DIR = join(process.cwd(), "public", "uploads")

export async function POST(request: NextRequest) {
  try {
    // Content-Type: multipart/form-data bo'lishi shart
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ xato: "Noto'g'ri Content-Type" }, { status: 400 })
    }

    // uploads papkasini yaratish
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ xato: "Fayl topilmadi" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `${randomBytes(16).toString("hex")}.${ext}`
    const filePath = join(UPLOADS_DIR, fileName)

    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({
      muvaffaqiyat: true,
      fayl: {
        nom: file.name,
        url: fileUrl,
      },
    })
  } catch (xato) {
    console.error("Fayl yuklashda xato:", xato)
    return NextResponse.json({ xato: "Fayl yuklashda xatolik yuz berdi" }, { status: 500 })
  }
}
