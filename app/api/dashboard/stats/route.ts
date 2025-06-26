import { NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function GET() {
  try {
    // Check cache first
    const cachedStats = cache.get(CACHE_KEYS.DASHBOARD_STATS)
    if (cachedStats) {
      return NextResponse.json(cachedStats)
    }

    // Default values in case of errors
    let jami_sotuvlar = 0
    let mahsulotlar_soni = 0
    let faol_mahsulotlar = 0
    let buyurtmalar_soni = 0

    try {
      // Use a single query to get all stats at once
      const stats = malumotlar_bazasi
        .prepare(`
        SELECT 
          (SELECT COALESCE(SUM(narx), 0) FROM buyurtmalar) as jami_sotuvlar,
          (SELECT COUNT(*) FROM mahsulotlar) as mahsulotlar_soni,
          (SELECT COUNT(*) FROM mahsulotlar WHERE miqdor > 0) as faol_mahsulotlar,
          (SELECT COUNT(*) FROM buyurtmalar) as buyurtmalar_soni
      `)
        .get() as any

      if (stats) {
        jami_sotuvlar = stats.jami_sotuvlar || 0
        mahsulotlar_soni = stats.mahsulotlar_soni || 0
        faol_mahsulotlar = stats.faol_mahsulotlar || 0
        buyurtmalar_soni = stats.buyurtmalar_soni || 0
      }
    } catch (error) {
      console.error("Error getting stats:", error)
    }

    // O'zgarishlar (hozircha statik qiymatlar)
    const statsData = {
      jami_sotuvlar,
      sotuvlar_ozgarish: 12.5,
      mahsulotlar_soni,
      mahsulotlar_ozgarish: 0,
      faol_mahsulotlar,
      faol_ozgarish: 0,
      buyurtmalar_soni,
      buyurtmalar_ozgarish: 0,
    }

    // Cache for 5 minutes
    cache.set(CACHE_KEYS.DASHBOARD_STATS, statsData, 5 * 60 * 1000)

    const response = NextResponse.json(statsData)
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=150")

    return response
  } catch (xato) {
    console.error("Statistikalarni yuklashda xato:", xato)
    return NextResponse.json({
      jami_sotuvlar: 0,
      sotuvlar_ozgarish: 0,
      mahsulotlar_soni: 0,
      mahsulotlar_ozgarish: 0,
      faol_mahsulotlar: 0,
      faol_ozgarish: 0,
      buyurtmalar_soni: 0,
      buyurtmalar_ozgarish: 0,
    })
  }
}
