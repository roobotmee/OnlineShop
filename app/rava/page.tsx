"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Sparkles, ShoppingCart } from "lucide-react"

export default function AdminLogin() {
  const [email, setEmail] = useState("") // Standart qiymat olib tashlandi
  const [parol, setParol] = useState("") // Standart qiymat olib tashlandi
  const [yuklanyapti, setYuklanyapti] = useState(false)
  const [xato, setXato] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Agar allaqachon login qilingan bo'lsa, dashboardga yo'naltirish
    const token = localStorage.getItem("admin_token")
    if (token) {
      router.push("/rava/dashboard")
    }
  }, [router])

  const kirish = async (e: React.FormEvent) => {
    e.preventDefault()
    setXato("")
    setYuklanyapti(true)

    try {
      const javob = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, parol }),
      })

      const malumot = await javob.json()

      if (javob.ok) {
        localStorage.setItem("admin_token", malumot.token)
        toast({
          title: "Muvaffaqiyatli",
          description: "Admin panelga kirildi",
        })
        router.push("/rava/dashboard")
      } else {
        setXato(malumot.xato || "Email yoki parol noto'g'ri")
        toast({
          title: "Xato",
          description: malumot.xato || "Email yoki parol noto'g'ri",
          variant: "destructive",
        })
      }
    } catch (error) {
      setXato("Tizimda xatolik yuz berdi")
      toast({
        title: "Xato",
        description: "Tizimda xatolik yuz berdi",
        variant: "destructive",
      })
      console.error("Login error:", error)
    }
    setYuklanyapti(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-10"></div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm sm:max-w-md bg-card border-purple-500/20 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2 sm:space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              TechStore
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl text-foreground">Admin Panel</CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            Email va parolingizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {xato && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{xato}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={kirish} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm sm:text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="bg-background border-purple-500/20 focus:border-purple-500 text-foreground text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parol" className="text-foreground text-sm sm:text-base">
                Parol
              </Label>
              <Input
                id="parol"
                type="password"
                value={parol}
                onChange={(e) => setParol(e.target.value)}
                placeholder="Parolingizni kiriting"
                className="bg-background border-purple-500/20 focus:border-purple-500 text-foreground text-sm sm:text-base"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base shadow-lg"
              disabled={yuklanyapti}
            >
              {yuklanyapti ? "Kirilmoqda..." : "Kirish"}
            </Button>

            <div className="text-center text-xs sm:text-sm text-muted-foreground mt-4 space-y-1 p-4 bg-muted/30 rounded-lg border border-purple-500/10">
              <p className="font-medium">Hisobga kirish uchun parolni kiriting</p>
              <p></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
