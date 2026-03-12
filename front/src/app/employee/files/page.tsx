"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BiChat, BiChevronLeft, BiSearch, BiSend, BiX } from "react-icons/bi";
import { HiOutlineDocument } from "react-icons/hi";

import { ContractPreview } from "../../components/contractPreview";
import { fetchDocuments, fetchMe } from "@/lib/api";
import type { Document, Employee } from "@/lib/types";

const TOKEN_STORAGE_KEY = "epas_auth_token";

export default function FilesPage() {
  const router = useRouter();
  const [chatModal, setChatModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "other",
      text: "Сайн байна уу. Танд хэрэгтэй баримт байвал эндээс нээгээд шалгаж болно.",
    },
    {
      from: "me",
      text: "Баярлалаа, баримтуудаа шалгаад авъя.",
    },
  ]);
  const [authToken, setAuthToken] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrateFiles = useEffectEvent(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const me = await fetchMe(token);
      if (!me) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        router.replace("/auth/employee");
        return;
      }

      const docs = await fetchDocuments(me.id, token);
      setAuthToken(token);
      setEmployee(me);
      setDocuments(docs);
    } catch (err) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setError(err instanceof Error ? err.message : "Баримтуудыг ачаалж чадсангүй.");
      router.replace("/auth/employee");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      router.replace("/auth/employee");
      return;
    }

    void hydrateFiles(storedToken);
  }, [router]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !normalizedSearch ||
        document.documentName.toLowerCase().includes(normalizedSearch) ||
        document.action.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        document.documentName.toLowerCase().endsWith(`.${filter.toLowerCase()}`);

      return matchesSearch && matchesFilter;
    });
  }, [documents, filter, search]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: message }]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] px-8 py-10">
      <div className="flex flex-col gap-1 mb-8">
        <p className="text-white text-2xl font-semibold tracking-tight">
          Миний баримтууд
        </p>
        <p className="text-slate-500 text-sm">
          {employee
            ? `${employee.lastName} ${employee.firstName} ажилтны баримтууд.`
            : "Таны бүх хөдөлмөрийн баримт бичгийг эндээс харах болон татах боломжтой."}
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Баримт хайх..."
            className="w-full h-9 pl-8 pr-3 rounded-lg text-sm bg-white/5 border border-white/10 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-white/25 transition-all duration-150"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 px-5 rounded-lg text-sm bg-black border border-white/10 text-slate-400 focus:outline-none focus:border-white/25 transition-all duration-150 cursor-pointer"
        >
          <option value="all">Бүх төрөл</option>
          <option value="pdf">PDF</option>
          <option value="html">HTML</option>
          <option value="txt">TXT</option>
        </select>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-slate-300 text-sm font-medium">Бүртгэл</p>
          <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-slate-500">
            {filteredDocuments.length} баримт
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center text-slate-400">
            Баримтуудыг ачаалж байна...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center text-red-400">
            {error}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center text-slate-400">
            Баримт олдсонгүй.
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {filteredDocuments.map((document) => (
              <ContractPreview
                key={document.id}
                document={document}
                authToken={authToken}
              />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {chatModal && (
          <div className="w-85 h-130 bg-[#1c1424] rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden border border-white/8">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
              <button className="text-white/70 hover:text-white transition-colors cursor-pointer">
                <BiChevronLeft className="text-2xl" />
              </button>

              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#2d2438] flex items-center justify-center text-white text-sm font-semibold">
                  HR
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-500 border-2 border-[#1c1424]" />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-white text-[14px] font-semibold leading-tight">
                  HR
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Демо чат</p>
              </div>

              <button
                onClick={() => setChatModal(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-none">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "other" && (
                    <div className="w-7 h-7 rounded-full bg-[#2d2438] flex items-center justify-center text-[10px] text-white shrink-0 mb-0.5">
                      HR
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.from === "me"
                        ? "bg-[#6c63ff] text-white rounded-[18px] rounded-br-[5px]"
                        : "bg-[#2d2438] text-slate-200 rounded-[18px] rounded-bl-[5px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

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
