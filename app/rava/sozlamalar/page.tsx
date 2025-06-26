"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface GoogleSheet {
  id: number
  nom: string
  link: string
  varoqlar: string[]
}

export default function AdminSozlamalar() {
  const [googleSheetsLink, setGoogleSheetsLink] = useState("")
  const [saqlangan_sheetlar, setSaqlangan_sheetlar] = useState<GoogleSheet[]>([])
  const [yuklanyapti, setYuklanyapti] = useState(false)

  useEffect(() => {
    sheetlarni_yuklash()
  }, [])

  const sheetlarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/google-sheets")
      const malumot = await javob.json()
      setSaqlangan_sheetlar(malumot)
    } catch (xato) {
      console.error("Sheetlarni yuklashda xato:", xato)
      toast({
        title: "Xato",
        description: "Sheetlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const sheet_qoshish = async () => {
    if (!googleSheetsLink.trim()) return

    setYuklanyapti(true)
    try {
      const javob = await fetch("/api/google-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: googleSheetsLink }),
      })

      if (javob.ok) {
        setGoogleSheetsLink("")
        sheetlarni_yuklash()
        toast({
          title: "Muvaffaqiyatli",
          description: "Google Sheet muvaffaqiyatli qo'shildi",
        })
      } else {
        let xato_xabari = "Noma'lum xato"
        try {
          const xato_malumot = await javob.json()
          xato_xabari = xato_malumot.xato || xato_xabari
        } catch (parseError) {
          // Agar javob JSON bo'lmasa, text sifatida o'qishga harakat qilamiz
          xato_xabari = (await javob.text()) || "Serverdan xato javob keldi."
        }
        throw new Error(xato_xabari)
      }
    } catch (xato) {
      console.error("Sheet qoshishda xato:", xato)
      toast({
        title: "Xato",
        description: xato instanceof Error ? xato.message : "Sheet qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
    setYuklanyapti(false)
  }

  const sheet_ochirish = async (id: number) => {
    try {
      const javob = await fetch(`/api/google-sheets?id=${id}`, {
        method: "DELETE",
      })

      if (javob.ok) {
        sheetlarni_yuklash()
        toast({
          title: "Muvaffaqiyatli",
          description: "Google Sheet o'chirildi",
        })
      } else {
        let xato_xabari = "Noma'lum xato"
        try {
          const xato_malumot = await javob.json()
          xato_xabari = xato_malumot.xato || xato_xabari
        } catch (parseError) {
          // Agar javob JSON bo'lmasa, text sifatida o'qishga harakat qilamiz
          xato_xabari = (await javob.text()) || "Serverdan xato javob keldi."
        }
        throw new Error(xato_xabari)
      }
    } catch (xato) {
      console.error("Sheet ochirishda xato:", xato)
      toast({
        title: "Xato",
        description: xato instanceof Error ? xato.message : "Sheet o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Sozlamalar</h1>
        <p className="text-slate-400">Google Sheets va tizim sozlamalari</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Google Sheets Link Qoshish</CardTitle>
          <CardDescription className="text-slate-400">
            Google Sheets linkini kiriting va varoqlarni koring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheets-link" className="text-slate-300">
              Google Sheets Link
            </Label>
            <Input
              id="sheets-link"
              value={googleSheetsLink}
              onChange={(e) => setGoogleSheetsLink(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <Button onClick={sheet_qoshish} disabled={yuklanyapti} className="bg-teal-600 hover:bg-teal-700">
            {yuklanyapti ? "Qoshilmoqda..." : "Sheet Qoshish"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Saqlangan Google Sheets</CardTitle>
          <CardDescription className="text-slate-400">Qoshilgan sheetlar va ularning varoqlari</CardDescription>
        </CardHeader>
        <CardContent>
          {saqlangan_sheetlar.length === 0 ? (
            <p className="text-slate-400">Hech qanday sheet qoshilmagan</p>
          ) : (
            <div className="space-y-4">
              {saqlangan_sheetlar.map((sheet) => (
                <div key={sheet.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{sheet.nom}</h3>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => sheet_ochirish(sheet.id)}
                      className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{sheet.link}</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(sheet.varoqlar) ? (
                      sheet.varoqlar.map((varoq, index) => (
                        <span key={index} className="bg-teal-600 text-white px-2 py-1 rounded text-sm">
                          {varoq}
                        </span>
                      ))
                    ) : (
                      <span className="text-red-400">Varoqlar ma'lumotini yuklashda xatolik</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
