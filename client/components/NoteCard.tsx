"use client"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Lock, Unlock, Clock, ArrowRight } from "lucide-react"
import type { Note } from "@/store/useNotesStore"

export type { Note }

export default function NoteCard({ note }: { note: Note }) {
  const isPublic = note.isPublic ?? false

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const contentSnippet = note.content.slice(0, 120).trim() + (note.content.length > 120 ? "..." : "")

  return (
    <Link href={`/notes/${note.id}`} className="block h-full">
      <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span className={`flex items-center font-medium ${isPublic ? "text-green-600" : "text-primary"}`}>
              {isPublic ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {isPublic ? "Public Note" : "Private Note"}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(note.createdAt)}
            </span>
          </div>

          <CardTitle className="text-xl font-bold line-clamp-2">{note.title}</CardTitle>

          <CardDescription className="pt-1 text-sm italic line-clamp-2">{note.synopsis}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pt-3 pb-0">
          <p className="text-sm text-muted-foreground line-clamp-3">{contentSnippet}</p>
        </CardContent>

        <CardFooter className="pt-4 flex justify-end">
          <span className="flex items-center text-sm font-semibold text-primary group-hover:underline">
            View Details
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
