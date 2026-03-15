"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BiSearch } from "react-icons/bi";

import { buildGraphQLHeaders } from "@/lib/apollo-client";
import { GET_DOCUMENTS, GET_ME } from "@/graphql/queries";
import type { Document, Employee } from "@/lib/types";

import { ContractPreview } from "@/components/contractPreview";

const TOKEN_STORAGE_KEY = "epas_auth_token";

export default function FilesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [authToken] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "",
  );

  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery<{ me: Employee | null }>(GET_ME, {
    skip: !authToken,
    context: {
      headers: buildGraphQLHeaders({ authToken }),
    },
    fetchPolicy: "network-only",
  });

  const employee = meData?.me ?? null;

  const {
    data: documentsData,
    loading: documentsLoading,
    error: documentsError,
  } = useQuery<{ documents: Document[] }>(GET_DOCUMENTS, {
    skip: !authToken || !employee?.id,
    variables: {
      employeeId: employee?.id ?? "",
    },
    context: {
      headers: buildGraphQLHeaders({ authToken }),
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!authToken) {
      router.replace("/auth/employee");
      return;
    }

    if (!meLoading && !employee) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.replace("/auth/employee");
    }
  }, [authToken, employee, meLoading, router]);

  const documents = useMemo(() => documentsData?.documents ?? [], [documentsData]);
  const loading = meLoading || Boolean(employee?.id && documentsLoading);
  const error = meError?.message ?? documentsError?.message ?? null;

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

  if (!authToken) {
    return null;
  }

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
    </div>
  );
}
