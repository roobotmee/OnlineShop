/**
 * Uzum Nasiya integratsiyasi uchun yordamchi funksiyalar
 */

// Telefon raqamni tozalash
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d]/g, "")
}

// Uzum Nasiya URL yaratish
export const createUzumNasiyaUrl = (phone: string): string => {
  const cleanedPhone = cleanPhoneNumber(phone)
  return `https://auth.uzumnasiya.uz/?phone=${cleanedPhone}`
}

// Uzum Nasiya ga yo'naltirish
export const redirectToUzumNasiya = (phone: string): boolean => {
  try {
    const url = createUzumNasiyaUrl(phone)
    const uzumWindow = window.open(url, "_blank")

    if (!uzumWindow) {
      return false // Popup bloklangan
    }

    // Uzum Nasiya oynasiga fokus qilish
    uzumWindow.focus()

    // Avtomatik to'ldirish uchun script
    setTimeout(() => {
      try {
        // Telefon raqamni avtomatik to'ldirish uchun postMessage
        uzumWindow.postMessage(
          {
            action: "FILL_PHONE",
            phone: cleanPhoneNumber(phone),
          },
          "https://auth.uzumnasiya.uz",
        )
      } catch (err) {
        console.log("Avtomatik to'ldirish ishlamadi")
      }
    }, 1500)

    return true
  } catch (error) {
    console.error("Uzum Nasiya ga yo'naltirishda xato:", error)
    return false
  }
}

// Uzum Nasiya uchun script yaratish
export const createUzumNasiyaScript = (phone: string): string => {
  const cleanedPhone = cleanPhoneNumber(phone)

  return `
    try {
      // Telefon input elementini topish
      const phoneInput = document.querySelector('input[type="tel"]');
      
      // Agar element topilsa, qiymatni o'rnatish
      if (phoneInput) {
        phoneInput.value = "${cleanedPhone}";
        
        // Input event ni ishga tushirish
        const event = new Event('input', { bubbles: true });
        phoneInput.dispatchEvent(event);
        
        // Keypress event ni ishga tushirish
        const keypressEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        phoneInput.dispatchEvent(keypressEvent);
        
        // Formani topish va submit qilish
        const form = phoneInput.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
        
        // Tugmani topish va bosish
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.click();
        }
      }
    } catch (e) {
      console.error("Avtomatik to'ldirish xatosi:", e);
    }
  `
}

// Uzum Nasiya uchun bookmarklet yaratish
export const createUzumNasiyaBookmarklet = (phone: string): string => {
  const script = createUzumNasiyaScript(phone)
  return `javascript:(function(){${encodeURIComponent(script)}})();`
}
