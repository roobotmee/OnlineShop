import { NextResponse } from "next/server"

// Standart ranglar ro'yxati
const standartRanglar = [
  { nom: "Qora", kod: "#000000" },
  { nom: "Oq", kod: "#FFFFFF" },
  { nom: "Qizil", kod: "#FF0000" },
  { nom: "Yashil", kod: "#00FF00" },
  { nom: "Ko'k", kod: "#0000FF" },
  { nom: "Sariq", kod: "#FFFF00" },
  { nom: "Pushti", kod: "#FF00FF" },
  { nom: "Havorang", kod: "#00FFFF" },
  { nom: "Kulrang", kod: "#808080" },
  { nom: "Jigarrang", kod: "#A52A2A" },
  { nom: "To'q ko'k", kod: "#000080" },
  { nom: "Oltin", kod: "#FFD700" },
  { nom: "Kumush", kod: "#C0C0C0" },
  { nom: "Bronza", kod: "#CD7F32" },
  { nom: "Zangori", kod: "#87CEEB" },
  { nom: "Yashil-ko'k", kod: "#008080" },
  { nom: "Binafsha", kod: "#800080" },
  { nom: "Olovrang", kod: "#FFA500" },
  { nom: "Och yashil", kod: "#90EE90" },
  { nom: "Och ko'k", kod: "#ADD8E6" },
]

export async function GET() {
  try {
    return NextResponse.json(standartRanglar)
  } catch (xato) {
    console.error("Ranglarni yuklashda xato:", xato)
    return NextResponse.json({ xato: "Ranglarni yuklashda xato" }, { status: 500 })
  }
}
