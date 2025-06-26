"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Filter, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Buyurtma {
  id: number
  ism: string
  telefon: string
  mahsulot_nomi: string
  tanlangan_rang: string
  narx: number
  muddat: string
  jami_narx: number
  oylik_tolov: number
  buyurtma_vaqti: string
  holat: string
}

export default function BuyurtmalarPage() {
  const [buyurtmalar, setBuyurtmalar] = useState<Buyurtma[]>([])
  const [qidiruv, setQidiruv] = useState("")
  const [holat_filtri, setHolat_filtri] = useState("barchasi")
  const [yuklanyapti, setYuklanyapti] = useState(true)

  useEffect(() => {
    buyurtmalarni_yuklash()
  }, [])

  const buyurtmalarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/buyurtmalar")
      if (javob.ok) {
        const malumot = await javob.json()
        setBuyurtmalar(malumot)
      }
    } catch (xato) {
      console.error("Buyurtmalarni yuklashda xato:", xato)
      toast({
        title: "Xato",
        description: "Buyurtmalarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
    setYuklanyapti(false)
  }

  const csv_yuklab_olish = () => {
    const csv_header = "Ism,Telefon,Mahsulot,Rang,Muddat,Asosiy Narx,Jami Narx,Oylik To'lov,Vaqt\n"
    const csv_data = filtrlangan_buyurtmalar
      .map(
        (buyurtma) =>
          `"${buyurtma.ism}","${buyurtma.telefon}","${buyurtma.mahsulot_nomi}","${buyurtma.tanlangan_rang}","${buyurtma.muddat}","${buyurtma.narx}","${buyurtma.jami_narx}","${buyurtma.oylik_tolov}","${buyurtma.buyurtma_vaqti}"`,
      )
      .join("\n")

    const csv_content = csv_header + csv_data
    const blob = new Blob([csv_content], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `buyurtmalar_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Yuklab olindi",
      description: "Buyurtmalar CSV formatda yuklab olindi",
    })
  }

  const filtrlangan_buyurtmalar = buyurtmalar.filter((buyurtma) => {
    const qidiruv_mos =
      buyurtma.ism.toLowerCase().includes(qidiruv.toLowerCase()) ||
      buyurtma.telefon.includes(qidiruv) ||
      buyurtma.mahsulot_nomi.toLowerCase().includes(qidiruv.toLowerCase())

    const holat_mos = holat_filtri === "barchasi" || buyurtma.holat === holat_filtri

    return qidiruv_mos && holat_mos
  })

  const jami_summa = filtrlangan_buyurtmalar.reduce((jami, buyurtma) => jami + (buyurtma.jami_narx || buyurtma.narx), 0)

  if (yuklanyapti) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Yuklanmoqda...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Buyurtmalar
          </h1>
          <p className="text-muted-foreground">Barcha buyurtmalarni boshqaring</p>
        </div>
        <Button
          onClick={csv_yuklab_olish}
          disabled={buyurtmalar.length === 0}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV Yuklab Olish
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami buyurtmalar</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{buyurtmalar.length}</div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% dan o'tgan oy
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami summa</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{jami_summa.toLocaleString()} so'm</div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% dan o'tgan oy
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bugungi buyurtmalar</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {buyurtmalar.filter((b) => b.buyurtma_vaqti.includes(new Date().toLocaleDateString())).length}
            </div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% dan kecha
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">O'rtacha buyurtma</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {buyurtmalar.length > 0 ? Math.round(jami_summa / buyurtmalar.length).toLocaleString() : 0} so'm
            </div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3% dan o'tgan oy
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-purple-500/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Buyurtmalar ro'yxati</CardTitle>
              <CardDescription className="text-muted-foreground">
                {filtrlangan_buyurtmalar.length} ta buyurtma ko'rsatilmoqda
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={qidiruv}
                  onChange={(e) => setQidiruv(e.target.value)}
                  className="w-64 bg-background border-purple-500/20 focus:border-purple-500 text-foreground placeholder-muted-foreground pl-10"
                />
              </div>
              <Select value={holat_filtri} onValueChange={setHolat_filtri}>
                <SelectTrigger className="w-40 bg-background border-purple-500/20 focus:border-purple-500 text-foreground">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-purple-500/20">
                  <SelectItem value="barchasi">Barchasi</SelectItem>
                  <SelectItem value="yangi">Yangi</SelectItem>
                  <SelectItem value="jarayonda">Jarayonda</SelectItem>
                  <SelectItem value="tugallangan">Tugallangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtrlangan_buyurtmalar.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Buyurtmalar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20">
                    <TableHead className="text-muted-foreground">Mijoz</TableHead>
                    <TableHead className="text-muted-foreground">Mahsulot</TableHead>
                    <TableHead className="text-muted-foreground">Rang</TableHead>
                    <TableHead className="text-muted-foreground">Muddat</TableHead>
                    <TableHead className="text-muted-foreground">Narx</TableHead>
                    <TableHead className="text-muted-foreground">Vaqt</TableHead>
                    <TableHead className="text-muted-foreground">Holat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrlangan_buyurtmalar.map((buyurtma) => (
                    <TableRow key={buyurtma.id} className="border-purple-500/10 hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{buyurtma.ism}</p>
                          <p className="text-sm text-muted-foreground">{buyurtma.telefon}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-foreground">{buyurtma.mahsulot_nomi}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-muted-foreground border-purple-500/30">
                          {buyurtma.tanlangan_rang}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-foreground">{buyurtma.muddat}</p>
                          {buyurtma.oylik_tolov > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {buyurtma.oylik_tolov.toLocaleString()} so'm/oy
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-primary">
                            {(buyurtma.jami_narx || buyurtma.narx).toLocaleString()} so'm
                          </p>
                          {buyurtma.jami_narx > buyurtma.narx && (
                            <p className="text-xs text-muted-foreground">
                              Asosiy: {buyurtma.narx.toLocaleString()} so'm
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-muted-foreground">{buyurtma.buyurtma_vaqti}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">Yangi</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
