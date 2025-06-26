import { type NextRequest, NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, parol } = await request.json()

    // Create default admin if none exists
    // Ishlab chiqarish muhitida bu qismni olib tashlash yoki boshqacha boshqarish tavsiya etiladi!
    try {
      const admin_count = malumotlar_bazasi.prepare("SELECT COUNT(*) as count FROM adminlar").get() as { count: number }

      if (admin_count.count === 0) {
        const hashed_password = bcrypt.hashSync("T@deC3nt#r!2025xZ", 10) // Sizning parolingiz xashlandi
        malumotlar_bazasi
          .prepare("INSERT INTO adminlar (email, parol) VALUES (?, ?)")
          .run("tradeonline@rava.films", hashed_password) // Sizning emailingiz
        console.log("Default admin created during login attempt")
      }
    } catch (error) {
      console.error("Error checking/creating default admin:", error)
    }

    // Get admin user
    const admin = malumotlar_bazasi.prepare("SELECT * FROM adminlar WHERE email = ?").get(email)

    if (!admin) {
      return NextResponse.json({ xato: "Email yoki parol noto'g'ri" }, { status: 401 })
    }

    // Check password
    let parol_togri = false
    try {
      parol_togri = await bcrypt.compare(parol, admin.parol)
    } catch (error) {
      console.error("Password comparison error:", error)
    }

    if (!parol_togri) {
      return NextResponse.json({ xato: "Email yoki parol noto'g'ri" }, { status: 401 })
    }

    // Generate JWT token
    // JWT_SECRET muhit o'zgaruvchisi orqali olinadi. Ishlab chiqarishda kuchli kalitdan foydalaning!
    const secret = process.env.JWT_SECRET || "default_secret_key_for_development"
    const token = jwt.sign({ admin_id: admin.id, email: admin.email }, secret, {
      expiresIn: "24h",
    })

    return NextResponse.json({ token, admin: { id: admin.id, email: admin.email } })
  } catch (xato) {
    console.error("Login xatosi:", xato)
    return NextResponse.json({ xato: "Tizimda xatolik yuz berdi" }, { status: 500 })
  }
}
