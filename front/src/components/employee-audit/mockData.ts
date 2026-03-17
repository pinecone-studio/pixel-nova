import type {
  AuditView,
  DocumentReview,
  EmployeeRequest,
  FilterOption,
  StatusUpdate,
} from "./types";

export const newEmployeeRequests: EmployeeRequest[] = [
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

export const documentReviews: DocumentReview[] = [
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

export const statusUpdates: StatusUpdate[] = [
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

export const FILTER_OPTIONS: Record<
  AuditView,
  FilterOption[]
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
