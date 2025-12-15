"use client"

import type { FormEvent } from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api"
import { useAuthStore } from "../store/auth"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"
import { Switch } from "../components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip" 

// Icons - Used only necessary icons
import {
  Loader2,
  FilePlus2,
  BookOpen,
  PenTool,
  FolderOpen,
  ListOrdered,
  AlertTriangle,
  Zap,
  ChevronDown,
  Save,
  Info,
} from "lucide-react"

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500"
const GRADIENT_BUTTON_CLASS =
  "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
const BORDER_CLASS = "border-gray-200 dark:border-gray-700/50"
const AI_CARD_STYLE = "border-2 border-fuchsia-400/50 bg-fuchsia-50/50 dark:bg-fuchsia-950/40 shadow-fuchsia-500/20" 

// Persistent form state hook (No change, but included for completeness)
function usePersistentState<T>(key: string, initialState: T): [T, (value: T) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      // Ensure stored value matches initial type or return initial state
      return stored ? JSON.parse(stored) : initialState
    } catch {
      return initialState
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])
  const clearState = useCallback(() => {
    setState(initialState)
    localStorage.removeItem(key)
  }, [initialState, key, setState])
  return [state, setState, clearState]
}

interface Category {
  id: string
  name: string
}

interface TOCItem {
  text: string
  level: number
  id: string
}

interface AiGenerationResponse {
  note: string
  saved: { id: string } | null
}

