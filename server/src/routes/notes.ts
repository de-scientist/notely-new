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

/** Ensure unique publicShareId */
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

// ----------------------
// POST /api/notes/generate
// ----------------------
router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  const user = req.user
  if (!user) return res.status(401).json({ error: "Unauthorized" })
  const userId = user.id

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

// ----------------------
// PATCH /api/notes/:id
// Update AI-generated note
// ----------------------
router.patch("/:id", requireAuth, async (req: Request<{ id: string }, {}, any>, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params
  const { title, synopsis, content, categoryId, isPublic } = req.body

  try {
    const existing = await prisma.entry.findFirst({ where: { id, userId } })
    if (!existing) return res.status(404).json({ message: "Note not found." })

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (synopsis !== undefined) updateData.synopsis = synopsis
    if (content !== undefined) updateData.content = content
    if (categoryId !== undefined) {
      const valid = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!valid) return res.status(404).json({ message: "Invalid categoryId." })
      updateData.categoryId = categoryId
    }

    // Handle public toggle
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic

      if (isPublic && !existing.publicShareId) {
        // Generate new publicShareId if it doesn’t exist
        updateData.publicShareId = await generateUniqueShareId()
      }

      if (!isPublic) {
        updateData.publicShareId = null
      }
    }

    const updated = await prisma.entry.update({
      where: { id },
      data: updateData,
      select: { id: true, publicShareId: true, title: true, synopsis: true, content: true },
    })

    return res.json({ entry: updated })
  } catch (err) {
    console.error("AI Note update error:", err)
    return res.status(500).json({ error: "Failed to update note." })
  }
})

export default router
