"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, Copy, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  phoneNumber: string
  customerName: string
  productName: string
}

export function VerificationModal({ isOpen, onClose, phoneNumber, customerName, productName }: VerificationModalProps) {
  const [step, setStep] = useState<"instructions" | "verification" | "success">("instructions")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Telefon raqamini tozalash
  const cleanPhone = phoneNumber.replace(/[^\d]/g, "")
  const formattedPhone = phoneNumber

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const openUzumNasiya = () => {
    setIsLoading(true)
    setCountdown(30) // 30 soniya kutish

    // Uzum Nasiya saytini yangi oynada ochish
    const uzumWindow = window.open("https://auth.uzumnasiya.uz/", "_blank", "width=800,height=600")

    if (uzumWindow) {
      // Foydalanuvchiga ko'rsatma berish
      toast({
        title: "Uzum Nasiya ochildi",
        description: "Yangi oynada telefon raqamingizni kiriting va kodni tasdiqlang",
      })

      // Oynani kuzatish
      const checkClosed = setInterval(() => {
        if (uzumWindow.closed) {
          clearInterval(checkClosed)
          setStep("verification")
          setIsLoading(false)
        }
      }, 1000)

      // 5 daqiqadan keyin avtomatik ravishda verification ga o'tish
      setTimeout(() => {
        clearInterval(checkClosed)
        if (!uzumWindow.closed) {
          setStep("verification")
          setIsLoading(false)
        }
      }, 300000) // 5 daqiqa
    } else {
      // Popup blocker yoki boshqa muammo
      setIsLoading(false)
      toast({
        title: "Xato",
        description: "Uzum Nasiya saytini ochib bo'lmadi. Qo'lda ochishga harakat qiling.",
        variant: "destructive",
      })
    }
  }

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(cleanPhone)
    toast({
      title: "Nusxalandi",
      description: "Telefon raqam nusxalandi",
    })
  }

  const handleVerificationSubmit = () => {
    if (verificationCode.length >= 4) {
      setStep("success")
      toast({
        title: "Tasdiqlandi",
        description: "Buyurtmangiz muvaffaqiyatli tasdiqlandi!",
      })
    } else {
      toast({
        title: "Xato",
        description: "Tasdiqlash kodini to'liq kiriting",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setStep("instructions")
    setVerificationCode("")
    setCountdown(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            {step === "success" ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Buyurtma Tasdiqlandi
              </>
            ) : (
              <>
                <ExternalLink className="h-5 w-5 text-primary" />
                Uzum Nasiya Tasdiqlash
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {step === "success"
              ? "Buyurtmangiz muvaffaqiyatli tasdiqlandi"
              : "Buyurtmangizni tasdiqlash uchun Uzum Nasiya orqali telefon raqamingizni tasdiqlang"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "instructions" && (
            <>
              <Alert className="border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Buyurtma ma'lumotlari:</strong>
                  <br />• Mijoz: {customerName}
                  <br />• Mahsulot: {productName}
                  <br />• Telefon: {formattedPhone}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                  <div>
                    <Label className="text-sm font-medium">Telefon raqam:</Label>
                    <p className="text-sm text-muted-foreground font-mono">{cleanPhone}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyPhoneNumber}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Ko'rsatma:</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Uzum Nasiya saytiga o'ting</li>
                    <li>
                      Telefon raqamingizni kiriting: <span className="font-mono">{cleanPhone}</span>
                    </li>
                    <li>SMS kod kelishini kuting</li>
                    <li>Kodni kiriting va tasdiqlang</li>
                  </ol>
                </div>

                <Button
                  onClick={openUzumNasiya}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ochilmoqda...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Uzum Nasiya ga o'tish
                    </>
                  )}
                </Button>

                {countdown > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Keyingi qadam {countdown} soniyadan keyin ochiladi
                  </p>
                )}
              </div>
            </>
          )}

          {step === "verification" && (
            <>
              <Alert className="border-green-500/20 bg-green-500/5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm">
                  Uzum Nasiya orqali telefon raqamingizni tasdiqladingizmi? Agar ha bo'lsa, quyidagi tugmani bosing.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="verification-code" className="text-sm">
                    Tasdiqlash kodi (ixtiyoriy)
                  </Label>
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="1234"
                    className="text-center font-mono text-lg"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Agar Uzum Nasiya orqali tasdiqlagan bo'lsangiz, bu maydonni bo'sh qoldiring
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("instructions")} className="flex-1">
                    Orqaga
                  </Button>
                  <Button onClick={handleVerificationSubmit} className="flex-1 bg-green-500 hover:bg-green-600">
                    Tasdiqlash
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "success" && (
            <>
              <Alert className="border-green-500/20 bg-green-500/5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm">
                  <strong>Buyurtmangiz muvaffaqiyatli qabul qilindi!</strong>
                  <br />
                  Tez orada operatorlarimiz siz bilan bog'lanadi va buyurtmangizni tasdiqlaydi.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium">Buyurtma ma'lumotlari:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Mijoz: {customerName}</p>
                  <p>• Telefon: {formattedPhone}</p>
                  <p>• Mahsulot: {productName}</p>
                  <p>• Vaqt: {new Date().toLocaleString("uz-UZ")}</p>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Yopish
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
