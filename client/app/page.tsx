import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Folder, Search, Plus, Sparkles, Clock, Tag } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
              <span className="text-lg font-bold">N</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Notely</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search notes</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Now with full theme support - Light, Dark & System modes
            </div>

            <h2 className="text-5xl font-bold tracking-tight text-foreground text-balance leading-tight">
              Your notes, beautifully organized
            </h2>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Capture ideas, organize thoughts, and stay productive with Notely. A modern note-taking experience
              designed for clarity and focus.
            </p>

            <div className="flex items-center gap-3 pt-4">
              <Button size="lg" className="rounded-lg gap-2 shadow-md hover:shadow-lg transition-shadow">
                <Plus className="h-5 w-5" />
                Create Your First Note
              </Button>
              <Button variant="outline" size="lg" className="rounded-lg bg-transparent">
                Explore Features
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-foreground">Everything you need</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle>Rich Text Editor</CardTitle>
                  <CardDescription>
                    Format your notes with ease using our intuitive editor with markdown support and syntax
                    highlighting.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <Folder className="h-6 w-6" />
                  </div>
                  <CardTitle>Smart Organization</CardTitle>
                  <CardDescription>
                    Keep your notes organized with folders, tags, and powerful search capabilities that scale with you.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <Search className="h-6 w-6" />
                  </div>
                  <CardTitle>Lightning Fast Search</CardTitle>
                  <CardDescription>
                    Find any note instantly with our full-text search engine. Search by title, content, or tags.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <Tag className="h-6 w-6" />
                  </div>
                  <CardTitle>Flexible Tagging</CardTitle>
                  <CardDescription>
                    Organize notes your way with custom tags. Create, filter, and manage tags effortlessly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <Clock className="h-6 w-6" />
                  </div>
                  <CardTitle>Auto-Save</CardTitle>
                  <CardDescription>
                    Never lose your work. Every keystroke is automatically saved to ensure your notes are always safe.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <CardTitle>Beautiful Themes</CardTitle>
                  <CardDescription>
                    Switch between light, dark, and system themes. Your preference syncs automatically across devices.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Theme Showcase */}
          <Card className="border-border/50 bg-gradient-to-br from-muted/30 to-muted/60">
            <CardHeader>
              <CardTitle className="text-2xl">Theme Customization</CardTitle>
              <CardDescription className="text-base">
                Switch seamlessly between light, dark, and system themes using the toggle in the top right corner. Your
                preference is automatically saved and synced across all your sessions. The system mode intelligently
                matches your device settings for a truly adaptive experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm font-medium border border-border/50">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  Light Mode
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm font-medium border border-border/50">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  Dark Mode
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm font-medium border border-border/50">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  System Sync
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-24 bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold">N</span>
                </div>
                <span className="font-semibold text-foreground">Notely</span>
              </div>
              <p className="text-sm text-muted-foreground">Built with React, TypeScript, and Tailwind CSS</p>
            </div>

            <div className="flex items-center gap-8">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © 2025 Notely. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
