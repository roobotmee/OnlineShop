"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useParams } from "next/navigation"

interface SahifaMalumoti {
  id: number
  nom: string
  link: string
  sheet_id: number
  varoq_nomi: string
}

export default function FormaPage() {
  const params = useParams()
  const [sahifa_malumoti, setSahifa_malumoti] = useState<SahifaMalumoti | null>(null)
  const [ism, setIsm] = useState("")
  const [telefon, setTelefon] = useState("")
  const [yuborilmoqda, setYuborilmoqda] = useState(false)
  const [yuborildi, setYuborildi] = useState(false)

  useEffect(() => {
    sahifa_malumotini_yuklash()
  }, [params.link])

  const sahifa_malumotini_yuklash = async () => {
    try {
      const javob = await fetch(`/api/sahifalar/${params.link}`)
      if (javob.ok) {
        const malumot = await javob.json()
        setSahifa_malumoti(malumot)
      }
    } catch (xato) {
      console.error("Sahifa malumotini yuklashda xato:", xato)
    }
  }

  const formani_yuborish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ism.trim() || !telefon.trim()) return

    setYuborilmoqda(true)
    try {
      const javob = await fetch("/api/forma-yuborish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sahifa_id: sahifa_malumoti?.id,
          ism,
          telefon,
        }),
      })

      if (javob.ok) {
        setYuborildi(true)
        setIsm("")
        setTelefon("")
      }
    } catch (xato) {
      console.error("Forma yuborishda xato:", xato)
    }
    setYuborilmoqda(false)
  }

  if (!sahifa_malumoti) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-sm sm:text-base">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg sm:text-xl">{sahifa_malumoti.nom}</CardTitle>
          <CardDescription className="text-sm sm:text-base">Malumotlaringizni kiriting</CardDescription>
        </CardHeader>
        <CardContent>
          {yuborildi ? (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-base sm:text-lg font-semibold">
                Malumotlaringiz muvaffaqiyatli yuborildi!
              </div>
              <Button onClick={() => setYuborildi(false)} className="w-full sm:w-auto">
                Yana yuborish
              </Button>
            </div>
          ) : (
            <form onSubmit={formani_yuborish} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ism" className="text-sm sm:text-base">
                  Ism
                </Label>
                <Input
                  id="ism"
                  value={ism}
                  onChange={(e) => setIsm(e.target.value)}
                  placeholder="Ismingizni kiriting"
                  className="text-sm sm:text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon" className="text-sm sm:text-base">
                  Telefon raqam
                </Label>
                <Input
                  id="telefon"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="text-sm sm:text-base"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base"
                disabled={yuborilmoqda}
              >
                {yuborilmoqda ? "Yuborilmoqda..." : "Yuborish"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
