"use client";
import { useState } from "react";
import { ContractPreview } from "../components/contractPreview";
import { BiChat, BiChevronLeft, BiSearch, BiSend, BiX } from "react-icons/bi";
import { HiOutlineDocument } from "react-icons/hi";

export default function FilesPage() {
  const [chatModal, setChatModal] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "other",
      text: "Төгс! Та манай анхны хуралдаанд хэзээ орох боломжтой вэ?",
    },
    {
      from: "me",
      text: "Бямба гаригт 14:00 цагт яах вэ? Бид тус бүр нэг цаг хийж болно.",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: message }]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] px-8 py-10">
      {/* ── Гарчиг ── */}
      <div className="flex flex-col gap-1 mb-8">
        <p className="text-white text-2xl font-semibold tracking-tight">
          Миний баримтууд
        </p>
        <p className="text-slate-500 text-sm">
          Таны бүх хөдөлмөрийн баримт бичгүүдийг энд харах болон татаж авах
          боломжтой.
        </p>
      </div>

      {/* ── Хайлт + Шүүлтүүр ── */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm pointer-events-none" />
          <input
            type="search"
            placeholder="Баримт хайх..."
            className="w-full h-9 pl-8 pr-3 rounded-lg text-sm bg-white/5 border border-white/10 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-white/25 transition-all duration-150"
          />
        </div>
        <select className="h-9 px-5 rounded-lg text-sm bg-black border border-white/10 text-slate-400 focus:outline-none focus:border-white/25 transition-all duration-150 cursor-pointer">
          <option value="all">Бүх үе шат</option>
          <option value="pdf">PDF</option>
          <option value="doc">DOCX</option>
        </select>
      </div>

      {/* ── Карт grid ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-slate-300 text-sm font-medium">Бүртгэл</p>
          <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-slate-500">
            4 баримт
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <ContractPreview />
          <ContractPreview />
          <ContractPreview />
          <ContractPreview />
        </div>
      </div>

      {/* ── Preview modal ── */}

      {/* ── Fixed: Chat товч + modal ── */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {/* ── Chat modal ── */}
        {chatModal && (
          <div className="w-85 h-130 bg-[#1c1424] rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden border border-white/8">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
              <button className="text-white/70 hover:text-white transition-colors cursor-pointer">
                <BiChevronLeft className="text-2xl" />
              </button>

              <div className="relative">
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-500 border-2 border-[#1c1424]" />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-white text-[14px] font-semibold leading-tight">
                  HR
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Идэвхгүй</p>
              </div>

              <button
                onClick={() => setChatModal(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-none">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "other" && (
                    <img
                      src="https://i.pravatar.cc/150?img=12"
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5"
                    />
                  )}
                  <div
                    className={`
                      max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed
                      ${
                        msg.from === "me"
                          ? "bg-[#6c63ff] text-white rounded-[18px] rounded-br-[5px]"
                          : "bg-[#2d2438] text-slate-200 rounded-[18px] rounded-bl-[5px]"
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/8 flex items-center gap-3">
              <button className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer shrink-0">
                <HiOutlineDocument className="text-xl" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Мессеж..."
                className="flex-1 border border-gray-500 rounded-lg pl-3 bg-transparent text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="w-9 h-9 rounded-full bg-[#6c63ff] hover:bg-[#7b74ff] flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 shadow-lg shadow-[#6c63ff]/30"
              >
                <BiSend className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Chat нээх/хаах товч */}
        <button
          onClick={() => setChatModal(!chatModal)}
          className="w-12 h-12 rounded-full bg-[#6c63ff] hover:bg-[#7b74ff] text-white flex items-center justify-center shadow-lg shadow-[#6c63ff]/30 transition-all cursor-pointer"
        >
          {chatModal ? (
            <BiX className="text-xl" />
          ) : (
            <BiChat className="text-xl" />
          )}
        </button>
      </div>
    </div>
  );
}
