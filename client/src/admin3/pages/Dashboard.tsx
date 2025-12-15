"use client"

import type React from "react"

import { type FC, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Users, Feather, MessageSquare, Loader2, AlertTriangle } from "lucide-react"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PieChart, Pie, Cell, Legend } from "recharts"

interface AdminStats {
  totalUsers: number
  totalNotes: number
  totalAiNotes: number
  pendingMessages: number
  userSignups: { date: string; users: number }[]
  noteCreation: { month: string; notes: number }[]
}

const MOCK_ADMIN_STATS: AdminStats = {
  totalUsers: 8450,
  totalNotes: 15320,
  totalAiNotes: 6780,
  pendingMessages: 12,
  userSignups: [
    { date: "Jan", users: 500 },
    { date: "Feb", users: 750 },
    { date: "Mar", users: 900 },
    { date: "Apr", users: 1100 },
    { date: "May", users: 1500 },
    { date: "Jun", users: 1200 },
  ],
  noteCreation: [
    { month: "Jan", notes: 2500 },
    { month: "Feb", notes: 3100 },
    { month: "Mar", notes: 3500 },
    { month: "Apr", notes: 4200 },
    { month: "May", notes: 5000 },
    { month: "Jun", notes: 4800 },
  ],
}

const useAdminDashboardData = () => {
  const queryResult = useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: () => api.get("/admin/stats").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  })

  const useMockData = queryResult.isError || process.env.NODE_ENV === "development"

  return {
    data: useMockData ? MOCK_ADMIN_STATS : queryResult.data,
    isLoading: queryResult.isLoading && !useMockData,
    isError: queryResult.isError && !useMockData,
  }
}

interface MetricCardProps {
  title: string
  value: number | string
  icon: React.ElementType
  description: string
  color: string
}

const MetricCard: FC<MetricCardProps> = ({ title, value, icon: Icon, description, color }) => (
  <Card className="transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderColor: color }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" style={{ color: color }} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
)

const UserSignupChart: React.FC<{ data: AdminStats["userSignups"] }> = ({ data }) => (
  <Card className="col-span-12 lg:col-span-8 h-[400px]">
    <CardHeader>
      <CardTitle>User Signups Trend</CardTitle>
      <CardDescription>New users registered over the last period.</CardDescription>
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "4px", color: "white" }}
            formatter={(value: number) => [`${value} Users`, "Signups"]}
          />
          <Bar dataKey="users" fill="#ec4899" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

const noteDistributionData = (stats: AdminStats) => [
  { name: "AI Notes", value: stats.totalAiNotes },
  { name: "Manual Notes", value: stats.totalNotes - stats.totalAiNotes },
]

const NoteDistributionChart: React.FC<{ data: ReturnType<typeof noteDistributionData> }> = ({ data }) => (
  <Card className="col-span-12 lg:col-span-4 h-[400px]">
    <CardHeader>
      <CardTitle>Note Type Distribution</CardTitle>
      <CardDescription>Breakdown of manual vs. AI Generated notes.</CardDescription>
    </CardHeader>
    <CardContent className="h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={["#ec4899", "#facc15"][index % 2]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "4px", color: "white" }}
            formatter={(value: number, name: string) => [`${value} Notes`, name]}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

const Dashboard: FC = () => {
  const { data: stats, isLoading, isError } = useAdminDashboardData()

  const signupData = stats?.userSignups || []
  const noteDistribution = useMemo(() => (stats ? noteDistributionData(stats) : []), [stats])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen-minus-header">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Loading dashboard data...</p>
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="p-6">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> API Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Failed to load live admin statistics. Please check server connection.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analytics Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          description="Total registered accounts"
          color="hsl(var(--primary))"
        />
        <MetricCard
          title="Total Notes"
          value={stats.totalNotes.toLocaleString()}
          icon={Feather}
          description="Total notes created by users"
          color="hsl(var(--primary))"
        />
        <MetricCard
          title="AI Generated"
          value={stats.totalAiNotes.toLocaleString()}
          icon={DollarSign}
          description="Notes generated using AI tools"
          color="hsl(var(--primary))"
        />
        <MetricCard
          title="Pending Inbox"
          value={stats.pendingMessages}
          icon={MessageSquare}
          description="Unread support messages"
          color="hsl(var(--primary))"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <UserSignupChart data={signupData} />
        <NoteDistributionChart data={noteDistribution} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Latest notes, logins, and signups.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-4">(Data table with recent activities will go here)</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
