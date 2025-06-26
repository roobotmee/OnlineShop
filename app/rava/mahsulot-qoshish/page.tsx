"use client"

import type React from "react"
import { UploadClient } from "@uploadcare/upload-client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Copy, Upload, X, ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BASE_URL } from "@/http"

interface GoogleSheet {
  id: number
  nom: string
  link: string
  varoqlar: string[]
}

interface Mahsulot {
  id: number
  nom: string
  tavsif: string
  narx: number
  chegirma_narx: number | null
  miqdor: number
  sheet_id: number
  varoq_nomi: string
  link: string
  ranglar: { rang: string; rasm: string }[]
  rasmlar: string[]
}

interface Rang {
  rang: string
  rasm: string
}

interface StandartRang {
  nom: string
  kod: string
}

export default function MahsulotQoshish() {
  const [mahsulot_nomi, setMahsulot_nomi] = useState("")
  const [tavsif, setTavsif] = useState("")
  const [narx, setNarx] = useState("")
  const [chegirma_narx, setChegirma_narx] = useState("")
  const [miqdor, setMiqdor] = useState("")
  const [tanlangan_sheet_id, setTanlangan_sheet_id] = useState("")
  const [tanlangan_varoq, setTanlangan_varoq] = useState("")
  const [google_sheetlar, setGoogle_sheetlar] = useState<GoogleSheet[]>([])
  const [yaratilgan_mahsulotlar, setYaratilgan_mahsulotlar] = useState<Mahsulot[]>([])
  const [ranglar, setRanglar] = useState<Rang[]>([])
  const [standartRanglar, setStandartRanglar] = useState<StandartRang[]>([])
  const [yuklanyapti, setYuklanyapti] = useState(false)
  const [mahsulotRasmlari, setMahsulotRasmlari] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rangFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  const uploadClient = new UploadClient({ publicKey: "e7f698ac515e7bc2a498" }) 

  useEffect(() => {
    sheetlarni_yuklash()
    mahsulotlarni_yuklash()
    standartRanglarniYuklash()
  }, [])

  const standartRanglarniYuklash = async () => {
    try {
      const javob = await fetch("/api/ranglar")
      if (javob.ok) {
        const malumot = await javob.json()
        setStandartRanglar(malumot)
      }
    } catch (xato) {
      console.error("Standart ranglarni yuklashda xato:", xato)
    }
  }

  const sheetlarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/google-sheets")
      if (javob.ok) {
        const malumot = await javob.json()
        setGoogle_sheetlar(malumot)
      }
    } catch (xato) {
      console.error("Sheetlarni yuklashda xato:", xato)
    }
  }

  const mahsulotlarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/mahsulotlar")
      if (javob.ok) {
        const malumot = await javob.json()
        setYaratilgan_mahsulotlar(malumot)
      }
    } catch (xato) {
      console.error("Mahsulotlarni yuklashda xato:", xato)
    }
  }

  const rang_qoshish = () => {
    setRanglar([...ranglar, { rang: "", rasm: "" }])
  }

  const rang_ochirish = (index: number) => {
    setRanglar(ranglar.filter((_, i) => i !== index))
  }

  const rang_ozgartirish = (index: number, maydon: string, qiymat: string) => {
    const yangi_ranglar = [...ranglar]
    yangi_ranglar[index] = { ...yangi_ranglar[index], [maydon]: qiymat }
    setRanglar(yangi_ranglar)
  }

  const chegirma_foizini_hisoblash = () => {
    if (narx && chegirma_narx) {
      const asl_narx = Number.parseFloat(narx)
      const chegirma = Number.parseFloat(chegirma_narx)
      if (asl_narx > chegirma) {
        return Math.round(((asl_narx - chegirma) / asl_narx) * 100)
      }
    }
    return 0
  }

const rasmYuklash = async (file: File): Promise<string> => {
  try {
    const result = await uploadClient.uploadFile(file)
    return result.cdnUrl // bu URL ni siz frontendga saqlaysiz
  } catch (err) {
    console.error("Yuklashda xatolik:", err)
    throw new Error("Rasm yuklashda xato yuz berdi")
  }
}

