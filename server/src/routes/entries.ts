import { Router } from "express"
import { PrismaClient } from "@prisma/client"
import { requireAuth } from "../middleware/auth.ts"
import crypto from "crypto"
import type { Request } from "express"

const prisma = new PrismaClient()
const router = Router()

// ----------------------------------------------------------------------
// 🎯 PUBLIC ROUTE
// ----------------------------------------------------------------------
router.get("/public/entries/:id", async (req: Request<{ id: string }>, res, next) => {
  try {
    const { id } = req.params

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    })

    if (!entry || !entry.isPublic) {
      return res.status(404).json({ message: "Entry not found or is private." })
    }

    return res.json({ entry })
  } catch (err) {
    console.error("Error fetching public entry:", err)
    res.status(500).json({ message: "An unexpected error occurred." })
  }
})

// ----------------------------------------------------------------------
// APPLY AUTHENTICATION FOR ALL REMAINING ROUTES
// ----------------------------------------------------------------------
router.use(requireAuth)

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface EntryCreationData {
  title: string
  synopsis: string
  content: string
  categoryId: string
  pinned?: boolean
  isPublic?: boolean
}

interface EntryUpdateData {
  title?: string
  synopsis?: string
  content?: string
  categoryId?: string
  pinned?: boolean
  isPublic?: boolean
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------
const entryInclude = { category: { select: { id: true, name: true } } }

function generateShareId() {
  return crypto.randomBytes(8).toString("hex")
}

/**
 * Generate a unique publicShareId safely with retries
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

// ----------------------------------------------------------------------
// CREATE ENTRY
// ----------------------------------------------------------------------
router.post("/", async (req: Request<{}, {}, EntryCreationData>, res, next) => {
  try {
    const userId = req.user!.id
    const { title, synopsis, content, categoryId, pinned, isPublic } = req.body

    if (!title || !synopsis || !content || !categoryId)
      return res.status(400).json({ message: "Title, synopsis, content, and categoryId are required." })

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!categoryExists) return res.status(404).json({ message: "Invalid categoryId provided." })

    let publicShareId: string | null = null
    if (isPublic) publicShareId = await generateUniqueShareId()

    const entry = await prisma.entry.create({
      data: {
        title,
        synopsis,
        content,
        userId,
        categoryId,
        pinned: pinned ?? false,
        isPublic: isPublic ?? false,
        ...(isPublic ? { publicShareId } : {}),
      },
      include: entryInclude,
    })

    return res.status(201).json({ entry })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// GET ALL ENTRIES
// ----------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const entries = await prisma.entry.findMany({
      where: { userId, isDeleted: false },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: entryInclude,
    })

    const formattedEntries = entries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }))

    return res.json({ entries: formattedEntries })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// GET TRASHED ENTRIES
// ----------------------------------------------------------------------
router.get("/trash", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const entries = await prisma.entry.findMany({
      where: { userId, isDeleted: true },
      orderBy: { createdAt: "desc" },
      include: entryInclude,
    })
    return res.json({ entries })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// GET SINGLE ENTRY
// ----------------------------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const entry = await prisma.entry.findFirst({
      where: { id, userId, isDeleted: false },
      include: entryInclude,
    })
    if (!entry) return res.status(404).json({ message: "Entry not found." })
    return res.json({ entry })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// UPDATE ENTRY (AUTO REGENERATE SHARE ID)
// ----------------------------------------------------------------------
router.patch("/:id", async (req: Request<{ id: string }, {}, EntryUpdateData>, res, next) => {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const { title, synopsis, content, categoryId, pinned, isPublic } = req.body

    const existing = await prisma.entry.findFirst({ where: { id, userId } })
    if (!existing || existing.isDeleted) return res.status(404).json({ message: "Entry not found." })

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (synopsis !== undefined) updateData.synopsis = synopsis
    if (content !== undefined) updateData.content = content

    if (categoryId !== undefined) {
      const valid = await prisma.category.findUnique({ where: { id: categoryId } })
      if (!valid) return res.status(404).json({ message: "Invalid categoryId provided." })
      updateData.categoryId = categoryId
    }

    if (pinned !== undefined) updateData.pinned = pinned

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic
      if (isPublic) {
        // Always generate a new share ID if making public (even if already public)
        updateData.publicShareId = await generateUniqueShareId()
      } else {
        updateData.publicShareId = null
      }
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: updateData,
      include: entryInclude,
    })

    return res.json({ entry })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// RESTORE ENTRY
// ----------------------------------------------------------------------
router.patch("/restore/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const existing = await prisma.entry.findFirst({ where: { id, userId } })
    if (!existing || !existing.isDeleted) return res.status(404).json({ message: "Entry not found in trash." })

    const entry = await prisma.entry.update({
      where: { id },
      data: { isDeleted: false },
      include: entryInclude,
    })

    return res.json({ entry })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// SOFT DELETE
// ----------------------------------------------------------------------
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const existing = await prisma.entry.findFirst({ where: { id, userId } })
    if (!existing || existing.isDeleted) return res.status(404).json({ message: "Entry not found." })

    const entry = await prisma.entry.update({
      where: { id },
      data: { isDeleted: true },
      include: entryInclude,
    })

    return res.json({ entry })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// PERMANENT DELETE
// ----------------------------------------------------------------------
router.delete("/permanent/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { id } = req.params
    const existing = await prisma.entry.findFirst({ where: { id, userId } })
    if (!existing) return res.status(404).json({ message: "Entry not found." })

    await prisma.entry.delete({ where: { id } })
    return res.json({ message: "Entry permanently deleted." })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------
// BOOKMARKS
// ----------------------------------------------------------------------
router.post("/:id/bookmark", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { id: entryId } = req.params
    await prisma.bookmark.upsert({
      where: { userId_entryId: { userId, entryId } },
      update: {},
      create: { userId, entryId },
    })
    return res.json({ message: "Entry bookmarked." })
  } catch (err) {
    next(err)
  }
})

router.delete("/:id/bookmark", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { id: entryId } = req.params
    await prisma.bookmark.delete({ where: { userId_entryId: { userId, entryId } } })
    return res.json({ message: "Bookmark removed." })
  } catch (err) {
    next(err)
  }
})

router.get("/bookmarks/all", async (req, res, next) => {
  try {
    const userId = req.user!.id
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: { entry: { include: entryInclude } },
    })

    const entries = bookmarks.map((b) => ({ ...b.entry, bookmarked: true }))
    return res.json({ entries })
  } catch (err) {
    next(err)
  }
})

export default router
