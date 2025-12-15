"use client"

import { Routes, Route, Link, Navigate } from "react-router-dom"
import "./App.css"
import { useAuthStore } from "./store/auth"
import { Button } from "./components/ui/button"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { LandingPage } from "./pages/LandingPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { NotesListPage } from "./pages/NotesListPage"
import { NoteDetailPage } from "./pages/NoteDetailPage"
import { NewEntryPage } from "./pages/NewEntryPage"
import { EditEntryPage } from "./pages/EditEntryPage"
import { TrashPage } from "./pages/TrashPage"
import { ProfilePage } from "./pages/ProfilePage"
import AppFooter from "./components/AppFooter"
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar"
import { Toaster } from "./components/ui/sonner"
import { PrivacyPolicy } from "./pages/PrivacyPolicy"
import { TermsOfService } from "./pages/TermsOfService"
import { HelpSupport } from "./pages/HelpSupport"
import { ContactPage } from "./pages/ContactPage"
import Chatbot from "./components/AI/Chatbot"
import AnalyticsDashboard from "./pages/AnalyticsDashboard"
import { SharedNotePage } from "./pages/SharedNotePage"
import AdminApp from "./admin3/AdminApp"
import { AuthCallbackPage } from "./pages/AuthCallback"
import { ThemeToggle } from "./components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu"
import { LogOut, Settings, Feather } from "lucide-react"

const getInitials = (
  firstName?: string,
  lastName?: string
): string => {
  const first = firstName?.trim()
  const last = lastName?.trim()

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase()
  }

  if (first) {
    return first[0].toUpperCase()
  }

  if (last) {
    return last[0].toUpperCase()
  }

  return "U"
}


function UserNav() {
  const { user, clear } = useAuthStore()
  const avatarSrc = user?.avatar ?? undefined

  const handleLogout = () => {
    clear()
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity">
          <span className="hidden text-right lg:inline">
            <span className="block text-xs text-muted-foreground">Welcome back 🖐️,</span>
            <span className="block font-medium text-foreground group-hover:text-primary transition-colors">
              {user.firstName}
            </span>
          </span>
          <Avatar className="h-9 w-9 border border-border group-hover:border-primary transition-colors">
            {avatarSrc && (
              <AvatarImage
                src={avatarSrc}
                alt={`${user.firstName} ${user.lastName} Avatar`}
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {`${user.firstName} ${user.lastName}`}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/app/profile" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" /> Profile Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


function AppHeader() {
  const { user } = useAuthStore()
  const isLoggedIn = !!user

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3 sticky top-0 z-50 backdrop-blur-sm bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary flex items-center gap-2"
        >
          <Feather className="h-5 w-5" />
          Notely
        </Link>
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/app/notes" className="text-muted-foreground transition-colors hover:text-foreground">
              My notes
            </Link>
            <Link to="/app/notes/new" className="text-muted-foreground transition-colors hover:text-foreground">
              New entry
            </Link>
            <Link to="/app/trash" className="text-muted-foreground transition-colors hover:text-foreground">
              Trash
            </Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {!isLoggedIn && (
          <>
            <Link to="/login">
              <Button variant="ghost" className="h-9 px-6 text-sm font-medium">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="h-9 px-6 text-sm bg-foreground text-background hover:bg-foreground/90 font-medium transition-all">
                Sign up
              </Button>
            </Link>
          </>
        )}
        {isLoggedIn && <UserNav />}
      </div>
    </header>
  )
}

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/share/:id" element={<SharedNotePage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/notes" element={<NotesListPage />} />
            <Route path="/app/notes/new" element={<NewEntryPage />} />
            <Route path="/app/notes/:id" element={<NoteDetailPage />} />
            <Route path="/app/notes/:id/edit" element={<EditEntryPage />} />
            <Route path="/app/trash" element={<TrashPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/analytics" element={<AnalyticsDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Chatbot />
      <AppFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  )
}

export default function App() {
  return <AppLayout />
}
