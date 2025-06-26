"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Copy } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

interface Mahsulot {
  id: number
  nom: string
  tavsif: string
  narx: number
  chegirma_narx: number | null
  miqdor: number
  link: string
  ranglar: { rang: string; rasm: string }[]
  yaratilgan_vaqt: string
}

export default function MahsulotlarPage() {
  const [mahsulotlar, setMahsulotlar] = useState<Mahsulot[]>([])
  const [qidiruv, setQidiruv] = useState("")
  const [yuklanyapti, setYuklanyapti] = useState(true)

  useEffect(() => {
    mahsulotlarni_yuklash()
  }, [])

  const mahsulotlarni_yuklash = async () => {
    try {
      const javob = await fetch("/api/mahsulotlar")
      if (javob.ok) {
        const malumot = await javob.json()
        setMahsulotlar(malumot)
      }
    } catch (xato) {
      console.error("Mahsulotlarni yuklashda xato:", xato)
      toast({
        title: "Xato",
        description: "Mahsulotlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
    setYuklanyapti(false)
  }

  const mahsulot_ochirish = async (link: string) => {
    if (!confirm("Mahsulotni o'chirishni xohlaysizmi?")) return

    try {
      const javob = await fetch(`/api/mahsulotlar/${link}`, {
        method: "DELETE",
      })

      if (javob.ok) {
        mahsulotlarni_yuklash()
        toast({
          title: "Muvaffaqiyatli",
          description: "Mahsulot o'chirildi",
        })
      } else {
        throw new Error("Mahsulotni o'chirishda xato")
      }
    } catch (xato) {
      toast({
        title: "Xato",
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const linkni_nusxalash = (link: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/mahsulot/${link}`)
    toast({
      title: "Nusxalandi",
      description: "Mahsulot linki nusxalandi",
    })
  }

  const filtrlangan_mahsulotlar = mahsulotlar.filter((mahsulot) =>
    mahsulot.nom.toLowerCase().includes(qidiruv.toLowerCase()),
  )

  const chegirma_foizi = (asl_narx: number, chegirma_narx: number) => {
    return Math.round(((asl_narx - chegirma_narx) / asl_narx) * 100)
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mahsulotlar
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Barcha mahsulotlarni boshqaring</p>
        </div>
        <Link href="/rava/mahsulot-qoshish">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto text-sm sm:text-base shadow-lg">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Mahsulot Qoshish
          </Button>
        </Link>
      </div>

      <Card className="bg-card border-purple-500/20 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground text-sm sm:text-base">Mahsulotlar ro'yxati</CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                Jami {filtrlangan_mahsulotlar.length} ta mahsulot
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Mahsulot qidirish..."
                value={qidiruv}
                onChange={(e) => setQidiruv(e.target.value)}
                className="bg-background border-purple-500/20 focus:border-purple-500 text-foreground placeholder-muted-foreground pl-8 sm:pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtrlangan_mahsulotlar.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-muted-foreground text-sm sm:text-base">Mahsulotlar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20">
                    <TableHead className="text-muted-foreground text-xs sm:text-sm">Mahsulot</TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                      Narx
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                      Miqdor
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">
                      Holat
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm hidden xl:table-cell">
                      Ranglar
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs sm:text-sm text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrlangan_mahsulotlar.map((mahsulot) => (
                    <TableRow key={mahsulot.id} className="border-purple-500/10 hover:bg-muted/30 transition-colors">
                      <TableCell className="min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <img
                            src={mahsulot.ranglar[0]?.rasm || "/placeholder.svg?height=40&width=40"}
                            alt={mahsulot.nom}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover flex-shrink-0 border border-purple-500/20"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-xs sm:text-sm truncate">{mahsulot.nom}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs hidden sm:block">
                              {mahsulot.tavsif}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div>
                          {mahsulot.chegirma_narx ? (
                            <div>
                              <p className="font-medium text-primary text-xs sm:text-sm">
                                {mahsulot.chegirma_narx.toLocaleString()} so'm
                              </p>
                              <p className="text-xs text-muted-foreground line-through">
                                {mahsulot.narx.toLocaleString()} so'm
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white"
                              >
                                -{chegirma_foizi(mahsulot.narx, mahsulot.chegirma_narx)}%
                              </Badge>
                            </div>
                          ) : (
                            <p className="font-medium text-foreground text-xs sm:text-sm">
                              {mahsulot.narx.toLocaleString()} so'm
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-foreground text-xs sm:text-sm">{mahsulot.miqdor}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant={mahsulot.miqdor > 0 ? "default" : "secondary"}
                          className={`text-xs ${mahsulot.miqdor > 0 ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : ""}`}
                        >
                          {mahsulot.miqdor > 0 ? "Mavjud" : "Tugagan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex space-x-1">
                          {mahsulot.ranglar.slice(0, 3).map((rang, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-purple-500/30"
                              style={{ backgroundColor: rang.rang.toLowerCase() }}
                              title={rang.rang}
                            />
                          ))}
                          {mahsulot.ranglar.length > 3 && (
                            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-muted border-2 border-purple-500/30 flex items-center justify-center text-xs text-foreground">
                              +{mahsulot.ranglar.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground h-6 w-6 sm:h-8 sm:w-8 border border-purple-500/20 hover:border-purple-500/40"
                            >
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-card border-purple-500/20" align="end">
                            <DropdownMenuLabel className="text-muted-foreground text-xs sm:text-sm">
                              Amallar
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs sm:text-sm"
                              onClick={() => linkni_nusxalash(mahsulot.link)}
                            >
                              <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Linkni nusxalash
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs sm:text-sm">
                              <Link href={`/mahsulot/${mahsulot.link}`} target="_blank" className="flex items-center">
                                <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Ko'rish
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs sm:text-sm">
                              <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              className="text-red-400 hover:text-red-300 hover:bg-muted text-xs sm:text-sm"
                              onClick={() => mahsulot_ochirish(mahsulot.link)}
                            >
                              <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
