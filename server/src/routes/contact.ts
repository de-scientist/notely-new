import { Router } from "express"
import { PrismaClient } from "@prisma/client"
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.ts"

const prisma = new PrismaClient()
const router = Router()

// POST /api/contact - Create a new contact message
router.post("/", async (req, res, next) => {
  try {
    const { name, email, subject, message, userId } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." })
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        userId: userId || null, // Optional - can be from logged-in user or anonymous
      },
    })

    return res.status(201).json({ contact })
  } catch (err) {
    next(err)
  }
})

// GET /api/contact - Get all contact messages (admin only)
router.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    })

    return res.json({ contacts })
  } catch (err) {
    next(err)
  }
})

// GET /api/contact/:id - Get a single contact message
router.get("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { id } = req.params

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    })

    if (!contact) {
      return res.status(404).json({ message: "Contact not found." })
    }

    return res.json({ contact })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/contact/:id - Delete a contact message
router.delete("/:id", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { id } = req.params

    await prisma.contact.delete({ where: { id } })

    return res.json({ message: "Contact deleted successfully." })
  } catch (err) {
    next(err)
  }
})

export default router
