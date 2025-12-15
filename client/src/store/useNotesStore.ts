export interface Note {
  id: string
  title: string
  content: string
  synopsis?: string
  isPublic?: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}

interface NotesState {
  notes: Note[]
  toggleBookmark: (id: string) => void
  getBookmarked: () => Note[]
}

import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      toggleBookmark: (id: string) =>
        set((state) => ({
          notes: state.notes.map((n: Note) => (n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n)),
        })),

      getBookmarked: () => get().notes.filter((n: Note) => n.isBookmarked === true),
    }),
    {
      name: "notes-storage",
    },
  ),
)