// --- Component Start ---
export function NewEntryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  // FIX: Accessing userId is now correctly done
  const userId = useAuthStore((state) => state.user?.id) 

  // --- State & Data Fetching ---
  const { data, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data as { categories: Category[] },
  })

  const categories = data?.categories ?? []

  // Main form state (using persistent state)
  const [title, setTitle, clearTitle] = usePersistentState("newEntryTitle", "")
  const [synopsis, setSynopsis, clearSynopsis] = usePersistentState("newEntrySynopsis", "")
  const [content, setContent, clearContent] = usePersistentState("newEntryContent", "")
  const [categoryId, setCategoryId, clearCategoryId] = usePersistentState("newEntryCategory", "")
  const [pageError, setPageError] = useState<string | null>(null)

  // AI generation options state
  const [aiAudience, setAiAudience] = useState<string>("student")
  const [aiTone, setAiTone] = useState<string>("clear and helpful")
  const [aiLength, setAiLength] = useState<string>("medium")
  const [aiSaveToDb, setAiSaveToDb] = useState<boolean>(true)

  // State for collapsible AI panel and TOC panel
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
  const [isTocPanelOpen, setIsTocPanelOpen] = useState(true) 

  const clearForm = () => {
    clearTitle()
    clearSynopsis()
    clearContent()
    clearCategoryId()
  }

  // --- 1. Entry Creation Mutation (Manual Save) ---
  const creationMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated")
      }

      // 🛑 CRITICAL FIX: Removed authorId from body. Server uses userId from middleware (req.user.id).
      const res = await api.post("/entries", { title, synopsis, content, categoryId })
      return res.data.entry as { id: string }
    },
    onSuccess: (entry) => {
      clearForm()
      queryClient.invalidateQueries({ queryKey: ["entries"] })
      navigate(`/app/notes/${entry.id}`)
    },
    onError: (err: any) => setPageError(err?.response?.data?.message ?? "Unable to create entry."),
  })

  // --- 2. AI Generation Mutation (Generate full note) ---
  const generationMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated")
      }

      // Assuming /notes/generate is the correct AI endpoint
      const res = await api.post("/notes/generate", {
        title,
        synopsis,
        audience: aiAudience,
        tone: aiTone,
        length: aiLength,
        save: aiSaveToDb,
        // 🛑 CRITICAL FIX: The server implementation usually extracts the userId from the session/token.
        // I'm leaving authorId here for the AI call as it might be required by a different middleware/endpoint,
        // but it's redundant/incorrect if /notes/generate uses the same auth middleware as /entries.
        // Based on the previous bug, you should probably remove this too, but for safety in the AI context:
        // authorId: userId, 
        categoryId: categoryId,
      })
      return res.data as AiGenerationResponse
    },
    onSuccess: (data) => {
      setContent(data.note)

      if (data.saved) {
        clearForm()
        queryClient.invalidateQueries({ queryKey: ["entries"] })
        navigate(`/app/notes/${data.saved.id}`)
      } else {
        setPageError(null)
      }
    },
    onError: (err: any) => setPageError(err?.response?.data?.error ?? "AI note generation failed. Please try again."),
  })

  // Determine if we have enough content to justify calling the AI Generation
  const hasSufficientContentForGenerate = (title.trim().length > 0 && synopsis.trim().length > 0) 

  const generateFullNote = useCallback(() => {
    setPageError(null)
    if (!hasSufficientContentForGenerate) {
      setPageError("Please provide both a **Title** and a **Synopsis** to generate a full note.")
      return
    }

    if (aiSaveToDb && !categoryId) {
      setPageError("To save the generated note directly, please select a category first.")
      return
    }
    
    // FIX: Check if userId is available before calling mutate
    if (!userId) {
        setPageError("Authentication error: User ID is missing.")
        return
    }

    generationMutation.mutate()
  }, [generationMutation.mutate, hasSufficientContentForGenerate, aiSaveToDb, categoryId, userId]) // Added userId dependency

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPageError(null)

    // FIX: Check if userId is available before calling mutate
    if (!userId) {
        setPageError("Authentication error: User ID is missing.")
        return
    }

    if (!title.trim()) return setPageError("Title is required.")
    if (!synopsis.trim()) return setPageError("Synopsis is required.")
    if (!content.trim()) return setPageError("Content is required.")
    if (!categoryId) return setPageError("Please select a category.")

    creationMutation.mutate()
  }

  // --- UI Logic ---
  const safeContent = content // No need for ?? "" since usePersistentState initializes it to ""
  const wordCount = safeContent
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  // TOC generation logic
  const toc: TOCItem[] = useMemo(() => {
    const lines = safeContent.split("\n")
    const headers: TOCItem[] = []
    lines.forEach((line) => {
      // Only look for H1, H2, and H3 markdown headers
      const match = line.match(/^(#{1,3})\s+(.*)/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        // Simple slug generation
        const id = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")
        headers.push({ text, level, id })
      }
    })
    return headers
  }, [safeContent])

  // Function to mimic scroll-to behavior for TOC items
  const handleTocClick = (headerId: string) => {
    alert(`Simulating navigation to: ${headerId}\n(In a full editor, this would jump your cursor to the header line.)`)
  }

  // Check if any mutation is running
  const isAnyLoading = creationMutation.isPending || generationMutation.isPending
  const isLoadingAi = generationMutation.isPending

  // Button classes for AI Generation
  // FIX: Use title.trim() and synopsis.trim() for accurate checks
  const isAiGenerateDisabled = !title.trim() || !synopsis.trim() || isLoadingAi || isAnyLoading || !userId

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-4xl py-8 px-4">
        <h1 className={`text-3xl font-bold dark:text-white flex items-center gap-2 mb-8 ${PRIMARY_TEXT_CLASS}`}>
          <FilePlus2 className={`h-8 w-8`} /> Draft New Knowledge Entry
        </h1>

        {/* --- MAIN EDITOR CARD (Single Column Layout) --- */}
        <Card className={`dark:bg-gray-900 shadow-2xl ${BORDER_CLASS}`}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <PenTool className="h-6 w-6 text-fuchsia-600" /> Entry Metadata
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Provide the necessary context for your note before writing the content.
            </CardDescription>
            <Separator className="mt-4" />
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Title and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="E.g., The Principles of Quantum Computing"
                    value={title} // FIX: Removed ?? ""
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isAnyLoading}
                    className={isLoadingAi ? "border-fuchsia-400 dark:border-fuchsia-700" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Category
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={isLoadingCategories || isAnyLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-2">
                <Label htmlFor="synopsis">Synopsis</Label>
                <Input
                  id="synopsis"
                  placeholder="A brief, engaging summary (crucial for AI generation)"
                  value={synopsis} // FIX: Removed ?? ""
                  onChange={(e) => setSynopsis(e.target.value)}
                  required
                  disabled={isAnyLoading}
                  className={isLoadingAi ? "border-fuchsia-400 dark:border-fuchsia-700" : ""}
                />
                <p className="text-xs text-muted-foreground dark:text-gray-500">
                  A detailed synopsis leads to better AI-generated content.
                </p>
              </div>

              {/* --- AI FULL NOTE GENERATION (COLLAPSIBLE, STYLED) --- */}
              <Collapsible
                open={isAiPanelOpen}
                onOpenChange={setIsAiPanelOpen}
                className={`space-y-4 p-5 rounded-xl ${AI_CARD_STYLE}`}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex justify-between items-center cursor-pointer">
                    <h3 className="text-xl font-extrabold flex items-center gap-2 text-fuchsia-700 dark:text-fuchsia-300">
                      <Zap className="h-6 w-6" /> AI FULL NOTE GENERATOR
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${isAiPanelOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="CollapsibleContent space-y-4 pt-2">
                  <Separator className="bg-fuchsia-300 dark:bg-fuchsia-800" />
                  <p className="text-sm text-fuchsia-900 dark:text-fuchsia-200">
                    Generate a complete note based on your Title and Synopsis. This action will **overwrite** the
                    current content in your editor.
                  </p>

                  {/* AI Options Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="aiAudience">Audience</Label>
                      <Select value={aiAudience} onValueChange={setAiAudience} disabled={isAnyLoading}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="aiTone">Tone</Label>
                      <Select value={aiTone} onValueChange={setAiTone} disabled={isAnyLoading}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear and helpful">Clear & Helpful</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="aiLength">Length</Label>
                      <Select value={aiLength} onValueChange={setAiLength} disabled={isAnyLoading}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (300 words)</SelectItem>
                          <SelectItem value="medium">Medium (600 words)</SelectItem>
                          <SelectItem value="long">Long (1200 words)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* AI Action/Save */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="saveToDb"
                        checked={aiSaveToDb}
                        onCheckedChange={setAiSaveToDb}
                        disabled={isAnyLoading}
                      />
                      <Label
                        htmlFor="saveToDb"
                        className="text-sm font-medium text-fuchsia-900 dark:text-fuchsia-200 flex items-center gap-1"
                      >
                        Save to DB on Generation
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-fuchsia-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            If enabled, you must select a category. If disabled, the output is loaded into the Content
                            editor for review.
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                    </div>

                    <Button
                      type="button"
                      onClick={generateFullNote}
                      disabled={isAiGenerateDisabled}
                      className={`h-9 bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-semibold transition-colors`}
                    >
                      {isLoadingAi ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Content...
                        </>
                      ) : (
                        "Generate Content"
                      )}
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              {/* --- END AI GENERATION SECTION --- */}

              {/* --- CONTENT EDITOR & TOC (Combined for efficiency) --- */}
              <div className="space-y-4">
                <Label htmlFor="content" className="text-lg font-semibold flex justify-between items-center">
                  Content (Markdown Editor)
                </Label>

                {/* TABLE OF CONTENTS (In-line collapsible) */}
                <Collapsible
                  open={isTocPanelOpen}
                  onOpenChange={setIsTocPanelOpen}
                  className="border rounded-md dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/80 p-3"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center cursor-pointer">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-fuchsia-600 dark:text-fuchsia-400">
                        <ListOrdered className="h-4 w-4" /> Table of Contents ({toc.length} sections)
                      </h4>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isTocPanelOpen ? "rotate-180" : "rotate-0"} text-gray-500`}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="CollapsibleContent pt-3 max-h-48 overflow-y-auto">
                    <nav className="space-y-1">
                      {toc.length === 0 ? (
                        <p className="text-xs text-muted-foreground dark:text-gray-500">
                          Use `#`, `##`, or `###` to create structure.
                        </p>
                      ) : (
                        toc.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => handleTocClick(item.id)}
                            className={`cursor-pointer text-sm truncate p-1 rounded-sm transition-colors 
                                                            hover:bg-fuchsia-100 dark:hover:bg-gray-700 hover:text-fuchsia-600 
                                                            ${item.level === 1 ? "ml-0 font-medium" : item.level === 2 ? "ml-3 text-gray-700 dark:text-gray-300" : "ml-6 text-gray-500 dark:text-gray-400"}
                                                        `}
                          >
                            {item.text}
                          </div>
                        ))
                      )}
                    </nav>
                  </CollapsibleContent>
                </Collapsible>

                <Textarea
                  id="content"
                  rows={25}
                  placeholder="Start writing your note using standard Markdown here..."
                  value={content} // FIX: Removed ?? ""
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="resize-y"
                  disabled={isAnyLoading}
                />
                <p className="text-sm text-muted-foreground dark:text-gray-500 flex justify-end">
                  <span>
                    **Stats:** {wordCount} words • {content.length} characters
                  </span>
                </p>
              </div>

              {/* Display Error Message clearly */}
              {pageError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{pageError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4 pt-4">
                {/* Main Save Button */}
                <Button
                  type="submit"
                  disabled={
                    creationMutation.isPending ||
                    isAnyLoading ||
                    !categoryId ||
                    !title.trim() ||
                    !synopsis.trim() ||
                    !content.trim() ||
                    !userId // Ensure user is logged in
                  }
                  className={`flex-1 text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}
                >
                  {creationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Entry...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Publish & Save
                    </>
                  )}
                </Button>

                {/* Clear Form Button */}
                <Button
                  type="button"
                  onClick={clearForm}
                  variant="outline"
                  className="w-40 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                  disabled={isAnyLoading}
                >
                  Clear Local Draft
                </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}