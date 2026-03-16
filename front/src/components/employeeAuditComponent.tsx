"use client";

import { useMemo, useState } from "react";
import {
  BiChevronDown,
  BiChevronRight,
  BiDownload,
  BiSearch,
  BiX,
} from "react-icons/bi";
import { FiCheckCircle, FiEye, FiFileText } from "react-icons/fi";

type AuditView = "newEmployee" | "documentReview" | "statusUpdate";
type ListFilter =
  | "all"
  | "engineering"
  | "fourDocs"
  | "updates"
  | "newDocs"
  | "gold";

type EmployeeRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  submittedAt: string;
  files: { id: string; title: string; fileName: string }[];
};

type DocumentReview = {
  id: string;
  title: string;
  modalTitle: string;
  description: string;
  fileTitle: string;
  fileName: string;
  badge: string;
  badgeTone: "blue" | "gold";
  avatarColor: string;
  avatarLabel: string;
};

type StatusUpdate = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  tone: "gold" | "emerald";
};

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
      { id: "f-1", title: "CV, Resume", fileName: "01_employment_contract.pdf" },
      { id: "f-2", title: "Хөдөлмөрийн гэрээ", fileName: "01_employment_contract.pdf" },
      { id: "f-3", title: "Туршилтаар авах тушаал", fileName: "01_employment_contract.pdf" },
      { id: "f-4", title: "Нууцын гэрээ", fileName: "01_employment_contract.pdf" },
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
      { id: "f-6", title: "Хөдөлмөрийн гэрээ", fileName: "02_employment_contract.pdf" },
      { id: "f-7", title: "Туршилтаар авах тушаал", fileName: "02_probation_order.pdf" },
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
      { id: "f-10", title: "Хөдөлмөрийн гэрээ", fileName: "nomin_contract.pdf" },
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
      { id: "f-12", title: "Нууцын гэрээ", fileName: "temuulen_confidentiality.pdf" },
    ],
  },
];

const documentReviews: DocumentReview[] = [
  {
    id: "doc-1",
    title: "Хөдөлмөрийн гэрээ шинэчлэлт",
    modalTitle: "Шинэ баримт",
    description: "Хөдөлмөрийн гэрээнд нэмэлт өөрчлөлт оруулав. Уншиж танилцана уу.",
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
    description: "Туршилтаар авах тушаалын шинэ хувилбар хавсаргалаа. Уншиж танилцана уу.",
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
    description: "Нууцын гэрээний шинэчилсэн хувилбар ирлээ. Уншиж танилцана уу.",
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

const FILTER_OPTIONS: Record<AuditView, Array<{ value: ListFilter; label: string }>> = {
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

function summaryCardTone(active: boolean, color: "blue" | "green") {
  if (color === "blue") {
    return active
      ? "border-[#0B74FF] bg-[radial-gradient(circle_at_top_left,rgba(14,95,255,0.22),transparent_42%),#060B14]"
      : "border-[#10223D] bg-[#070B12]";
  }

  return active
    ? "border-[#0C9E4F] bg-[radial-gradient(circle_at_top_left,rgba(15,162,71,0.18),transparent_42%),#050B08]"
    : "border-[#133223] bg-[#070B0A]";
}

function sectionLabel(type: AuditView) {
  if (type === "newEmployee") return "Шинэ Ажилтан";
  if (type === "documentReview") return "Баримт бичиг баталгаажуулалт";
  return "Статус шинэчлэлт";
}

function SectionPill({ count }: { count: number }) {
  return (
    <span className="rounded-full border border-[#243243] bg-[#131C28] px-3 py-1 text-xs text-[#7E8A9E]">
      {count} хүсэлт
    </span>
  );
}

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "w-full" : ""}>
      <p className="mb-2 text-sm text-[#D9E2EC]">{label}</p>
      <div className="rounded-xl border border-[#2A3545] bg-[#0C131E] px-4 py-3 text-[15px] text-[#E6EDF5]">
        {value}
      </div>
    </div>
  );
}

