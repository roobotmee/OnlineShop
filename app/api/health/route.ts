import { NextResponse } from "next/server"
import { malumotlar_bazasi } from "@/lib/database"

export async function GET() {
  try {
    // Test database connection
    const result = malumotlar_bazasi.prepare("SELECT 1 as test").get()

    if (result && result.test === 1) {
      return NextResponse.json({
        status: "ok",
        message: "Server is running and database is connected",
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error("Database connection test failed")
    }
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Server is running but database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
