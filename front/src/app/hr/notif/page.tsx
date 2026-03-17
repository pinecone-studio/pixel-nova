"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSend, FiX } from "react-icons/fi";

import {
  AcepptedIcon,
  AnnouncementIcon,
  BellIcon,
  CalIcon,
} from "@/components/icons";
import {
  CREATE_ANNOUNCEMENT_DRAFT,
  PUBLISH_ANNOUNCEMENT,
  UPDATE_ANNOUNCEMENT_DRAFT,
} from "@/graphql/mutations";
import { GET_ANNOUNCEMENTS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Announcement } from "@/lib/types";
import { Clock, EyeIcon, UsersIcon } from "lucide-react";

type DraftState = {
  id?: string;
  title: string;
  body: string;
  audience: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Ноорог",
  published: "Нийтлэгдсэн",
};

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Бүх ажилчид",
  hr: "HR хэлтэс",
  employees: "Зөвхөн ажилтнууд",
};

export default function NotificationsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>({
    title: "",
    body: "",
    audience: "all",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<{
    announcements: Announcement[];
  }>(GET_ANNOUNCEMENTS, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
    fetchPolicy: "network-only",
  });

  const [createDraft, { loading: creating }] = useMutation(
    CREATE_ANNOUNCEMENT_DRAFT,
    { context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) } },
  );
  const [updateDraft, { loading: updating }] = useMutation(
    UPDATE_ANNOUNCEMENT_DRAFT,
    { context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) } },
  );
  const [publishAnnouncement, { loading: publishing }] = useMutation(
    PUBLISH_ANNOUNCEMENT,
    { context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) } },
  );

  const rows = useMemo(() => data?.announcements ?? [], [data]);
  const totalCount = rows.length;
  const publishedCount = rows.filter(
    (row) => row.status === "published",
  ).length;
  const draftCount = rows.filter((row) => row.status === "draft").length;

  function openNewDraft() {
    setDraft({ title: "", body: "", audience: "all" });
    setDrawerOpen(true);
    setError(null);
    setMessage(null);
  }

  function openEdit(row: Announcement) {
    setDraft({
      id: row.id,
      title: row.title,
      body: row.body,
      audience: row.audience ?? "all",
    });
    setDrawerOpen(true);
    setError(null);
    setMessage(null);
  }

  async function handleSaveDraft() {
    setError(null);
    setMessage(null);
    if (!draft.title.trim() || !draft.body.trim()) {
      setError("Гарчиг болон агуулгыг бөглөнө үү.");
      return;
    }

    if (draft.id) {
      await updateDraft({
        variables: {
          id: draft.id,
          title: draft.title.trim(),
          body: draft.body.trim(),
          audience: draft.audience,
        },
      });
      setMessage("Ноорог амжилттай шинэчлэгдлээ.");
    } else {
      await createDraft({
        variables: {
          title: draft.title.trim(),
          body: draft.body.trim(),
          audience: draft.audience,
        },
      });
      setMessage("Шинэ ноорог үүслээ.");
    }

    await refetch();
    setDrawerOpen(false);
  }

  async function handlePublish(id: string) {
    setError(null);
    setMessage(null);
    await publishAnnouncement({ variables: { id } });
    await refetch();
    setMessage("Мэдэгдэл бүх ажилтанд илгээгдлээ.");
  }

  const busy = creating || updating || publishing;

  return (
    <div className="min-h-screen bg-[#05080e] text-white font-sans">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">
              HR • Мэдэгдэл
            </p>
            <h1 className="text-2xl font-semibold mt-2">Мэдэгдэл</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-[220px] rounded-full border border-white/10 bg-white/5 px-4 text-xs text-slate-300 flex items-center">
              Хайх...
            </div>
            <button
              onClick={openNewDraft}
              className="h-10 px-4 rounded-xl bg-[#0ad4b1] text-black text-sm font-semibold flex items-center gap-2 hover:bg-[#08bfa0]"
            >
              <FiPlus /> Шинэ мэдэгдэл
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-[#0b121b] p-5 flex items-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <AnnouncementIcon />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-xs text-slate-500">Нийт мэдэгдэл</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b121b] p-5 flex items-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300  flex items-center justify-center">
              <AcepptedIcon className="text-emerald-300 " />
            </div>
            <div>
              <p className="text-3xl font-bold">{publishedCount}</p>
              <p className="text-xs text-slate-500">Нийтлэгдсэн</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b121b] p-5 flex items-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300  flex items-center justify-center">
              <Clock className="text-emerald-300 " />
            </div>
            <div>
              <p className="text-3xl font-bold">{draftCount}</p>
              <p className="text-xs text-slate-500">Ноорог</p>
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 mb-4">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mb-4">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-[#0b121b] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <p className="text-sm text-slate-300 font-medium">Мэдэгдлүүд</p>
            <span className="text-xs text-slate-500">
              {loading ? "Ачаалж байна..." : `${rows.length} мэдэгдэл`}
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-5 text-sm text-slate-500">Ачаалж байна...</div>
            ) : rows.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">
                Одоогоор мэдэгдэл алга байна.
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#0f1722] border border-white/10 flex items-center justify-center text-emerald-300">
                      <AnnouncementIcon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-semibold">
                          {row.title}
                        </p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-[#00BC7D] border border-[#00BC7D]">
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#77818C] mt-1 line-clamp-2">
                        {row.body}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-[#77818C]">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-4 h-4 text-[#77818C]" />
                          {AUDIENCE_LABEL[row.audience] ?? row.audience}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalIcon className="text-[#77818C] w-4 h-4" />
                          {row.publishedAt
                            ? `Нийтэлсэн: ${new Date(row.publishedAt).toLocaleDateString("mn-MN")}`
                            : `Үүсгэсэн: ${new Date(row.createdAt).toLocaleDateString("mn-MN")}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4 text-[#77818C]" />
                          {row.readCount}/{row.recipientCount} уншсан
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.status === "draft" ? (
                      <>
                        <button
                          onClick={() => openEdit(row)}
                          className="h-8 px-3 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white hover:border-white/20 flex items-center gap-2"
                        >
                          <FiEdit2 /> Засах
                        </button>
                        <button
                          onClick={() => handlePublish(row.id)}
                          className="h-8 px-3 rounded-lg bg-[#0ad4b1] text-black text-xs font-semibold flex items-center gap-2 hover:bg-[#08bfa0]"
                        >
                          <FiSend /> Илгээх
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Нийтлэгдсэн
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative h-[485px] w-[500px] rounded-lg bg-[#0b111a] border-l border-white/10 p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Шинэ мэдэгдэл</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-white flex justify-center items-center cursor-pointer"
              >
                <FiX />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Гарчиг</label>
              <input
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Мэдэгдлийн гарчиг"
                className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Агуулга</label>
              <textarea
                value={draft.body}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Мэдэгдлийн агуулга"
                rows={8}
                className="rounded-xl w-[452px] h-30 border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/40 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-300">Хүлээн авагчид</label>
              <select
                value={draft.audience}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, audience: e.target.value }))
                }
                className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-500/40"
              >
                <option value="all">Бүх ажилчид</option>
                <option value="hr">HR хэлтэс</option>
                <option value="employees">Зөвхөн ажилтнууд</option>
              </select>
            </div>
            <div className="mt-auto flex items-center justify-end gap-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-10 px-4 cursor-pointer rounded-xl border border-white/10 text-slate-300 text-sm"
              >
                Болих
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={busy}
                className="h-10 px-4 cursor-pointer rounded-xl bg-[#0ad4b1] text-black text-sm font-semibold hover:bg-[#08bfa0] disabled:opacity-60"
              >
                {draft.id ? "Шинэчлэх" : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
