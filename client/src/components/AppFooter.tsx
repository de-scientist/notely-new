// 💜 Define OneNote-inspired color palette variables
// We'll use Tailwind's `fuchsia` or `purple` and adjust the shades for the primary color.
const PRIMARY_TEXT_CLASS = "text-foreground hover:text-primary transition-colors"

import { Separator } from "@/components/ui/separator"
// NEW Icon: MessageSquare for Contact
import {
  Github,
  Mail,
  Globe,
  Heart,
  BookOpen,
  FilePlus,
  User,
  Trash2,
  Shield,
  FileText,
  LifeBuoy,
  MessageSquare,
} from "lucide-react"

// Helper function for dynamic year in copyright
const currentYear = new Date().getFullYear()

export default function AppFooter() {
  return (
    <footer className="w-full bg-muted/50 border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Updated Grid: 2 columns on small, 4 columns on medium */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* 1. Brand & Mission (Notely Focused) */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-bold tracking-tight">Notely</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Capture thoughts, organize ideas, and manage tasks effortlessly. Your knowledge hub, always at your
              fingertips.
            </p>
          </div>

          {/* 2. Quick Links (Application Navigation) */}
          <div className="md:col-span-1">
            <h3 className="text-base font-semibold mb-4 border-l-2 border-foreground pl-2">App Navigation</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/app/notes" className={PRIMARY_TEXT_CLASS}>
                  <BookOpen className="h-4 w-4 inline mr-2" /> My Notes
                </a>
              </li>
              <li>
                <a href="/app/notes/new" className={PRIMARY_TEXT_CLASS}>
                  <FilePlus className="h-4 w-4 inline mr-2" /> New Entry
                </a>
              </li>
              <li>
                <a href="/app/profile" className={PRIMARY_TEXT_CLASS}>
                  <User className="h-4 w-4 inline mr-2" /> Profile
                </a>
              </li>
              <li>
                <a href="/app/trash" className={PRIMARY_TEXT_CLASS}>
                  <Trash2 className="h-4 w-4 inline mr-2" /> Trash
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Legal & Support (UX Improvement: Essential Links) */}
          <div className="md:col-span-1">
            <h3 className="text-base font-semibold mb-4 border-l-2 border-foreground pl-2">Legal & Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/privacy" className={PRIMARY_TEXT_CLASS}>
                  <Shield className="h-4 w-4 inline mr-2" /> Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className={PRIMARY_TEXT_CLASS}>
                  <FileText className="h-4 w-4 inline mr-2" /> Terms of Service
                </a>
              </li>
              <li>
                <a href="/help" className={PRIMARY_TEXT_CLASS}>
                  <LifeBuoy className="h-4 w-4 inline mr-2" /> Help Center
                </a>
              </li>
              {/* 🎯 NEW LINK: Contact Page */}
              <li>
                <a href="/contact" className={PRIMARY_TEXT_CLASS}>
                  <MessageSquare className="h-4 w-4 inline mr-2" /> Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Connect/Socials (Developer Links) */}
          <div className="md:col-span-1">
            <h3 className="text-base font-semibold mb-4 border-l-2 border-foreground pl-2">Built by Mark Gitau</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <a
                  href="https://github.com/de-scientist"
                  target="_blank"
                  className={PRIMARY_TEXT_CLASS}
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <Separator className="my-2" />
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:gitaumark502@gmail.com" className={PRIMARY_TEXT_CLASS}>
                  Email
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <a
                  href="https://1descientist.vercel.app/"
                  target="_blank"
                  className={PRIMARY_TEXT_CLASS}
                  rel="noopener noreferrer"
                >
                  Portfolio
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Bottom Section (Copyright) */}
        <div className="text-center text-sm text-muted-foreground">
          © {currentYear} Notely App. All rights reserved.
          <span className="flex items-center justify-center mt-1">
            Crafted with <Heart className="h-4 w-4 mx-1 text-red-500" fill="currentColor" /> for productivity.
          </span>
        </div>
      </div>
    </footer>
  )
}
