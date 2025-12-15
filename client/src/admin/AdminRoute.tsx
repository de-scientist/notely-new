import AdminLayout from "./components/AdminLayout"
import { AdminDashboard } from "./components/AdminDashboardIndex"
import RAGUploader from "./components/RAGUploader"
import QueriesTable from "./components/QueriesTable"
import MessagesInbox from "./components/MessagesInbox"
import { Routes, Route } from "react-router-dom"

export default function AdminRoute() {
  return (
    <Routes>
      {/* Parent path: /admin, using empty path "" to inherit the parent router's path segment */}
      <Route path="" element={<AdminLayout />}>
        <Route path="rag" element={<RAGUploader />} />
        <Route path="queries" element={<QueriesTable />} />
        <Route path="messages" element={<MessagesInbox />} />

        {/* Index route uses the new placeholder component */}
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}
