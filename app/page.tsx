"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoonIcon, SunIcon, ShoppingCart, Sparkles, Home } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-10"></div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md sm:max-w-lg bg-card border-purple-500/20 shadow-2xl relative z-10 text-center">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Online Shop
            </span>
          </div>
          {/* "404" matnini to'g'ridan-to'g'ri CardTitle ga qo'llash */}
          <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm sm:text-base shadow-lg px-6 sm:px-8 py-3 sm:py-4">
            404
          </CardTitle>
          <p className="text-xl sm:text-2xl font-semibold text-foreground">Sahifa topilmadi</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Kechirasiz, siz qidirayotgan sahifa topilmadi. Bu sahifa o'chirilgan, nomi o'zgartirilgan yoki vaqtincha
            mavjud emas.
          </p>
          <Link href="/">

          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
