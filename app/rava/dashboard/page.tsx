"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react"

interface DashboardStats {
  jami_sotuvlar: number
  sotuvlar_ozgarish: number
  mahsulotlar_soni: number
  mahsulotlar_ozgarish: number
  faol_mahsulotlar: number
  faol_ozgarish: number
  buyurtmalar_soni: number
  buyurtmalar_ozgarish: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    jami_sotuvlar: 0,
    sotuvlar_ozgarish: 0,
    mahsulotlar_soni: 0,
    mahsulotlar_ozgarish: 0,
    faol_mahsulotlar: 0,
    faol_ozgarish: 0,
    buyurtmalar_soni: 0,
    buyurtmalar_ozgarish: 0,
  })
  const [yuklanyapti, setYuklanyapti] = useState(true)

  useEffect(() => {
    statistikalarni_yuklash()
  }, [])

  const statistikalarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/dashboard/stats")
      if (javob.ok) {
        const malumot = await javob.json()
        setStats(malumot)
      }
    } catch (xato) {
      console.error("Statistikalarni yuklashda xato:", xato)
    }
    setYuklanyapti(false)
  }

  const formatNarx = (narx: number) => {
    return new Intl.NumberFormat("uz-UZ").format(narx)
  }

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = "number",
  }: {
    title: string
    value: number
    change: number
    icon: any
    format?: "number" | "currency"
  }) => (
    <Card className="bg-card border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg dark:hover:shadow-purple-500/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</CardTitle>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
      </CardHeader>
      <CardContent className="space-y-1 sm:space-y-2">
        <div className="text-lg sm:text-2xl font-bold text-foreground truncate">
          {format === "currency" ? `${formatNarx(value)} so'm` : formatNarx(value)}
        </div>
        <div className="flex items-center text-xs">
          {change >= 0 ? (
            <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-500 mr-1 flex-shrink-0" />
          ) : (
            <TrendingDown className="h-2 w-2 sm:h-3 sm:w-3 text-red-500 mr-1 flex-shrink-0" />
          )}
          <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        </div>
      </CardContent>
    </Card>
  )

  if (yuklanyapti) {
    return (
      <div className="flex items-center justify-center h-32 sm:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground text-sm sm:text-base">Yuklanmoqda...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Boshqaruv paneli
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">Biznesingizni boshqarish uchun umumiy ko'rinish</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Jami sotuvlar"
          value={stats.jami_sotuvlar}
          change={stats.sotuvlar_ozgarish}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Mahsulotlar soni"
          value={stats.mahsulotlar_soni}
          change={stats.mahsulotlar_ozgarish}
          icon={Package}
        />
        <StatCard
          title="Faol mahsulotlar"
          value={stats.faol_mahsulotlar}
          change={stats.faol_ozgarish}
          icon={ShoppingCart}
        />
        <StatCard title="Buyurtmalar" value={stats.buyurtmalar_soni} change={stats.buyurtmalar_ozgarish} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 sm:gap-6">
        <Card className="lg:col-span-4 bg-card border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground text-sm sm:text-base">So'nggi buyurtmalar</CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Oxirgi 7 kun ichidagi buyurtmalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SonggiBuyurtmalar />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-card border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground text-sm sm:text-base">Mashhur mahsulotlar</CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Eng ko'p sotilgan mahsulotlar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MashxurMahsulotlar />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SonggiBuyurtmalar() {
  const [buyurtmalar, setBuyurtmalar] = useState([])

  useEffect(() => {
    songgi_buyurtmalarni_yuklash()
  }, [])

  const songgi_buyurtmalarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/dashboard/recent-orders")
      if (javob.ok) {
        const malumot = await javob.json()
        setBuyurtmalar(malumot)
      }
    } catch (xato) {
      console.error("So'nggi buyurtmalarni yuklashda xato:", xato)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {buyurtmalar.length === 0 ? (
        <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">Buyurtmalar yo'q</p>
      ) : (
        buyurtmalar.slice(0, 5).map((buyurtma: any) => (
          <div
            key={buyurtma.id}
            className="flex items-center justify-between space-x-2 p-3 rounded-lg bg-muted/30 border border-purple-500/10 hover:border-purple-500/20 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-foreground font-medium text-xs sm:text-sm truncate">{buyurtma.ism}</p>
              <p className="text-muted-foreground text-xs truncate">{buyurtma.mahsulot_nomi}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-primary font-medium text-xs sm:text-sm">{buyurtma.narx.toLocaleString()} so'm</p>
              <p className="text-muted-foreground text-xs">{buyurtma.buyurtma_vaqti}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function MashxurMahsulotlar() {
  const [mahsulotlar, setMahsulotlar] = useState([])

  useEffect(() => {
    mashxur_mahsulotlarni_yuklash()
  }, [])

  const mashxur_mahsulotlarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/dashboard/popular-products")
      if (javob.ok) {
        const malumot = await javob.json()
        setMahsulotlar(malumot)
      }
    } catch (xato) {
      console.error("Mashhur mahsulotlarni yuklashda xato:", xato)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {mahsulotlar.length === 0 ? (
        <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">Ma'lumot yo'q</p>
      ) : (
        mahsulotlar.slice(0, 5).map((mahsulot: any) => (
          <div
            key={mahsulot.id}
            className="flex items-center justify-between space-x-2 p-3 rounded-lg bg-muted/30 border border-purple-500/10 hover:border-purple-500/20 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-foreground font-medium text-xs sm:text-sm truncate">{mahsulot.nom}</p>
              <p className="text-muted-foreground text-xs">{mahsulot.buyurtmalar_soni} ta buyurtma</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-primary font-medium text-xs sm:text-sm">{mahsulot.narx.toLocaleString()} so'm</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
