"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define the Note interface
export interface Note {
  id: string
  title: string
  synopsis: string
  content: string
  createdAt: string
  isBookmarked?: boolean
  isPublic?: boolean
}

interface NotesStore {
  notes: Note[]
  toggleBookmark: (id: string) => void
  getBookmarked: () => Note[]
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],

      toggleBookmark: (id: string) =>
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n)),
        })),

      getBookmarked: () => get().notes.filter((n) => n.isBookmarked === true),
    }),
    {
      name: "notes-storage",
    },
  ),
)
