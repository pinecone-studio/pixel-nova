"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { BiChevronRight, BiSearch, BiX } from "react-icons/bi";
import { FiFileText, FiCheckCircle } from "react-icons/fi";

import { useEmployeeSession } from "@/components/pages/employee/useEmployeeSession";
import { GET_AUDIT_LOGS } from "@/graphql/queries/audit-logs";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { AuditLog } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  add_employee: "Шинэ ажилтан авах",
  promote_employee: "Тушаал дэвшүүлэх",
  change_position: "Албан тушаал солих",
  offboard_employee: "Ажлаас чөлөөлөх",
};

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Ажилд орох",
  working: "Ажиллах",
  offboarding: "Ажлаас гарах",
};

type FilterAction = "" | "add_employee" | "promote_employee" | "change_position" | "offboard_employee";

const newEmployeeRequests: EmployeeRequest[] = [
  {
    id: "emp-1",
    firstName: "Дуламрагчаа",
    lastName: "Дорж",
    email: "Dorj@company.com",
    department: "Engineering",
    role: "Junior Engineer",
    submittedAt: "2026/03/14 9:15AM",
    files: [
      {
        id: "f-1",
        title: "CV, Resume",
        fileName: "01_employment_contract.pdf",
      },
      {
        id: "f-2",
        title: "Хөдөлмөрийн гэрээ",
        fileName: "01_employment_contract.pdf",
      },
      {
        id: "f-3",
        title: "Туршилтаар авах тушаал",
        fileName: "01_employment_contract.pdf",
      },
      {
        id: "f-4",
        title: "Нууцын гэрээ",
        fileName: "01_employment_contract.pdf",
      },
    ],
  },
  {
    id: "emp-2",
    firstName: "Бат-Эрдэнэ",
    lastName: "Дорж",
    email: "bat.erdene@company.com",
    department: "Engineering",
    role: "Junior Engineer",
    submittedAt: "2026/03/14 9:15AM",
    files: [
      { id: "f-5", title: "CV, Resume", fileName: "02_resume.pdf" },
      {
        id: "f-6",
        title: "Хөдөлмөрийн гэрээ",
        fileName: "02_employment_contract.pdf",
      },
      {
        id: "f-7",
        title: "Туршилтаар авах тушаал",
        fileName: "02_probation_order.pdf",
      },
      { id: "f-8", title: "Нууцын гэрээ", fileName: "02_confidentiality.pdf" },
    ],
  },
  {
    id: "emp-3",
    firstName: "Номин",
    lastName: "Эрдэнэ",
    email: "nomin@company.com",
    department: "Design",
    role: "Product Designer",
    submittedAt: "2026/03/13 4:20PM",
    files: [
      { id: "f-9", title: "CV, Resume", fileName: "nomin_resume.pdf" },
      {
        id: "f-10",
        title: "Хөдөлмөрийн гэрээ",
        fileName: "nomin_contract.pdf",
      },
    ],
  },
  {
    id: "emp-4",
    firstName: "Тэмүүлэн",
    lastName: "Болд",
    email: "temuulen@company.com",
    department: "Finance",
    role: "Accountant",
    submittedAt: "2026/03/13 10:12AM",
    files: [
      { id: "f-11", title: "CV, Resume", fileName: "temuulen_resume.pdf" },
      {
        id: "f-12",
        title: "Нууцын гэрээ",
        fileName: "temuulen_confidentiality.pdf",
      },
    ],
  },
];

