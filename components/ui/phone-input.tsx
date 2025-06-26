"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, ...props }, ref) => {
    const formatPhoneNumber = (input: string) => {
      // Remove all non-digits except the + at the beginning
      const cleaned = input.replace(/[^\d+]/g, "")

      // Ensure it starts with +998
      if (!cleaned.startsWith("+998")) {
        return "+998 "
      }

      // Extract the digits after +998
      const digits = cleaned.slice(4)

      // Format: +998 XX XXX XX XX
      let formatted = "+998"

      if (digits.length > 0) {
        formatted += " " + digits.slice(0, 2)
      }
      if (digits.length > 2) {
        formatted += " " + digits.slice(2, 5)
      }
      if (digits.length > 5) {
        formatted += " " + digits.slice(5, 7)
      }
      if (digits.length > 7) {
        formatted += " " + digits.slice(7, 9)
      }

      return formatted
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      onChange?.(formatted)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={formatPhoneNumber(value)}
        onChange={handleChange}
        placeholder="+998 XX XXX XX XX"
        className={cn(
          "border-purple-500/20 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-500/30 dark:focus:border-purple-500 dark:bg-card",
          className,
        )}
      />
    )
  },
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