function EmployeeRequestModal({
  entry,
  onClose,
}: {
  entry: EmployeeRequest;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[612px] rounded-[28px] border border-[#1A2431] bg-[#09111C] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-[13px] text-[#9AA7BA]">Add Employee request</p>
            <h2 className="mt-3 text-[20px] font-semibold text-white">
              Шинэ ажилтан
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#B0BAC7] transition hover:text-white"
          >
            <BiX className="h-7 w-7" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Овог" value={entry.lastName} />
          <Field label="Нэр" value={entry.firstName} />
        </div>
        <div className="mt-4">
          <Field label="Имэйл" value={entry.email} full />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field label="Хэлтэс" value={entry.department} />
          <Field label="Албан тушаал" value={entry.role} />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-white">Хавсаргасан файл</p>
          <div className="flex flex-col gap-3">
            {entry.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-2xl border border-[#1A2431] bg-[#121A25] px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#222E3E] bg-[#0D1623] text-[#7E8A9E]">
                    <FiFileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#E6EDF5]">
                      {file.title}
                    </p>
                    <p className="text-xs text-[#7E8A9E]">{file.fileName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
                >
                  <FiEye className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#FF3B3B] px-6 py-3 text-[15px] font-medium text-[#FF3B3B] transition hover:bg-[#FF3B3B]/10"
          >
            Татгалзах
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#16D17A] px-6 py-3 text-[15px] font-medium text-[#05100B] transition hover:bg-[#1BE589]"
          >
            Баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentReviewModal({
  entry,
  onClose,
}: {
  entry: DocumentReview;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[500px] rounded-[28px] border border-[#1A2431] bg-[#09111C] px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="text-[32px] font-medium leading-none text-white">
            {entry.modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#F3F7FB] transition hover:opacity-75"
          >
            <BiX className="h-9 w-9" />
          </button>
        </div>

        <div>
          <p className="mb-3 text-[18px] font-semibold text-white">Тайлбар</p>
          <div className="min-h-[120px] rounded-[18px] border border-[#2B3545] bg-[#0A121D] px-5 py-4 text-[18px] leading-[1.35] text-[#EEF4FA]">
            {entry.description}
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-4 text-[18px] font-semibold text-white">Хавсаргасан файл</p>
          <div className="flex items-center justify-between rounded-[18px] border border-[#1A2431] bg-[#151E29] px-3.5 py-3.5">
            <div className="flex items-center gap-4">
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[20px] border border-[#2B3545] bg-[#111A26] text-[#7E8A9E]">
                <FiFileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[#EEF4FA]">
                  {entry.fileTitle}
                </p>
                <p className="mt-1 text-[14px] text-[#9BA8B9]">{entry.fileName}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full p-3 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
            >
              <FiEye className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[18px] border border-[#FF3131] px-7 py-3 text-[16px] font-medium text-[#FF3131] transition hover:bg-[#FF3131]/10"
          >
            Татгалзах
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[18px] bg-[#19D37B] px-8 py-3 text-[16px] font-medium text-[#F7FFFB] transition hover:bg-[#21E789]"
          >
            Баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  );
}

function NewEmployeeRow({
  entry,
  onOpen,
}: {
  entry: EmployeeRequest;
  onOpen: (entry: EmployeeRequest) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className="flex w-full items-center justify-between rounded-[20px] border border-[#122236] bg-[#0B1623] px-5 py-5 text-left transition hover:border-[#1D3654] hover:bg-[#0D1A28]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B2E2A] text-[#00D3A7]">
          <FiCheckCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[18px] font-semibold text-[#F2F7FB]">
            {entry.lastName.charAt(0)}. {entry.firstName}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-[#7E8A9E]">
            <FiFileText className="h-3.5 w-3.5" />
            <span>{entry.files.length} баримт хавсаргасан</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <span className="rounded-full border border-[#0B8B7D] bg-[#052D31] px-3 py-1.5 text-[13px] font-medium text-[#06D2C4]">
          Ажилтан нэмэх
        </span>
        <span className="text-[13px] text-[#7E8A9E]">{entry.submittedAt}</span>
        <BiChevronRight className="h-6 w-6 text-[#7E8A9E]" />
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
      ? "border-[#735200] bg-[#2A1E00] text-[#F2B94B]"
      : "border-[#214C91] bg-[#0B214A] text-[#3E8CFF]";

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
      className="flex w-full items-center justify-between border-b border-[#0D2726] py-6 text-left transition hover:bg-white/[0.02] last:border-b-0"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#243243] bg-[#111A26] text-[#7E8A9E]">
          <FiFileText className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[16px] font-medium text-[#EDF4FB]">{entry.title}</p>
          <p className="mt-1 text-[14px] text-[#8A97AA]">{entry.fileName}</p>
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
          className="rounded-full p-2 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
        >
          <FiEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="rounded-full p-2 text-[#7E8A9E] transition hover:bg-white/5 hover:text-white"
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
      ? "border-[#735200] bg-[#2A1E00] text-[#F2B94B]"
      : "border-[#0C8060] bg-[#052C23] text-[#22D39A]";

  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#122236] bg-[#0B1623] px-5 py-5">
      <div>
        <p className="text-[16px] font-medium text-[#EDF4FB]">{entry.title}</p>
        <p className="mt-1 text-[13px] text-[#7E8A9E]">{entry.subtitle}</p>
      </div>
      <span className={`rounded-full border px-4 py-1.5 text-[13px] font-medium ${tone}`}>
        {entry.status}
      </span>
    </div>
  );
}

export function EmployeeAuditComponent() {
  const [selectedView, setSelectedView] = useState<AuditView>("newEmployee");
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRequest | null>(
    null,
  );
  const [selectedDocument, setSelectedDocument] = useState<DocumentReview | null>(
    null,
  );

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
      const matchesFilter =
        listFilter === "all" ? true : entry.tone === "gold";

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
    <div className="min-h-screen bg-[#05070B] px-6 py-8 text-white">
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

      <div className="mx-auto flex w-full max-w-[1061px] flex-col gap-8">
        <div className="flex w-full flex-col gap-1.5">
          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-white">
            Аудит хүсэлтүүд
          </h1>
          <p className="text-[16px] text-[#7D8694]">
            Хүний нөөцийн ажилтнаас илгээсэн хүсэлтүүд
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSelectedView("newEmployee");
              setListFilter("all");
            }}
            className={`flex h-[92px] items-center justify-between rounded-[24px] border px-7 text-left transition ${summaryCardTone(selectedView === "newEmployee", "blue")}`}
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#2F7BFF] text-white shadow-[0_10px_30px_rgba(47,123,255,0.35)]">
                <FiFileText className="h-6 w-6" />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-[46px] font-semibold leading-none text-white">
                  7
                </span>
                <span className="pb-1 text-[14px] text-[#A4AFC0]">
                  Шинэ ажилтаны хүсэлт
                </span>
              </div>
            </div>
            <BiChevronRight className="h-8 w-8 text-[#7E8A9E]" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedView("documentReview");
              setListFilter("all");
            }}
            className={`flex h-[92px] items-center justify-between rounded-[24px] border px-7 text-left transition ${summaryCardTone(selectedView === "documentReview", "green")}`}
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#12C95E] text-white shadow-[0_10px_30px_rgba(18,201,94,0.28)]">
                <FiCheckCircle className="h-6 w-6" />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-[46px] font-semibold leading-none text-white">
                  2
                </span>
                <span className="pb-1 text-[14px] text-[#A4AFC0]">
                  Баримт бичиг баталгаажуулах
                </span>
              </div>
            </div>
            <BiChevronRight className="h-8 w-8 text-[#7E8A9E]" />
          </button>
        </div>

        <div className="flex w-full flex-col gap-7">
          <div className="flex w-full items-center gap-3">
            <div className="flex h-[44px] flex-1 items-center gap-3 rounded-[12px] border border-[#1B2431] bg-[#161E2A] px-4">
              <BiSearch className="h-5 w-5 text-[#7E8A9E]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[#6D7685]"
                placeholder="Хайх..."
              />
            </div>

            <div className="relative">
              <select
                value={listFilter}
                onChange={(event) => setListFilter(event.target.value as ListFilter)}
                className="h-[44px] w-[186px] appearance-none rounded-[12px] border border-[#1B2431] bg-[#161E2A] px-4 pr-11 text-[15px] text-[#E6EDF5] outline-none"
              >
                {visibleFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <BiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7E8A9E]" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <h2 className="text-[22px] font-semibold text-white">
              {sectionLabel(selectedView)}
            </h2>
            <SectionPill count={selectedList} />
          </div>

          {selectedView === "newEmployee" ? (
            <div className="flex flex-col gap-4">
              {filteredEmployees.map((entry) => (
                <NewEmployeeRow
                  key={entry.id}
                  entry={entry}
                  onOpen={setSelectedEmployee}
                />
              ))}
            </div>
          ) : null}

          {selectedView === "documentReview" ? (
            <div className="flex flex-col">
              {filteredDocuments.map((entry) => (
                <DocumentRow
                  key={entry.id}
                  entry={entry}
                  onOpen={setSelectedDocument}
                />
              ))}
            </div>
          ) : null}

          {selectedView === "statusUpdate" ? (
            <div className="flex flex-col gap-4">
              {filteredStatusUpdates.map((entry) => (
                <StatusRow key={entry.id} entry={entry} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