const documentReviews: DocumentReview[] = [
  {
    id: "doc-1",
    title: "Хөдөлмөрийн гэрээ шинэчлэлт",
    modalTitle: "Шинэ баримт",
    description:
      "Хөдөлмөрийн гэрээнд нэмэлт өөрчлөлт оруулав. Уншиж танилцана уу.",
    fileTitle: "Хөдөлмөрийн гэрээ",
    fileName: "01_employment_contract.pdf",
    badge: "Шинэчлэлт",
    badgeTone: "blue",
    avatarColor: "from-[#8D532D] to-[#D9A36B]",
    avatarLabel: "ДЦ",
  },
  {
    id: "doc-2",
    title: "Туршилтаар авах тушаал",
    modalTitle: "Шинэ баримт",
    description:
      "Туршилтаар авах тушаалын шинэ хувилбар хавсаргалаа. Уншиж танилцана уу.",
    fileTitle: "Туршилтаар авах тушаал",
    fileName: "02_probation_order.pdf",
    badge: "Шинэ баримт",
    badgeTone: "gold",
    avatarColor: "from-[#D29A28] to-[#F4C95A]",
    avatarLabel: "БЭ",
  },
  {
    id: "doc-3",
    title: "Ажлын байрны тодорхойлолт шинэчлэлт",
    modalTitle: "Шинэ баримт",
    description:
      "Ажлын байрны тодорхойлолтод өөрчлөлт оруулсан. Шинэчилсэн файлыг шалгана уу.",
    fileTitle: "Ажлын байрны тодорхойлолт",
    fileName: "03_job_description.pdf",
    badge: "Шинэчлэлт",
    badgeTone: "blue",
    avatarColor: "from-[#1B5CC8] to-[#5CA4FF]",
    avatarLabel: "НЭ",
  },
  {
    id: "doc-4",
    title: "Нууцын гэрээ шинэчлэлт",
    modalTitle: "Шинэ баримт",
    description:
      "Нууцын гэрээний шинэчилсэн хувилбар ирлээ. Уншиж танилцана уу.",
    fileTitle: "Нууцын гэрээ",
    fileName: "04_confidentiality.pdf",
    badge: "Шинэчлэлт",
    badgeTone: "blue",
    avatarColor: "from-[#0D8892] to-[#1BC5D8]",
    avatarLabel: "ТБ",
  },
];

const statusUpdates: StatusUpdate[] = [
  {
    id: "status-1",
    title: "Ажиллах төлөв шинэчлэлт",
    subtitle: "Д. Дуламрагчаа",
    status: "Туршилтын хугацаа",
    tone: "gold",
  },
  {
    id: "status-2",
    title: "Салбар шинэчлэлт",
    subtitle: "Бат-Эрдэнэ Дорж",
    status: "Шинэ салбар",
    tone: "emerald",
  },
];

const FILTER_OPTIONS: Record<
  AuditView,
  Array<{ value: ListFilter; label: string }>
> = {
  newEmployee: [
    { value: "all", label: "Бүгд" },
    { value: "engineering", label: "Engineering" },
    { value: "fourDocs", label: "4 баримт" },
  ],
  documentReview: [
    { value: "all", label: "Бүгд" },
    { value: "updates", label: "Шинэчлэлт" },
    { value: "newDocs", label: "Шинэ баримт" },
  ],
  statusUpdate: [
    { value: "all", label: "Бүгд" },
    { value: "gold", label: "Онцлох" },
  ],
};