const mahsulotRasmYuklash = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  try {
    const fayllar = Array.from(files)

    // Yuklashlar
    const yuklashNatijalari = await Promise.all(
      fayllar.map((file) => rasmYuklash(file))
    )

    // URLlarni holatga qo‘shish
    setMahsulotRasmlari((oldin) => [...oldin, ...yuklashNatijalari])

    toast({
      title: "✅ Muvaffaqiyatli",
      description: `${fayllar.length} ta rasm yuklandi`,
    })
  } catch (err) {
    console.error("❌ Rasm yuklashda xato:", err)
    toast({
      title: "Xatolik",
      description: "Rasm yuklashda xatolik yuz berdi",
      variant: "destructive",
    })
  } finally {
    // Fayl inputni tozalash (shu inputni qayta ishlatish uchun)
    e.target.value = ""
  }
}


  const rasmOchirish = (index: number) => {
    setMahsulotRasmlari((prev) => prev.filter((_, i) => i !== index))
  }

  const rangRasmYuklash = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      const file = e.target.files[0]
      const url = await rasmYuklash(file)
      rang_ozgartirish(index, "rasm", url)
      toast({
        title: "Muvaffaqiyatli",
        description: "Rang rasmi yuklandi",
      })
    } catch (xato) {
      console.error("Rasm yuklashda xato:", xato)
      toast({
        title: "Xato",
        description: "Rasm yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  // mahsulot_yaratish funksiyasini yangilash - server xatosini to'g'ri qayta ishlash
  const mahsulot_yaratish = async () => {
    if (!mahsulot_nomi.trim() || !narx || !miqdor || !tanlangan_sheet_id || !tanlangan_varoq) {
      toast({
        title: "Xato",
        description: "Barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      })
      return
    }

    // Faqat to'liq ranglarni olamiz
    const toliq_ranglar = ranglar.filter((r) => r.rang.trim() && r.rasm.trim())

    setYuklanyapti(true)
    try {
      const malumot = {
        nom: mahsulot_nomi,
        tavsif: tavsif || "",
        narx: Number.parseFloat(narx),
        chegirma_narx: chegirma_narx ? Number.parseFloat(chegirma_narx) : null,
        miqdor: Number.parseInt(miqdor),
        sheet_id: Number.parseInt(tanlangan_sheet_id),
        varoq_nomi: tanlangan_varoq,
        ranglar: toliq_ranglar,
        rasmlar: mahsulotRasmlari,
      }

      const javob = await fetch("/api/mahsulotlar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(malumot),
      })

      // Server javobini tekshirish
      if (!javob.ok) {
        let xato_matni = "Mahsulot yaratishda xato yuz berdi"

        // JSON formatdagi xato xabarini olishga harakat qilish
        try {
          const xato_javob = await javob.json()
          if (xato_javob && xato_javob.xato) {
            xato_matni = xato_javob.xato
          } else {
            xato_matni = `Server xatosi: ${javob.status}`
          }
        } catch (parseError) {
          // JSON parse qilishda xato bo'lsa
          console.error("JSON parse xatosi:", parseError)
          xato_matni = `Server xatosi: ${javob.status}`
        }

        throw new Error(xato_matni)
      }

      // Muvaffaqiyatli javob
      const natija = await javob.json()

      // Formani tozalash
      setMahsulot_nomi("")
      setTavsif("")
      setNarx("")
      setChegirma_narx("")
      setMiqdor("")
      setTanlangan_sheet_id("")
      setTanlangan_varoq("")
      setRanglar([])
      setMahsulotRasmlari([])

      mahsulotlarni_yuklash()
      toast({
        title: "Muvaffaqiyatli",
        description: "Mahsulot muvaffaqiyatli yaratildi",
      })
    } catch (xato) {
      console.error("Mahsulot yaratishda xato:", xato)
      toast({
        title: "Xato",
        description: xato instanceof Error ? xato.message : "Mahsulot yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setYuklanyapti(false)
    }
  }

  const linkni_nusxalash = (link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/mahsulot/${link}`)
    toast({
      title: "Nusxalandi",
      description: "Mahsulot linki nusxalandi",
    })
  }

  const tanlangan_sheet = google_sheetlar.find((sheet) => sheet.id.toString() === tanlangan_sheet_id)

  const rangniTanlash = (index: number, rang: StandartRang) => {
    rang_ozgartirish(index, "rang", rang.nom)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mahsulot Qoshish</h1>
        <p className="text-slate-400">Yangi mahsulot qo'shish va boshqarish</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Yangi Mahsulot</CardTitle>
          <CardDescription className="text-slate-400">Mahsulot ma'lumotlarini kiriting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mahsulot-nomi" className="text-slate-300">
                Mahsulot Nomi *
              </Label>
              <Input
                id="mahsulot-nomi"
                value={mahsulot_nomi}
                onChange={(e) => setMahsulot_nomi(e.target.value)}
                placeholder="Mahsulot nomini kiriting"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="miqdor" className="text-slate-300">
                Miqdor *
              </Label>
              <Input
                id="miqdor"
                type="number"
                value={miqdor}
                onChange={(e) => setMiqdor(e.target.value)}
                placeholder="Mavjud miqdor"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Mahsulot rasmlari yuklash */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Mahsulot Rasmlari</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Plus className="h-4 w-4" />
                Rasm Qoshish
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={mahsulotRasmYuklash}
            />

            {mahsulotRasmlari.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-slate-600 rounded-lg bg-slate-700">
                <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400">Mahsulot rasmlari qo'shilmagan. "Rasm Qoshish" tugmasini bosing.</p>
                <p className="text-slate-400 text-sm mt-2">Bir nechta rasm tanlash mumkin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{mahsulotRasmlari.map((rasm, index) => (
  <div key={index} className="relative group">
    <div className="aspect-square rounded-lg overflow-hidden bg-slate-700">
      <img
        src={rasm || "/placeholder.svg"}
        alt={`Mahsulot rasmi ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>

    <Button
      variant="destructive"
      size="icon"
      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => rasmOchirish(index)}
    >
      <X className="h-4 w-4" />
    </Button>

    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
      {index + 1}
    </div>
  </div>
))}

              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tavsif" className="text-slate-300">
              Tavsif
            </Label>
            <Textarea
              id="tavsif"
              value={tavsif}
              onChange={(e) => setTavsif(e.target.value)}
              placeholder="Mahsulot haqida ma'lumot"
              rows={3}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="narx" className="text-slate-300">
                Narx *
              </Label>
              <Input
                id="narx"
                type="number"
                value={narx}
                onChange={(e) => setNarx(e.target.value)}
                placeholder="Asosiy narx"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chegirma-narx" className="text-slate-300">
                Chegirma Narxi
              </Label>
              <Input
                id="chegirma-narx"
                type="number"
                value={chegirma_narx}
                onChange={(e) => setChegirma_narx(e.target.value)}
                placeholder="Chegirma narxi (ixtiyoriy)"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              {chegirma_foizini_hisoblash() > 0 && (
                <p className="text-sm text-green-400">Chegirma: {chegirma_foizini_hisoblash()}%</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Ranglar va Rasmlar</Label>
              <Button
                type="button"
                variant="outline"
                onClick={rang_qoshish}
                className="flex items-center gap-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Plus className="h-4 w-4" />
                Rang Qoshish
              </Button>
            </div>

            {ranglar.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-slate-600 rounded-lg bg-slate-700">
                <p className="text-slate-400">
                  Ranglar qo'shilmagan. Rang qo'shish uchun "Rang Qoshish" tugmasini bosing.
                </p>
                <p className="text-slate-400 text-sm mt-2">Ranglar bo'lmasa ham mahsulot yaratish mumkin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ranglar.map((rang, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-end border border-slate-600 p-4 rounded-lg relative bg-slate-700"
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => rang_ochirish(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex-1 space-y-2">
                      <Label className="text-slate-300">Rang</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                            >
                              {rang.rang ? (
                                <span>{rang.rang}</span>
                              ) : (
                                <span className="text-slate-400">Rang tanlang</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 bg-slate-800 border-slate-700">
                            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2">
                              {standartRanglar.map((standartRang) => (
                                <Button
                                  key={standartRang.nom}
                                  variant="outline"
                                  className="justify-start gap-2 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                                  onClick={() => rangniTanlash(index, standartRang)}
                                >
                                  <div
                                    className="w-4 h-4 rounded-full border border-slate-500"
                                    style={{ backgroundColor: standartRang.kod }}
                                  />
                                  <span>{standartRang.nom}</span>
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          value={rang.rang}
                          onChange={(e) => rang_ozgartirish(index, "rang", e.target.value)}
                          placeholder="Rang nomi"
                          className="bg-slate-600 border-slate-500 text-white placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label className="text-slate-300">Rasm</Label>
                      <div className="flex gap-2">
                        <div
                          className="border-2 border-dashed border-slate-600 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors w-20 h-20 bg-slate-600"
                          onClick={() => rangFileInputRefs.current[index]?.click()}
                        >
                          {rang.rasm ? (
                            <div className="relative w-full h-full">
                              <img
                                src={rang.rasm || "/placeholder.svg"}
                                alt={rang.rang}
                                className="w-full h-full object-cover rounded-md"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-0 right-0 h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  rang_ozgartirish(index, "rasm", "")
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Upload className="h-6 w-6 text-slate-400" />
                          )}
                          <input
                            type="file"
                            ref={(el) => { rangFileInputRefs.current[index] = el }}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => rangRasmYuklash(e, index)}
                          />
                        </div>
                        <Input
                          value={rang.rasm}
                          onChange={(e) => rang_ozgartirish(index, "rasm", e.target.value)}
                          placeholder="Rasm URL"
                          className="flex-1 bg-slate-600 border-slate-500 text-white placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Google Sheet Tanlash *</Label>
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
                <Label className="text-slate-300">Varoq Tanlash *</Label>
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
          </div>

          <Button onClick={mahsulot_yaratish} disabled={yuklanyapti} className="w-full bg-teal-600 hover:bg-teal-700">
            {yuklanyapti ? "Yaratilmoqda..." : "Mahsulot Yaratish"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Yaratilgan Mahsulotlar</CardTitle>
          <CardDescription className="text-slate-400">Barcha yaratilgan mahsulotlar</CardDescription>
        </CardHeader>
        <CardContent>
          {yaratilgan_mahsulotlar.length === 0 ? (
            <p className="text-slate-400">Hech qanday mahsulot yaratilmagan</p>
          ) : (
            <div className="space-y-4">
              {yaratilgan_mahsulotlar.map((mahsulot) => (
                <div key={mahsulot.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden">
                        <img
                          src={
                            mahsulot.rasmlar && mahsulot.rasmlar.length > 0
                              ? mahsulot.rasmlar[0]
                              : mahsulot.ranglar.length > 0
                                ? mahsulot.ranglar[0].rasm
                                : "/placeholder.svg?height=64&width=64"
                          }
                          alt={mahsulot.nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{mahsulot.nom}</h3>
                        <p className="text-sm text-slate-300">
                          Narx: {mahsulot.narx.toLocaleString()} so'm
                          {mahsulot.chegirma_narx && (
                            <span className="text-green-400 ml-2">
                              (Chegirma: {mahsulot.chegirma_narx.toLocaleString()} so'm)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-300">Miqdor: {mahsulot.miqdor}</p>
                        <p className="text-sm text-slate-300">Varoq: {mahsulot.varoq_nomi}</p>
                        <p className="text-sm text-slate-400 font-mono">/mahsulot/{mahsulot.link}</p>
                        {mahsulot.rasmlar && mahsulot.rasmlar.length > 0 && (
                          <p className="text-sm text-slate-400">{mahsulot.rasmlar.length} ta rasm</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => linkni_nusxalash(mahsulot.link)}
                        className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <a href={`/mahsulot/${mahsulot.link}`} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                        >
                          Ochish
                        </Button>
                      </a>
                    </div>
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
