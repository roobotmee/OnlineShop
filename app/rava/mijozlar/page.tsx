"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, ShoppingCart, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Mijoz {
  ism: string
  telefon: string
  buyurtmalar_soni: number
  jami_xarid: number
  oxirgi_buyurtma: string
}

export default function MijozlarPage() {
  const [mijozlar, setMijozlar] = useState<Mijoz[]>([])
  const [qidiruv, setQidiruv] = useState("")
  const [yuklanyapti, setYuklanyapti] = useState(true)

  useEffect(() => {
    mijozlarni_yuklash()
  }, [])

  const mijozlarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/mijozlar")
      if (javob.ok) {
        const malumot = await javob.json()
        setMijozlar(malumot)
      }
    } catch (xato) {
      console.error("Mijozlarni yuklashda xato:", xato)
      toast({
        title: "Xato",
        description: "Mijozlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
    setYuklanyapti(false)
  }

  const filtrlangan_mijozlar = mijozlar.filter(
    (mijoz) => mijoz.ism.toLowerCase().includes(qidiruv.toLowerCase()) || mijoz.telefon.includes(qidiruv),
  )

  const jami_mijozlar = mijozlar.length
  const jami_buyurtmalar = mijozlar.reduce((jami, mijoz) => jami + mijoz.buyurtmalar_soni, 0)
  const jami_daromad = mijozlar.reduce((jami, mijoz) => jami + mijoz.jami_xarid, 0)

  if (yuklanyapti) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mijozlar</h1>
        <p className="text-slate-400">Mijozlar ma'lumotlari va statistikasi</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Jami mijozlar</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{jami_mijozlar}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Jami buyurtmalar</CardTitle>
            <ShoppingCart className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{jami_buyurtmalar}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Jami daromad</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{jami_daromad.toLocaleString()} so'm</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Mijozlar ro'yxati</CardTitle>
              <CardDescription className="text-slate-400">
                {filtrlangan_mijozlar.length} ta mijoz ko'rsatilmoqda
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Mijoz qidirish..."
                value={qidiruv}
                onChange={(e) => setQidiruv(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtrlangan_mijozlar.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Mijozlar topilmadi</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Mijoz</TableHead>
                  <TableHead className="text-slate-300">Buyurtmalar soni</TableHead>
                  <TableHead className="text-slate-300">Jami xarid</TableHead>
                  <TableHead className="text-slate-300">Oxirgi buyurtma</TableHead>
                  <TableHead className="text-slate-300">Holat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrlangan_mijozlar.map((mijoz, index) => (
                  <TableRow key={index} className="border-slate-700">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{mijoz.ism}</p>
                        <p className="text-sm text-slate-400">{mijoz.telefon}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-white">{mijoz.buyurtmalar_soni}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-white">{mijoz.jami_xarid.toLocaleString()} so'm</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-slate-300">{mijoz.oxirgi_buyurtma}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={mijoz.buyurtmalar_soni > 1 ? "default" : "secondary"}
                        className={mijoz.buyurtmalar_soni > 1 ? "bg-teal-600" : ""}
                      >
                        {mijoz.buyurtmalar_soni > 1 ? "Doimiy" : "Yangi"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