function AuditStatusBadge({ log }: { log: AuditLog }) {
  if (log.notificationError) {
    return (
      <span className="rounded-full border border-[#FF8A80] bg-white px-3 py-1 text-[12px] font-medium text-[#FF3B30]">
        Алдаатай
      </span>
    );
  }
  if (log.documentsGenerated && log.recipientsNotified) {
    return (
      <span className="rounded-full border border-[#86EFAC] bg-white px-3 py-1 text-[12px] font-medium text-[#22C55E]">
        Амжилттай
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[#FDE68A] bg-white px-3 py-1 text-[12px] font-medium text-[#D97706]">
      Хэсэгчлэн
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

function AuditDetailModal({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  const dateStr = new Date(log.timestamp).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] rounded-[28px] border border-[#EAECF0] bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[13px] text-[#98A2B3]">Аудит бүртгэл</p>
            <h2 className="mt-2 text-[20px] font-semibold text-[#101828]">
              {ACTION_LABELS[log.action] ?? log.action}
            </h2>
            <p className="mt-1 text-[13px] text-[#667085]">{dateStr}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#101828] transition hover:opacity-70">
            <BiX className="h-7 w-7" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Phase */}
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-[#667085]">Үе шат</span>
            <span className="font-medium text-[#101828]">
              {PHASE_LABELS[log.phase] ?? log.phase}
            </span>
          </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-[#101828]">
            Хавсаргасан файл
          </p>
          <div className="flex flex-col gap-3">
            {entry.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-2xl border border-[#EAECF0] bg-white px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D0D5DD] bg-[#F9FAFB] text-[#667085]">
                    <FiFileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#101828]">
                      {file.title}
                    </p>
                    <p className="text-xs text-[#98A2B3]">{file.fileName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#98A2B3]">Баримт үүсээгүй</p>
            )}
          </div>

        <div>
          <p className="mb-3 text-[18px] font-semibold text-[#101828]">
            Тайлбар
          </p>
          <div className="min-h-[120px] rounded-[18px] border border-[#D0D5DD] bg-[#FCFCFD] px-5 py-4 text-[18px] leading-[1.35] text-[#667085]">
            {entry.description}
          </div>

        <div className="mt-8">
          <p className="mb-4 text-[18px] font-semibold text-[#101828]">
            Хавсаргасан файл
          </p>
          <div className="flex items-center justify-between rounded-[18px] border border-[#EAECF0] bg-white px-3.5 py-3.5">
            <div className="flex items-center gap-4">
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[20px] border border-[#D0D5DD] bg-[#F9FAFB] text-[#667085]">
                <FiFileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[#101828]">
                  {entry.fileTitle}
                </p>
                <p className="mt-1 text-[14px] text-[#98A2B3]">
                  {entry.fileName}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#101828] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1D2939]">
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit row
// ---------------------------------------------------------------------------

function AuditRow({
  log,
  onOpen,
}: {
  log: AuditLog;
  onOpen: (log: AuditLog) => void;
}) {
  const dateStr = new Date(log.timestamp).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <button
      type="button"
      onClick={() => onOpen(log)}
      className="flex w-full items-center justify-between rounded-[20px] border border-[#EAECF0] bg-white px-5 py-5 text-left transition hover:border-[#D0D5DD] hover:bg-[#FCFCFD]">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
            log.documentsGenerated
              ? "border-[#B7EAC7] bg-[#F0FDF4] text-[#22C55E]"
              : "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]"
          }`}>
          {log.documentsGenerated ? (
            <FiCheckCircle className="h-5 w-5" />
          ) : (
            <FiFileText className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#101828]">
            {ACTION_LABELS[log.action] ?? log.action}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-[#98A2B3]">
            <span>{PHASE_LABELS[log.phase] ?? log.phase}</span>
            <span>·</span>
            <span>{log.documentIds.length} баримт</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <AuditStatusBadge log={log} />
        <span className="text-[13px] text-[#98A2B3]">{dateStr}</span>
        <BiChevronRight className="h-6 w-6 text-[#98A2B3]" />
      </div>
    </button>
  );
}

function DocumentRow({
  entry,
  onOpen,
}: {
  entry: DocumentReview;
  onOpen: (entry: DocumentReview) => void;
}) {
  const badgeClasses =
    entry.badgeTone === "gold"
      ? "border-[#FF8A80] bg-white text-[#FF3B30]"
      : "border-[#86EFAC] bg-white text-[#22C55E]";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(entry)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(entry);
        }
      }}
      className="flex w-full items-center justify-between border-b border-[#EAECF0] px-4 py-6 text-left transition hover:bg-[#FCFCFD] last:border-b-0"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#98C1FF] bg-white text-[#2484FF]">
          <FiFileText className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[16px] font-medium text-[#101828]">
            {entry.title}
          </p>
          <p className="mt-1 text-[14px] text-[#98A2B3]">{entry.fileName}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${badgeClasses}`}
        >
          {entry.badge}
        </span>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${entry.avatarColor} text-sm font-semibold text-white`}
        >
          {entry.avatarLabel}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(entry);
          }}
          className="rounded-full p-2 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
        >
          <FiEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="rounded-full p-2 text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#101828]"
        >
          <BiDownload className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StatusRow({ entry }: { entry: StatusUpdate }) {
  const tone =
    entry.tone === "gold"
      ? "border-[#FF8A80] bg-white text-[#FF3B30]"
      : "border-[#86EFAC] bg-white text-[#22C55E]";

  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#EAECF0] bg-white px-5 py-5">
      <div>
        <p className="text-[16px] font-medium text-[#101828]">{entry.title}</p>
        <p className="mt-1 text-[13px] text-[#98A2B3]">{entry.subtitle}</p>
      </div>
      <span
        className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${tone}`}
      >
        {entry.status}
      </span>
    </div>
  );
}

export function EmployeeAuditComponent() {
  const [selectedView, setSelectedView] = useState<AuditView>("newEmployee");
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeRequest | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentReview | null>(null);

  const filteredEmployees = useMemo(() => {
    return newEmployeeRequests.filter((entry) => {
      const haystack =
        `${entry.firstName} ${entry.lastName} ${entry.email} ${entry.department}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesFilter =
        listFilter === "all"
          ? true
          : listFilter === "engineering"
            ? entry.department === "Engineering"
            : entry.files.length >= 4;

      return matchesSearch && matchesFilter;
    });
  }, [listFilter, search]);

  const filteredDocuments = useMemo(() => {
    return documentReviews.filter((entry) => {
      const haystack =
        `${entry.title} ${entry.fileName} ${entry.badge}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesFilter =
        listFilter === "all"
          ? true
          : listFilter === "updates"
            ? entry.badgeTone === "blue"
            : entry.badgeTone === "gold";

      return matchesSearch && matchesFilter;
    });
  }, [listFilter, search]);

  const filteredStatusUpdates = useMemo(() => {
    return statusUpdates.filter((entry) => {
      const haystack =
        `${entry.title} ${entry.subtitle} ${entry.status}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesFilter = listFilter === "all" ? true : entry.tone === "gold";

      return matchesSearch && matchesFilter;
    });
  }, [listFilter, search]);

  const selectedList =
    selectedView === "newEmployee"
      ? filteredEmployees.length
      : selectedView === "documentReview"
        ? filteredDocuments.length
        : filteredStatusUpdates.length;

  const visibleFilterOptions = FILTER_OPTIONS[selectedView];

  return (
    <div className="bg-[#F5F7FB]">
      {selectedEmployee ? (
        <EmployeeRequestModal
          entry={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      ) : null}
      {selectedDocument ? (
        <DocumentReviewModal
          entry={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      ) : null}

      <div className="mx-auto flex max-w-full w-[1061px] flex-col mt-8">
        <div className="flex w-full flex-col justify-between h-[61px]">
          <h1 className="text-[28px] items-center flex h-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#101828]">
            Аудит хүсэлтүүд
          </h1>
          <p className="text-[16px] h-6 flex items-center text-[#667085]">
            Хүний нөөцийн ажилтнаас илгээсэн хүсэлтүүд
          </p>
        </div>

        <div className="flex w-full flex-col h-[120px] mt-[38px] lg:flex-row">
          <button
            type="button"
            onClick={() => {
              setSelectedView("newEmployee");
              setListFilter("all");
            }}
            className={`flex h-full cursor-pointer min-w-0 items-center justify-between rounded-[24px] border px-7 text-left transition-[flex-basis,background-color,border-color] duration-300 lg:basis-[34%] ${selectedView === "newEmployee" ? "lg:basis-[66%]" : ""} ${summaryCardTone(selectedView === "newEmployee", "blue")}`}
          >
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#2F7BFF] text-white shadow-[0_10px_30px_rgba(47,123,255,0.35)]">
                <FiFileText className="h-6 w-6" />
              </div>
              <div className="flex min-w-0 items-end gap-3">
                <span className="text-[46px] font-semibold leading-none text-[#101828]">
                  7
                </span>
                <span className="truncate pb-1 text-[14px] text-[#667085]">
                  Шинэ ажилтны хүсэлт
                </span>
              </div>
            </div>
            <BiChevronRight className="h-8 w-8 text-[#98A2B3]" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedView("documentReview");
              setListFilter("all");
            }}
            className={`flex h-[92px] cursor-pointer min-w-0 items-center justify-between rounded-[24px] border px-7 text-left transition-[flex-basis,background-color,border-color] duration-300 lg:basis-[34%] ${selectedView === "documentReview" ? "lg:basis-[66%]" : ""} ${summaryCardTone(selectedView === "documentReview", "green")}`}
          >
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#12C95E] text-white shadow-[0_10px_30px_rgba(18,201,94,0.28)]">
                <FiCheckCircle className="h-6 w-6" />
              </div>
              <div className="flex min-w-0 items-end gap-3">
                <span className="text-[46px] font-semibold leading-none text-[#101828]">
                  2
                </span>
                <span className="truncate pb-1 text-[14px] text-[#667085]">
                  Баримт бичиг баталгаажуулах
                </span>
              </div>
            </div>
          </div>

        <div className="flex w-full flex-col mt-[38px]">
          <div className="flex w-full items-center gap-3">
            <div className="flex h-[44px] flex-1 items-center gap-3 rounded-[12px] border border-[#D0D5DD] bg-white px-4">
              <BiSearch className="h-5 w-5 text-[#667085]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-[15px] text-[#101828] outline-none placeholder:text-[#98A2B3]"
                placeholder="Хайх..."
              />
            </div>

            <div
              className="relative"
              tabIndex={0}
              onBlur={() => setFilterOpen(false)}
            >
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className="flex h-[44px] w-[186px] items-center justify-between rounded-[12px] border border-[#D0D5DD] bg-white px-4 pr-3 text-[15px] text-[#667085] outline-none"
              >
                <span>
                  {visibleFilterOptions.find((opt) => opt.value === listFilter)
                    ?.label ?? "Бүгд"}
                </span>
                <BiChevronDown className="h-5 w-5 text-[#667085]" />
              </button>
              {filterOpen ? (
                <div className="absolute right-0 mt-2 w-[186px] rounded-sm border border-[#D0D5DD] bg-white shadow-md">
                  {visibleFilterOptions.map((option) => {
                    const active = option.value === listFilter;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setListFilter(option.value as ListFilter);
                          setFilterOpen(false);
                        }}
                        className={`flex w-full px-3 py-2 text-left text-[14px] transition-colors ${
                          active
                            ? "bg-[#E6F0FF] text-[#1D4ED8]"
                            : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex w-full items-center gap-3">
          <div className="flex h-[44px] flex-1 items-center gap-3 rounded-[12px] border border-[#D0D5DD] bg-white px-4">
            <BiSearch className="h-5 w-5 text-[#667085]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-[15px] text-[#101828] outline-none placeholder:text-[#98A2B3]"
              placeholder="Хайх..."
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as FilterAction)}
            className="h-[44px] w-[220px] appearance-none rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[15px] text-[#667085] outline-none">
            <option value="">Бүх үйлдэл</option>
            <option value="add_employee">Шинэ ажилтан авах</option>
            <option value="promote_employee">Тушаал дэвшүүлэх</option>
            <option value="change_position">Албан тушаал солих</option>
            <option value="offboard_employee">Ажлаас чөлөөлөх</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-500">
            {error.message}
          </div>
        )}

        {/* List */}
        <div className="flex items-center gap-4">
          <h2 className="text-[22px] font-semibold text-[#101828]">
            Аудит бүртгэлүүд
          </h2>
          <span className="rounded-full border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-1 text-xs text-[#98A2B3]">
            {auditLogs.length} бүртгэл
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[82px] rounded-[20px] border border-[#EAECF0] bg-[#F9FAFB] skeleton"
              />
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-16 text-center text-[#98A2B3] text-[15px]">
            Аудит бүртгэл олдсонгүй
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {auditLogs.map((log) => (
              <AuditRow key={log.id} log={log} onOpen={setDetailLog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
