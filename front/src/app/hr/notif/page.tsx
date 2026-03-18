"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { FiEdit2, FiPlus, FiSend, FiX } from "react-icons/fi";

import {
  AnnouncementIcon,
  CalIcon,
  ClockIcon,
  EyeIcon,
  SearchIcon,
  UsersIcon,
} from "@/components/icons";
import { useHrOverlay } from "@/components/hr/overlay-context";
import {
  CREATE_ANNOUNCEMENT_DRAFT,
  PUBLISH_ANNOUNCEMENT,
  UPDATE_ANNOUNCEMENT_DRAFT,
} from "@/graphql/mutations/notifications";
import { GET_ANNOUNCEMENTS } from "@/graphql/queries/announcements";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { Announcement } from "@/lib/types";

type DraftState = {
  id?: string;
  title: string;
  body: string;
  audience: string;
};

const STATUS_LABEL: Record<Announcement["status"], string> = {
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
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setBlurred(drawerOpen);
    return () => setBlurred(false);
  }, [drawerOpen, setBlurred]);

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
  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const query = search.toLowerCase();
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(query) ||
        row.body.toLowerCase().includes(query) ||
        (row.audience ?? "").toLowerCase().includes(query),
    );
  }, [rows, search]);
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-[0.24em]">
            HR • Мэдэгдэл
          </p>
          <h1 className="text-2xl font-semibold mt-2 text-slate-900">
            Мэдэгдэл
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Хайх..."
              className="h-10 w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-600 outline-none focus:border-slate-300"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button
            onClick={openNewDraft}
            className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 cursor-pointer"
          >
            <FiPlus /> Шинэ мэдэгдэл
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 flex items-center gap-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <AnnouncementIcon />
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-900">
              {totalCount}
            </p>
            <p className="text-xs text-slate-500">Нийт мэдэгдэл</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 flex items-center gap-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <FiSend className="h-5 w-5" />
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-900">
              {publishedCount}
            </p>
            <p className="text-xs text-slate-500">Нийтлэгдсэн</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 flex items-center gap-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <ClockIcon className="text-amber-600" />
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-900">
              {draftCount}
            </p>
            <p className="text-xs text-slate-500">Ноорог</p>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-600">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white/90 overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-700 font-semibold">Мэдэгдлүүд</p>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {loading ? "Ачаалж байна..." : `${filteredRows.length} мэдэгдэл`}
            </span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Ачаалж байна...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              Одоогоор мэдэгдэл алга байна.
            </div>
          ) : (
            filteredRows.map((row) => {
              const isDraft = row.status === "draft";
              const statusStyles = isDraft
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-emerald-50 text-emerald-600 border-emerald-200";
              return (
                <div
                  key={row.id}
                  className="px-6 py-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      {isDraft ? (
                        <FiEdit2 className="h-5 w-5" />
                      ) : (
                        <FiSend className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-slate-900 text-sm font-semibold">
                          {row.title}
                        </p>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full border ${statusStyles}`}
                        >
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {row.body}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
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
                    {isDraft ? (
                      <>
                        <button
                          onClick={() => openEdit(row)}
                          className="h-8 px-3 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center gap-2 cursor-pointer"
                        >
                          <FiEdit2 /> Засах
                        </button>
                        <button
                          onClick={() => handlePublish(row.id)}
                          className="h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 cursor-pointer"
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
              );
            })
          )}
        </div>
      </div>

      {typeof document !== "undefined" && drawerOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-lg">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setDrawerOpen(false)}
              />
              <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
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
                    className="rounded-xl w-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-500/40 resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-600">
                    Хүлээн авагчид
                  </label>
                  <select
                    value={draft.audience}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        audience: e.target.value,
                      }))
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
