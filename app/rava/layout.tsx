"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Suspense } from "react"

const navigation = [
  {
    name: "Boshqaruv paneli",
    href: "/rava/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Mahsulotlar",
    href: "/rava/mahsulotlar",
    icon: Package,
  },
  {
    name: "Buyurtmalar",
    href: "/rava/buyurtmalar",
    icon: ShoppingCart,
  },
  {
    name: "Mijozlar",
    href: "/rava/mijozlar",
    icon: Users,
  },
  {
    name: "Sozlamalar",
    href: "/rava/sozlamalar",
    icon: Settings,
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/rava") return

    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/rava")
      return
    }

    // Get admin info from token
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setAdmin(payload)
    } catch (error) {
      localStorage.removeItem("admin_token")
      router.push("/rava")
    }
  }, [pathname, router])

  const chiqish = () => {
    localStorage.removeItem("admin_token")
    toast({
      title: "Chiqildi",
      description: "Admin paneldan muvaffaqiyatli chiqildi",
    })
    router.push("/rava")
  }

  // Don't render layout for login page
  if (pathname === "/rava") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-md border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 border-b border-border/50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 relative shadow-lg">
                <span className="text-primary-foreground font-bold text-sm sm:text-base">A</span>
                <Sparkles className="h-2 w-2 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-foreground font-semibold text-sm sm:text-base">Admin Panel</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 sm:px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 sm:space-x-3 rounded-lg px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Admin user info */}
          <div className="border-t border-border/50 p-3 sm:p-4 bg-muted/20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 border border-border shadow-sm">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm">
                  {admin?.email?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">{admin?.email || "admin@example.com"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  className="w-48 sm:w-64 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background text-foreground placeholder-muted-foreground pl-10 text-sm backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative h-8 w-8 sm:h-10 sm:w-10 border border-border/50 hover:border-border hover:bg-muted/50"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-full hover:bg-muted/50">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border border-border shadow-sm">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm">
                        {admin?.email?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 sm:w-56 bg-card/95 backdrop-blur-md border-border/50 shadow-xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal text-foreground">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs sm:text-sm font-medium">Admin User</p>
                      <p className="text-xs text-muted-foreground truncate">{admin?.email || "admin@example.com"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 text-xs sm:text-sm cursor-pointer"
                    onClick={chiqish}
                  >
                    <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Chiqish</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 lg:p-6 bg-background/50">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
