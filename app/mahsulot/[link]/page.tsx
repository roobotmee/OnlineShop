"use client"

import type React from "react"

import { useState, useEffect, Suspense, useRef } from "react" // useRef qo'shildi
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PhoneInput } from "@/components/ui/phone-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
// import { OptimizedImage } from "@/components/ui/image-optimized" // OptimizedImage hali ham izohlangan
import { ProductSkeleton } from "@/components/ui/loading-skeleton"
import { useParams } from "next/navigation"
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Check, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

// Lazy load heavy components
const LazyDialog = dynamic(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog })), {
  loading: () => <div>Loading...</div>,
})

interface MahsulotMalumoti {
  id: number
  nom: string
  tavsif: string
  narx: number
  chegirma_narx: number | null
  miqdor: number
  sheet_id: number
  varoq_nomi: string
  ranglar: { rang: string; rasm: string }[]
  rasmlar: string[]
}

interface TolovVarianti {
  oy: number
  foiz: number
  nom: string
}

const tolov_variantlari: TolovVarianti[] = [
  { oy: 3, foiz: 10, nom: "3 oy" },
  { oy: 6, foiz: 29, nom: "6 oy" },
  { oy: 12, foiz: 44, nom: "12 oy" },
]

function MahsulotContent() {
  const params = useParams()
  const [mahsulot, setMahsulot] = useState<MahsulotMalumoti | null>(null)
  const [tanlangan_rang, setTanlangan_rang] = useState(0)
  const [tanlangan_rasm, setTanlangan_rasm] = useState(0)
  const [tanlangan_tolov, setTanlangan_tolov] = useState<"toliq" | number>(3) // Standart qiymat 3 oyga o'zgartirildi
  const [ism, setIsm] = useState("")
  const [telefon, setTelefon] = useState("+998 ")
  const [yuborilmoqda, setYuborilmoqda] = useState(false)
  const [modal_ochiq, setModal_ochiq] = useState(false)
  const [loading, setLoading] = useState(true)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [uzumWindowRef, setUzumWindowRef] = useState<Window | null>(null) // Uzum Nasiya oynasi uchun ref

  // Swipe uchun holatlar
  const startX = useRef(0)
  const isSwiping = useRef(false)

  useEffect(() => {
    mahsulot_malumotini_yuklash()
  }, [params.link])

  const mahsulot_malumotini_yuklash = async () => {
    try {
      setLoading(true)
      const javob = await fetch(`/api/mahsulotlar/${params.link}`, {
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      })
      if (javob.ok) {
        const malumot = await javob.json()
        setMahsulot(malumot)
        console.log("Yuklangan mahsulot ma'lumotlari:", malumot) // Debugging log
      }
    } catch (xato) {
      console.error("Mahsulot malumotini yuklashda xato:", xato)
    } finally {
      setLoading(false)
    }
  }

  // Telefon raqamni tozalash funksiyasi
  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/[^\d]/g, "")
  }

  // Uzum Nasiya ga yo'naltirish funksiyasi
  const redirectToUzumNasiya = (phoneNumber: string, windowRef: Window | null) => {
    try {
      const cleanedPhone = cleanPhoneNumber(phoneNumber)
      const uzumNasiyaUrl = `https://auth.uzumnasiya.uz/?phone=${cleanedPhone}`

      if (!windowRef || windowRef.closed) {
        // Oyna yopilgan bo'lsa ham yangisini ochish
        const newWindow = window.open(uzumNasiyaUrl, "_blank")
        if (!newWindow) {
          setPopupBlocked(true)
          toast({
            title: "Popup bloklangan",
            description: "Brauzeringiz yangi oyna ochishga ruxsat bermadi. Qo'lda ochish uchun tugmani bosing.",
            variant: "destructive",
            duration: 10000,
          })
          return null // Oyna ochilmadi
        }
        setUzumWindowRef(newWindow) // Yangi oyna refini saqlash
        windowRef = newWindow // Hozirgi chaqiruv uchun ham ishlatish
      } else {
        // Agar windowRef mavjud bo'lsa, uni qayta ishlatish va URLni o'zgartirish
        windowRef.location.href = uzumNasiyaUrl
        windowRef.focus()
      }

      setPopupBlocked(false) // Agar oldin bloklangan bo'lsa va hozir muvaffaqiyatli bo'lsa, holatni tiklash
      toast({
        title: "Uzum Nasiya ochildi",
        description: "Telefon raqamingiz avtomatik kiritiladi",
        duration: 5000,
      })
      navigator.clipboard.writeText(cleanedPhone).then(() => {
        toast({
          title: "Telefon raqam nusxalandi",
          description: "Agar avtomatik kiritilmasa, Ctrl+V bosing",
          duration: 5000,
        })
      })
      windowRef.focus()
      setTimeout(() => {
        try {
          // Bu script Uzum Nasiya saytida ishlaydi
          windowRef?.postMessage(
            {
              action: "FILL_PHONE",
              phone: cleanedPhone,
            },
            "https://auth.uzumnasiya.uz",
          )
        } catch (err) {
          console.log("Avtomatik to'ldirish ishlamadi")
        }
      }, 1500)
      return windowRef // Oyna ochildi
    } catch (error) {
      console.error("Uzum Nasiya ga yo'naltirishda xato:", error)
      return null // Xato yuz berdi
    }
  }

  const buyurtma_berish = async () => {
    if (!ism.trim() || !telefon.trim() || telefon === "+998 ") {
      toast({
        title: "Xato",
        description: "Ism va telefon raqamni to'liq kiriting",
        variant: "destructive",
      })
      return
    }

    setYuborilmoqda(true)

    // 1. Avval Uzum Nasiya oynasini ochishga urinish
    // Bu chaqiruv foydalanuvchi tugmani bosgan zahoti amalga oshiriladi,
    // bu popup bloklanishini oldini olishga yordam beradi.
    const currentUzumWindow = redirectToUzumNasiya(telefon, uzumWindowRef)

    if (!currentUzumWindow && popupBlocked) {
      // Agar popup bloklangan bo'lsa, buyurtmani saqlashni davom ettirmaymiz
      // Foydalanuvchi qo'lda tugmani bosishi kerak
      setYuborilmoqda(false)
      return
    }

    try {
      // 2. Ma'lumotlarni saqlash
      const javob = await fetch("/api/buyurtma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mahsulot_id: mahsulot?.id,
          ism,
          telefon,
          tanlangan_rang: mahsulot?.ranglar.length ? mahsulot?.ranglar[tanlangan_rang]?.rang : "Standart",
          tolov_usuli: tanlangan_tolov,
          tolov_miqdori: hozirgi_narx(),
        }),
      })

      if (javob.ok) {
        const natija = await javob.json()
        toast({
          title: "Buyurtma qabul qilindi!",
          description: `Ma'lumotlar ${natija.sheets_saqlandi ? "Google Sheets va" : ""} ma'lumotlar bazasiga saqlandi`,
        })
        setModal_ochiq(false)
        setIsm("")
        setTelefon("+998 ")

        // Agar oyna muvaffaqiyatli ochilgan bo'lsa, postMessage yuborish
        if (currentUzumWindow) {
          setTimeout(() => {
            try {
              currentUzumWindow.postMessage(
                {
                  action: "FILL_PHONE",
                  phone: cleanPhoneNumber(telefon),
                },
                "https://auth.uzumnasiya.uz",
              )
            } catch (err) {
              console.log("Avtomatik to'ldirish ishlamadi (ikkinchi urinish)")
            }
          }, 1500)
        }
      } else {
        const xato = await javob.json()
        throw new Error(xato.xato || "Noma'lum xato")
      }
    } catch (xato) {
      console.error("Buyurtma berishda xato:", xato)
      toast({
        title: "Xato",
        description: xato instanceof Error ? xato.message : "Buyurtma berishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
    setYuborilmoqda(false)
  }

  const hozirgi_narx = () => {
    if (!mahsulot) return 0
    return mahsulot.chegirma_narx || mahsulot.narx
  }

  const muddatli_tolov_hisoblash = (oy: number) => {
    const variant = tolov_variantlari.find((v) => v.oy === oy)
    if (!variant) return { jami: 0, oylik: 0 }

    const asosiy_narx = hozirgi_narx()
    const qoshimcha_foiz = (asosiy_narx * variant.foiz) / 100
    const jami_narx = asosiy_narx + qoshimcha_foiz
    const oylik_tolov = Math.ceil(jami_narx / oy)

    return { jami: jami_narx, oylik: oylik_tolov }
  }

  const keyingi_rasm = () => {
    if (!mahsulot) return
    const jami_rasmlar = barcha_rasmlar.length // Barcha rasmlar uzunligini ishlatish
    setTanlangan_rasm((prev) => (prev + 1) % jami_rasmlar)
  }

  const oldingi_rasm = () => {
    if (!mahsulot) return
    const jami_rasmlar = barcha_rasmlar.length // Barcha rasmlar uzunligini ishlatish
    setTanlangan_rasm((prev) => (prev - 1 + jami_rasmlar) % jami_rasmlar)
  }

  // Swipe hodisalari
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    isSwiping.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return
    // Bu yerda swipe paytida vizual feedback berish mumkin
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) return
    const endX = e.changedTouches[0].clientX
    const diffX = startX.current - endX
    const swipeThreshold = 50 // Swipe aniqlash uchun minimal masofa (pikselda)

    if (diffX > swipeThreshold) {
      keyingi_rasm() // Chapga surish
    } else if (diffX < -swipeThreshold) {
      oldingi_rasm() // O'ngga surish
    }
    isSwiping.current = false
  }

  // Mouse drag hodisalari (desktop uchun)
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX
    isSwiping.current = true
    e.preventDefault() // Rasmni tortishni oldini olish
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping.current) return
    // Bu yerda drag paytida vizual feedback berish mumkin
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isSwiping.current) return
    const endX = e.clientX
    const diffX = startX.current - endX
    const swipeThreshold = 50

    if (diffX > swipeThreshold) {
      keyingi_rasm()
    } else if (diffX < -swipeThreshold) {
      oldingi_rasm()
    }
    isSwiping.current = false
  }

  const handleMouseLeave = () => {
    // Agar sichqoncha elementdan chiqib ketsa, swiping holatini tiklash
    isSwiping.current = false
  }

  // Qo'lda Uzum Nasiya ga yo'naltirish
  const manualRedirect = () => {
    redirectToUzumNasiya(telefon, null) // Yangi oyna ochishga urinish
  }

  if (loading) {
    return <ProductSkeleton />
  }

  if (!mahsulot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Mahsulot topilmadi</p>
        </div>
      </div>
    )
  }

  // Barcha rasmlarni birlashtirish - null va undefined qiymatlarni filtrlash
  const barcha_rasmlar = [
    ...(mahsulot.rasmlar || []).filter(Boolean),
    ...(mahsulot.ranglar || []).map((r) => r.rasm).filter(Boolean),
  ]

  // Asosiy rasm - fallback bilan
  const asosiy_rasm = barcha_rasmlar.length > 0 ? barcha_rasmlar[tanlangan_rasm] || barcha_rasmlar[0] : null

  console.log("Barcha rasmlar:", barcha_rasmlar) // Debugging log
  console.log("Asosiy rasm URL:", asosiy_rasm) // Debugging log

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-start items-center">
            {" "}
            {/* justify-start ga o'zgartirildi */}
            {/* Left side - Back button or empty space */}
            {/* Bu yerda agar kerak bo'lsa, orqaga qaytish tugmasini qo'shishingiz mumkin */}
            {/* Mahsulot nomi */}
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate max-w-[calc(100vw-120px)] sm:max-w-none">
                {mahsulot.nom}
              </span>
            </div>
            {/* Right side - Theme toggle */}
            <div className="ml-auto flex items-center">
              {" "}
              {/* ml-auto qo'shildi */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            {/* Asosiy rasm - Optimized */}
            <div
              className="relative aspect-square bg-muted/20 rounded-xl overflow-hidden shadow-lg border border-border/50 cursor-grab"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave} // Sichqoncha chiqib ketganda holatni tiklash
            >
              {asosiy_rasm && asosiy_rasm !== "/placeholder.svg?height=500&width=500" ? (
                <img
                  src={asosiy_rasm || "/placeholder.svg"}
                  alt={mahsulot.nom}
                  width={500} // Kenglikni o'zingizga moslab o'zgartiring
                  height={500} // Balandlikni o'zingizga moslab o'zgartiring
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Rasm yuklanmoqda...</p>
                  </div>
                </div>
              )}

              {/* Navigation arrows - only show if there are multiple images */}
              {barcha_rasmlar.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background border-border/50 h-8 w-8 sm:h-10 sm:w-10 shadow-md"
                    onClick={oldingi_rasm}
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background border-border/50 h-8 w-8 sm:h-10 sm:w-10 shadow-md"
                    onClick={keyingi_rasm}
                  >
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs sm:text-sm backdrop-blur-sm">
                    {tanlangan_rasm + 1} / {barcha_rasmlar.length}
                  </div>
                </>
              )}
            </div>

            {/* Dots indicator */}
            {barcha_rasmlar.length > 1 && (
              <div className="flex justify-center space-x-2">
                {barcha_rasmlar.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setTanlangan_rasm(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      tanlangan_rasm === index ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Ranglar - Optimized images */}
            {mahsulot.ranglar && mahsulot.ranglar.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Mavjud ranglar:</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mahsulot.ranglar.map((rang, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setTanlangan_rang(index)
                        const rang_rasm_index = (mahsulot.rasmlar?.length || 0) + index
                        setTanlangan_rasm(rang_rasm_index)
                      }}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        tanlangan_rang === index
                          ? "border-primary shadow-md scale-105"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {rang.rasm ? (
                        <img
                          src={rang.rasm || "/placeholder.svg"}
                          alt={rang.rang}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground text-center px-1">{rang.rang}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground break-words">{mahsulot.nom}</h1>
              <div className="flex items-center mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs sm:text-sm text-muted-foreground ml-2">(4.8) • 127 ta sharh</span>
              </div>
            </div>

            {/* Narx va muddatli to'lov */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Muddatli to'lov:</span>
                <span className="text-foreground text-sm font-medium">Mahsulot narxi:</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-lg sm:text-xl font-bold text-primary">
                  {tanlangan_tolov === "toliq"
                    ? `${hozirgi_narx().toLocaleString()} so'm`
                    : `${muddatli_tolov_hisoblash(tanlangan_tolov as number).oylik.toLocaleString()} so'm / ${
                        tanlangan_tolov
                      } oy`}
                </div>
                <div className="text-lg sm:text-xl font-bold text-foreground">
                  {hozirgi_narx().toLocaleString()} so'm
                </div>
              </div>

              {mahsulot.chegirma_narx && (
                <div className="flex justify-end">
                  <span className="text-sm text-muted-foreground line-through">
                    {mahsulot.narx.toLocaleString()} so'm
                  </span>
                </div>
              )}
            </div>

            {/* To'lov usuli */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm sm:text-base text-foreground">To'lov usuli</h3>
              <div className="bg-muted/50 rounded-lg p-1 flex space-x-1">
                {tolov_variantlari.map((variant) => (
                  <button
                    key={variant.oy}
                    onClick={() => setTanlangan_tolov(variant.oy)}
                    className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      tanlangan_tolov === variant.oy
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    x{variant.oy} oy
                  </button>
                ))}
                <button
                  onClick={() => setTanlangan_tolov("toliq")}
                  className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    tanlangan_tolov === "toliq"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  To'liq to'lov
                </button>
              </div>
            </div>

            {/* To'lov ma'lumotlari kartasi */}
            <Card className="border-2 border-primary/20 bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">TS</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {tanlangan_tolov === "toliq"
                        ? `${hozirgi_narx().toLocaleString()} so'm`
                        : `${muddatli_tolov_hisoblash(tanlangan_tolov as number).oylik.toLocaleString()} so'm`}
                    </span>
                  </div>
                  <Check className="h-5 w-5 text-primary-foreground bg-primary rounded-full p-1" />
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>To'lov muddati</span>
                    <span className="font-medium text-foreground">
                      {tanlangan_tolov === "toliq" ? "Bir martalik" : `${tanlangan_tolov} oy`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oylik to'lov</span>
                    <span className="font-medium text-foreground">
                      {tanlangan_tolov === "toliq"
                        ? `${hozirgi_narx().toLocaleString()} so'm`
                        : `${muddatli_tolov_hisoblash(tanlangan_tolov as number).oylik.toLocaleString()} so'm`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>To'lovning oxirgi sanasi</span>
                    <span className="font-medium text-foreground">
                      {tanlangan_tolov === "toliq"
                        ? new Date().toLocaleDateString("uz-UZ") // Bugungi sana
                        : new Date(
                            Date.now() + (tanlangan_tolov as number) * 30 * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mahsulot xususiyatlari va Tavsif */}
            <div className="border-t pt-4">
              <div className="flex border-b">
                <button className="px-4 py-2 border-b-2 border-primary text-primary font-medium text-sm">
                  Mahsulot xususiyatlari
                </button>
                <button className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
                  Tavsif
                </button>
              </div>
              <div className="pt-4">
                {mahsulot.tavsif && <p className="text-muted-foreground text-sm sm:text-base">{mahsulot.tavsif}</p>}
              </div>
            </div>

            {/* Desktop buyurtma tugmasi */}
            <div className="hidden sm:block space-y-4">
              {/* Compact payment options above button */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    {tanlangan_tolov === "toliq" ? "To'liq to'lov" : `${tanlangan_tolov} oyga bo'lib`}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {tanlangan_tolov === "toliq"
                      ? `${hozirgi_narx().toLocaleString()} so'm`
                      : `${muddatli_tolov_hisoblash(tanlangan_tolov as number).oylik.toLocaleString()} so'm`}
                  </div>
                </div>
                <div className="flex space-x-1">
                  {tolov_variantlari.map((variant) => (
                    <button
                      key={variant.oy}
                      onClick={() => setTanlangan_tolov(variant.oy)}
                      className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors border ${
                        tanlangan_tolov === variant.oy
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background/50 text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {variant.nom}
                    </button>
                  ))}
                  <button
                    onClick={() => setTanlangan_tolov("toliq")}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors border ${
                      tanlangan_tolov === "toliq"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background/50 text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    To'liq
                  </button>
                </div>
              </div>

              <Dialog open={modal_ochiq} onOpenChange={setModal_ochiq}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm sm:text-base shadow-lg"
                    disabled={mahsulot.miqdor === 0}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {mahsulot.miqdor > 0 ? "Buyurtma Berish" : "Tugagan"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md bg-card border-border/50">
                  <DialogHeader>
                    <DialogTitle className="text-sm sm:text-base">Buyurtma Berish</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      {mahsulot.nom}{" "}
                      {mahsulot.ranglar.length > 0 ? `- ${mahsulot.ranglar[tanlangan_rang]?.rang} rang` : ""}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ism" className="text-sm">
                        Ism *
                      </Label>
                      <Input
                        id="ism"
                        value={ism}
                        onChange={(e) => setIsm(e.target.value)}
                        placeholder="Ismingizni kiriting"
                        className="text-sm border-border/50 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefon" className="text-sm">
                        Telefon raqam *
                      </Label>
                      <PhoneInput id="telefon" value={telefon} onChange={setTelefon} />
                    </div>

                    {/* Popup bloklangan bo'lsa ko'rsatiladigan qism */}
                    {popupBlocked && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-3">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm mb-2">
                          ⚠️ Popup bloklangan
                        </h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                          Buyurtmani saqlash va Uzum Nasiya ga o'tish uchun quyidagi tugmani bosing:
                        </p>
                        <Button
                          onClick={manualRedirect}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          size="sm"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Uzum Nasiya ga o'tish
                        </Button>
                      </div>
                    )}

                    <Button
                      onClick={buyurtma_berish}
                      disabled={yuborilmoqda}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm"
                    >
                      {yuborilmoqda ? "Yuborilmoqda..." : "Buyurtma Berish"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
                <div className="space-y-1">
                  <div className="font-semibold">Tez Yetkazish</div>
                  <div className="text-muted-foreground">24 soat ichida</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">Kafolat</div>
                  <div className="text-muted-foreground">1 yil</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">Qo'llab-quvvatlash</div>
                  <div className="text-muted-foreground">24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed buyurtma tugmasi */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border/50 p-4 z-50">
        {/* Mobile compact payment options */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground">
              {tanlangan_tolov === "toliq" ? "To'liq to'lov" : `${tanlangan_tolov} oyga bo'lib`}
            </div>
            <div className="text-base font-bold text-primary">
              {tanlangan_tolov === "toliq"
                ? `${hozirgi_narx().toLocaleString()} so'm`
                : `${muddatli_tolov_hisoblash(tanlangan_tolov as number).oylik.toLocaleString()} so'm`}
            </div>
          </div>
          <div className="flex space-x-1">
            {tolov_variantlari.map((variant) => (
              <button
                key={variant.oy}
                onClick={() => setTanlangan_tolov(variant.oy)}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors border ${
                  tanlangan_tolov === variant.oy
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/50 text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {variant.nom}
              </button>
            ))}
            <button
              onClick={() => setTanlangan_tolov("toliq")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors border ${
                tanlangan_tolov === "toliq"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              To'liq
            </button>
          </div>
        </div>

        <Dialog open={modal_ochiq} onOpenChange={setModal_ochiq}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
              disabled={mahsulot.miqdor === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {mahsulot.miqdor > 0 ? "Buyurtma Berish" : "Tugagan"}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="text-base">Buyurtma Berish</DialogTitle>
              <DialogDescription className="text-sm">
                {mahsulot.nom} {mahsulot.ranglar.length > 0 ? `- ${mahsulot.ranglar[tanlangan_rang]?.rang} rang` : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ism-mobile" className="text-sm">
                  Ism *
                </Label>
                <Input
                  id="ism-mobile"
                  value={ism}
                  onChange={(e) => setIsm(e.target.value)}
                  placeholder="Ismingizni kiriting"
                  className="text-sm border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon-mobile" className="text-sm">
                  Telefon raqam *
                </Label>
                <PhoneInput id="telefon-mobile" value={telefon} onChange={setTelefon} />
              </div>

              {/* Popup bloklangan bo'lsa ko'rsatiladigan qism (mobile) */}
              {popupBlocked && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-3">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm mb-2">⚠️ Popup bloklangan</h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                    Buyurtmani saqlash va Uzum Nasiya ga o'tish uchun quyidagi tugmani bosing:
                  </p>
                  <Button
                    onClick={manualRedirect}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    size="sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Uzum Nasiya ga o'tish
                  </Button>
                </div>
              )}

              <Button
                onClick={buyurtma_berish}
                disabled={yuborilmoqda}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {yuborilmoqda ? "Yuborilmoqda..." : "Buyurtma Berish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function MahsulotPage() {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <MahsulotContent />
    </Suspense>
  )
}
