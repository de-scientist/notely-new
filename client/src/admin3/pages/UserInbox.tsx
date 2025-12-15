import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api" // your axios/fetch wrapper
import UserInboxCard from "../components/UserInboxCard"
import Header from "../components/Header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle, Loader2, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// ----------------------------------------------------
// ✅ FIX 1: UPDATED Message Interface
// ----------------------------------------------------
interface Message {
  id: string
  name: string // userName -> name
  email: string
  subject: string
  message: string // content -> message
  createdAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    username: string
  }
}
// ----------------------------------------------------

// ----------------------------------------------------
// Custom Hook for Data Fetching with Mock Fallback
// ----------------------------------------------------
const useAdminMessagesData = () => {
  return useQuery<{ contacts: Message[] }>({
    queryKey: ["userMessages"],
    queryFn: async () => {
      const res = await api.get("/contact")
      return { contacts: res.data.contacts }
    },
    select: (data) =>
      data.contacts.map((contact) => ({
        id: contact.id,
        name: contact.user ? `${contact.user.firstName} ${contact.user.lastName}` : contact.name,
        email: contact.user?.email || contact.email,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt,
        user: contact.user,
      })),
  })
}

export default function UserInbox() {
  // Use the new hook for data fetching
  const { data: messages, isLoading, isError } = useAdminMessagesData()

  // ----------------------------------------------------
  // ⚙️ UI Improvement: Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex flex-1 items-center justify-center p-6 text-lg text-muted-foreground">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
          Loading messages...
        </div>
      </div>
    )
  }

  // ⚙️ UI Improvement: Error State (only shows if mock fallback fails or is disabled)
  if (isError) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-[400px] border-destructive bg-card">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                API Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                Failed to load user messages. Check the backend connection or API endpoint.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // ⚙️ UI Improvement: Main Content
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center text-foreground">
          <Mail className="mr-3 h-7 w-7 text-primary" />
          User Messages
        </h1>
        <p className="text-muted-foreground mt-1">Review contact and support messages from users.</p>
        <Separator className="my-4 bg-border" />
      </div>

      <main className="px-6 pb-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* 'messages' is guaranteed to be an array here (either real or mock) */}
        {messages && messages.length > 0 ? (
          messages.map((msg) => <UserInboxCard key={msg.id} message={msg} />)
        ) : (
          <p className="text-muted-foreground col-span-full text-center py-10">
            🎉 Inbox zero! No new messages in the inbox.
          </p>
        )}
      </main>
    </div>
  )
}
