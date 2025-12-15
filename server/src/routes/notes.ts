// server/src/routes/notes.ts
import { Router, type Request, type Response } from "express"
import { generateFullNote, type GenerateNoteOptions } from "../services/aiServices.ts"
import { PrismaClient } from "@prisma/client"
import { requireAuth } from "../middleware/auth.ts"
import crypto from "crypto"

const router = Router()
const prisma = new PrismaClient()

/** Helper — generate short public share IDs */
function generateShareId() {
  return crypto.randomBytes(8).toString("hex") // 16-char slug
}

/**
 * Ensure unique publicShareId
 */
async function generateUniqueShareId(): Promise<string> {
  const MAX_ATTEMPTS = 5
  let attempts = 0
  while (attempts < MAX_ATTEMPTS) {
    attempts++
    const candidate = generateShareId()
    const conflict = await prisma.entry.findUnique({ where: { publicShareId: candidate } })
    if (!conflict) return candidate
  }
  throw new Error("Failed to generate a unique publicShareId after multiple attempts.")
}

// POST /api/notes/generate
// Requires authentication via requireAuth middleware
router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id // Authenticated user from middleware

  const { title, synopsis, audience, tone, length, save, categoryId, isPublic } = req.body as {
    title?: string
    synopsis?: string
    audience?: string
    tone?: string
    length?: "short" | "medium" | "long"
    save?: boolean
    categoryId?: string
    isPublic?: boolean
  }

  if (save && !categoryId) {
    return res.status(400).json({ error: "Saving requires a categoryId." })
  }

  try {
    // Build AI options object
    const options: GenerateNoteOptions = {
      ...(title && { title }),
      ...(synopsis && { synopsis }),
      ...(audience && { audience }),
      ...(tone && { tone }),
      ...(length && { length }),
    }

    const generatedNote: string = await generateFullNote(options)

    let savedEntry = null

    if (save && categoryId) {
      // Fallback title from generated note
      const fallbackTitle = generatedNote.split("\n")[0].replace(/^[#>\-*]+\s*/, "").trim().substring(0, 100)
      const safeTitle = title ?? fallbackTitle
      const safeSynopsis = synopsis ?? safeTitle

      let publicShareId: string | null = null
      if (isPublic) {
        publicShareId = await generateUniqueShareId()
      }

      savedEntry = await prisma.entry.create({
        data: {
          title: safeTitle,
          synopsis: safeSynopsis,
          content: generatedNote,
          categoryId,
          userId,
          isPublic: isPublic ?? false,
          ...(isPublic ? { publicShareId } : {}),
        },
        select: { id: true, publicShareId: true },
      })
    }

    return res.json({
      note: generatedNote,
      saved: savedEntry,
    })
  } catch (error) {
    console.error("AI Note generation error:", error)
    return res.status(500).json({ error: "Failed to generate or save note." })
  }
})

export default router
