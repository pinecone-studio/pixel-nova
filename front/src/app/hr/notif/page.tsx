"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSend, FiX } from "react-icons/fi";

import {
  AcepptedIcon,
  AnnouncementIcon,
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
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 font-sans">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">
              HR • Мэдэгдэл
            </p>
            <h1 className="text-2xl font-semibold mt-2 text-slate-900">
              Мэдэгдэл
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-55 rounded-full border border-slate-200 bg-white px-4 text-xs text-slate-400 flex items-center">
              Хайх...
            </div>
            <button
              onClick={openNewDraft}
              className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-slate-800"
            >
              <FiPlus /> Шинэ мэдэгдэл
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <AnnouncementIcon />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{totalCount}</p>
              <p className="text-xs text-slate-500">Нийт мэдэгдэл</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <AcepptedIcon className="text-emerald-600 " />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {publishedCount}
              </p>
              <p className="text-xs text-slate-500">Нийтлэгдсэн</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Clock className="text-emerald-600 " />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{draftCount}</p>
              <p className="text-xs text-slate-500">Ноорог</p>
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 mb-4">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-700 font-medium">Мэдэгдлүүд</p>
            <span className="text-xs text-slate-500">
              {loading ? "Ачаалж байна..." : `${rows.length} мэдэгдэл`}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
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
                  className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <AnnouncementIcon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-900 text-sm font-semibold">
                          {row.title}
                        </p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {row.body}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-4 h-4 text-slate-400" />
                          {AUDIENCE_LABEL[row.audience] ?? row.audience}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalIcon className="text-slate-400 w-4 h-4" />
                          {row.publishedAt
                            ? `Нийтэлсэн: ${new Date(row.publishedAt).toLocaleDateString("mn-MN")}`
                            : `Үүсгэсэн: ${new Date(row.createdAt).toLocaleDateString("mn-MN")}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4 text-slate-400" />
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
                          className="h-8 px-3 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-800 hover:border-slate-300 flex items-center gap-2"
                        >
                          <FiEdit2 /> Засах
                        </button>
                        <button
                          onClick={() => handlePublish(row.id)}
                          className="h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-slate-800"
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
          <div className="relative h-121.25 w-125 rounded-lg bg-white border border-slate-200 p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900">
                Шинэ мэдэгдэл
              </p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 flex justify-center items-center cursor-pointer"
              >
                <FiX />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-700">Гарчиг</label>
              <input
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Мэдэгдлийн гарчиг"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-500/40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-700">Агуулга</label>
              <textarea
                value={draft.body}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Мэдэгдлийн агуулга"
                rows={8}
                className="rounded-xl w-113 h-30 border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-500/40 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-600">Хүлээн авагчид</label>
              <select
                value={draft.audience}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, audience: e.target.value }))
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-500/40"
              >
                <option value="all">Бүх ажилчид</option>
                <option value="hr">HR хэлтэс</option>
                <option value="employees">Зөвхөн ажилтнууд</option>
              </select>
            </div>
            <div className="mt-auto flex items-center justify-end gap-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-10 px-4 cursor-pointer rounded-xl border border-slate-200 text-slate-600 text-sm"
              >
                Болих
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={busy}
                className="h-10 px-4 cursor-pointer rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
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
