"use client"

import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"

import "./index.css"
import App from "./App.tsx"
import { useAuthStore } from "./store/auth"
import { api } from "./lib/api"

const queryClient = new QueryClient()

function Bootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/me")
        setUser(res.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [setUser, setLoading])

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Bootstrap />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
