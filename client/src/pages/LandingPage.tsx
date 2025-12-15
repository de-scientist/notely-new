"use client"

import type React from "react"

import { Link } from "react-router-dom"
import { useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Check, Trash2, User, Users, Feather, Clock, Search, Folder, Zap, PencilLine, LogIn } from "lucide-react"
import { Separator } from "../components/ui/separator"

const ACCENT_TEXT_CLASS = "text-primary font-semibold"
const SOLID_BUTTON_CLASS = "bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all"
const OUTLINE_BUTTON_CLASS = "border-2 border-border hover:bg-accent text-foreground font-semibold transition-all"

interface StatCardProps {
  value: string
  label: string
  icon: React.ElementType
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon: Icon }) => (
  <div className="text-center p-6 transition duration-300 ease-in-out transform hover:scale-[1.02] bg-card shadow-md hover:shadow-xl rounded-xl border border-border">
    <Icon className="h-8 w-8 text-foreground mx-auto mb-2" />
    <p className="text-4xl font-extrabold text-foreground animate-in fade-in duration-1000">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
  </div>
)

function useRevealAnimations() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible")
          }
        })
      },
      { threshold: 0.1 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export function LandingPage() {
  useRevealAnimations()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl space-y-16 text-center">
        {/* HERO */}
        <div className="space-y-6 reveal">
          <h1 className="text-6xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
            <Feather className="inline-block h-12 w-12 mr-4" />
            Your Memory, <span className={ACCENT_TEXT_CLASS}>Perfectly Organized.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground font-medium leading-relaxed">
            Notely is the professional workspace designed for effortless capture and immediate retrieval. Stop
            searching, start finding.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 reveal">
          <Link to="/register">
            <Button size="lg" className={`h-12 px-8 text-base ${SOLID_BUTTON_CLASS} flex items-center gap-2`}>
              <PencilLine className="w-5 h-5" />
              Start Taking Notes
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="outline"
              size="lg"
              className={`h-12 px-8 text-base ${OUTLINE_BUTTON_CLASS} flex items-center gap-2`}
            >
              <LogIn className="w-5 h-5" />
              Log in
            </Button>
          </Link>
        </div>

        <Separator className="mt-16 reveal" />

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 reveal">
          <StatCard value="15,487" label="Active Users" icon={Users} />
          <StatCard value="99.9%" label="Reliable Uptime" icon={Check} />
          <StatCard value="< 2.0s" label="Avg. Load Time" icon={Clock} />
        </div>

        {/* FEATURES */}
        <Card className="mt-16 w-full text-left shadow-2xl border-t-2 border-t-foreground reveal">
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-3xl font-bold tracking-tight">Core Features</CardTitle>
            <CardDescription className="text-base">The tools you need to streamline your productivity.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-0">
            {[
              {
                icon: Feather,
                title: "Frictionless Writing",
                desc: "Powerful Markdown support for formatting, tables, and code blocks.",
              },
              {
                icon: Search,
                title: "Instant Search",
                desc: "Find any note in seconds with fast, full-text indexing.",
              },
              {
                icon: Folder,
                title: "Notebooks & Tags",
                desc: "Organize complex projects using dedicated Notebooks and Tags.",
              },
              {
                icon: Trash2,
                title: "Safe Deletion",
                desc: "Soft-delete notes and instantly restore them when needed.",
              },
              {
                icon: User,
                title: "Security & Profile",
                desc: "Secure your account with comprehensive profile management.",
              },
              {
                icon: Zap,
                title: "Blazing Fast Sync",
                desc: "Low latency ensures your notes sync instantly across devices.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col p-6 rounded-xl border border-border shadow-sm bg-card space-y-2 hover:shadow-lg hover:border-foreground/20 transition-all duration-300"
              >
                <f.icon className="h-8 w-8 text-foreground" />
                <p className="font-semibold text-lg">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground pt-6 border-t">
            The simple power you need, built with modern standards.
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
