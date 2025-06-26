"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface GoogleSheet {
  id: number
  nom: string
  link: string
  varoqlar: string[]
}

interface YaratilganSahifa {
  id: number
  nom: string
  link: string
  sheet_id: number
  varoq_nomi: string
}

export default function SahifaYaratish() {
  const [sahifa_nomi, setSahifa_nomi] = useState("")
  const [tanlangan_sheet_id, setTanlangan_sheet_id] = useState("")
  const [tanlangan_varoq, setTanlangan_varoq] = useState("")
  const [google_sheetlar, setGoogle_sheetlar] = useState<GoogleSheet[]>([])
  const [yaratilgan_sahifalar, setYaratilgan_sahifalar] = useState<YaratilganSahifa[]>([])
  const [yuklanyapti, setYuklanyapti] = useState(false)

  useEffect(() => {
    sheetlarni_yuklash()
    sahifalarni_yuklash()
  }, [])

  const sheetlarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/google-sheets")
      const malumot = await javob.json()
      setGoogle_sheetlar(malumot)
    } catch (xato) {
      console.error("Sheetlarni yuklashda xato:", xato)
      toast({
        title: "Xato",
        description: "Sheetlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const sahifalarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/sahifalar")
      const malumot = await javob.json()
      setYaratilgan_sahifalar(malumot)
    } catch (xato) {
      console.error("Sahifalarni yuklashda xato:", xato)
      toast({
        title: "Xato",
        description: "Sahifalarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const sahifa_yaratish = async () => {
    if (!sahifa_nomi.trim() || !tanlangan_sheet_id || !tanlangan_varoq) return

    setYuklanyapti(true)
    try {
      const javob = await fetch("/api/sahifalar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: sahifa_nomi,
          sheet_id: Number.parseInt(tanlangan_sheet_id),
          varoq_nomi: tanlangan_varoq,
        }),
      })

      if (javob.ok) {
        setSahifa_nomi("")
        setTanlangan_sheet_id("")
        setTanlangan_varoq("")
        sahifalarni_yuklash()
        toast({
          title: "Muvaffaqiyatli",
          description: "Sahifa muvaffaqiyatli yaratildi",
        })
      } else {
        const xato = await javob.json()
        throw new Error(xato.xato || "Noma'lum xato")
      }
    } catch (xato) {
      console.error("Sahifa yaratishda xato:", xato)
      toast({
        title: "Xato",
        description: xato instanceof Error ? xato.message : "Sahifa yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
    setYuklanyapti(false)
  }

  const linkni_nusxalash = (link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/forma/${link}`)
    toast({
      title: "Nusxalandi",
      description: "Sahifa linki nusxalandi",
    })
  }

  const tanlangan_sheet = google_sheetlar.find((sheet) => sheet.id.toString() === tanlangan_sheet_id)

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Sahifa Yaratish</h1>
        </div>

        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Yangi Forma Sahifasi</CardTitle>
            <CardDescription className="text-slate-400">
              Sahifa nomini kiriting va Google Sheets varogini tanlang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sahifa-nomi" className="text-slate-300">
                Sahifa Nomi
              </Label>
              <Input
                id="sahifa-nomi"
                value={sahifa_nomi}
                onChange={(e) => setSahifa_nomi(e.target.value)}
                placeholder="Sahifa nomini kiriting"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Google Sheet Tanlash</Label>
              <Select value={tanlangan_sheet_id} onValueChange={setTanlangan_sheet_id}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Sheet tanlang" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {google_sheetlar.map((sheet) => (
                    <SelectItem
                      key={sheet.id}
                      value={sheet.id.toString()}
                      className="text-slate-300 hover:bg-slate-700"
                    >
                      {sheet.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tanlangan_sheet && Array.isArray(tanlangan_sheet.varoqlar) && (
              <div className="space-y-2">
                <Label className="text-slate-300">Varoq Tanlash</Label>
                <Select value={tanlangan_varoq} onValueChange={setTanlangan_varoq}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Varoq tanlang" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {tanlangan_sheet.varoqlar.map((varoq, index) => (
                      <SelectItem key={index} value={varoq} className="text-slate-300 hover:bg-slate-700">
                        {varoq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={sahifa_yaratish}
              disabled={yuklanyapti || !tanlangan_sheet_id || !tanlangan_varoq}
            >
              {yuklanyapti ? "Yaratilmoqda..." : "Sahifa Yaratish"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Yaratilgan Sahifalar</CardTitle>
            <CardDescription className="text-slate-400">Barcha yaratilgan forma sahifalari</CardDescription>
          </CardHeader>
          <CardContent>
            {yaratilgan_sahifalar.length === 0 ? (
              <p className="text-slate-400">Hech qanday sahifa yaratilmagan</p>
            ) : (
              <div className="space-y-4">
                {yaratilgan_sahifalar.map((sahifa) => (
                  <div key={sahifa.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">{sahifa.nom}</h3>
                        <p className="text-sm text-slate-300">Varoq: {sahifa.varoq_nomi}</p>
                        <p className="text-sm text-slate-400 font-mono">/forma/{sahifa.link}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => linkni_nusxalash(sahifa.link)}
                          className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Link href={`/forma/${sahifa.link}`} target="_blank">
                          <Button
                            variant="outline"
                            className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                          >
                            Ochish
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
