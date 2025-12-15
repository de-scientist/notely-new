// server/src/routes/notes.ts
import { Router, type Request, type Response } from "express"
import { generateFullNote, type GenerateNoteOptions } from "../services/aiServices.ts"
import { PrismaClient } from "@prisma/client"
import { requireAuth } from "../middleware/auth.ts"

const router = Router()
const prisma = new PrismaClient()

// POST /api/notes/generate
// Requires authentication via requireAuth middleware
router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id // Authenticated user from middleware

  const { title, synopsis, audience, tone, length, save, categoryId } = req.body as {
    title?: string
    synopsis?: string
    audience?: string
    tone?: string
    length?: "short" | "medium" | "long"
    save?: boolean
    categoryId?: string
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

      savedEntry = await prisma.entry.create({
        data: {
          title: safeTitle,
          synopsis: safeSynopsis,
          content: generatedNote,
          categoryId,
          userId,
        },
        select: { id: true },
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
