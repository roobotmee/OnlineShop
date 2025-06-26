"use client"

import { useEffect, useRef } from "react"
import { cleanPhoneNumber } from "@/lib/uzum-nasiya-helper"

interface UzumNasiyaScriptProps {
  phoneNumber: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Uzum Nasiya saytida telefon raqamni avtomatik to'ldirish uchun script
 */
export function UzumNasiyaScript({ phoneNumber, onSuccess, onError }: UzumNasiyaScriptProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const cleanedPhone = cleanPhoneNumber(phoneNumber)

  useEffect(() => {
    // Faqat brauzerda ishlaydi
    if (typeof window === "undefined") return

    // Uzum Nasiya saytida ekanligini tekshirish
    if (!window.location.href.includes("uzumnasiya.uz")) {
      onError?.(new Error("Bu komponent faqat Uzum Nasiya saytida ishlaydi"))
      return
    }

    // Telefon raqamni avtomatik to'ldirish
    const fillPhoneNumber = () => {
      try {
        // Telefon input elementini topish
        const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement | null

        // Agar element topilsa, qiymatni o'rnatish
        if (phoneInput) {
          phoneInput.value = cleanedPhone

          // Input event ni ishga tushirish
          const event = new Event("input", { bubbles: true })
          phoneInput.dispatchEvent(event)

          // Formani topish va submit qilish
          const form = phoneInput.closest("form")
          if (form) {
            setTimeout(() => {
              form.dispatchEvent(new Event("submit", { bubbles: true }))

              // Tugmani topish va bosish
              const submitButton = document.querySelector('button[type="submit"]')
              if (submitButton) {
                ;(submitButton as HTMLButtonElement).click()
                onSuccess?.()
              }
            }, 500)
          }
        } else {
          onError?.(new Error("Telefon input elementi topilmadi"))
        }
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error("Avtomatik to'ldirish xatosi"))
      }
    }

    // DOM yuklangandan keyin ishga tushirish
    if (document.readyState === "complete") {
      fillPhoneNumber()
    } else {
      window.addEventListener("load", fillPhoneNumber)
      return () => window.removeEventListener("load", fillPhoneNumber)
    }

    // postMessage orqali xabarlarni tinglash
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data?.action === "FILL_PHONE" && event.data?.phone) {
        try {
          const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement | null
          if (phoneInput) {
            phoneInput.value = event.data.phone

            // Input event ni ishga tushirish
            const inputEvent = new Event("input", { bubbles: true })
            phoneInput.dispatchEvent(inputEvent)

            onSuccess?.()
          }
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error("postMessage xatosi"))
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [cleanedPhone, onSuccess, onError])

  return null
}
