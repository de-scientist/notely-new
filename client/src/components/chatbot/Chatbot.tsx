"use client"

import ChatWindow from "../voiceAI/ChatWindow"

export default function Chatbot() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="mb-3">
        <ChatWindow />
      </div>

      <button className="bg-black text-white p-4 rounded-full shadow-xl">💬</button>
    </div>
  )
}
