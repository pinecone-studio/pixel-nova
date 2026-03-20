"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheckCircle, FiEye, FiFileText, FiX } from "react-icons/fi";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { Root as VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GET_EMPLOYER_SIGNATURE_STATUS } from "@/graphql/queries/contract-requests";
import { GET_CONTRACT_TEMPLATE, GET_EMPLOYEES } from "@/graphql/queries";
import { TRIGGER_ACTION } from "@/graphql/mutations";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ActionConfig, DocumentContent, Employee } from "@/lib/types";
import { ChangePositionForm } from "./forms/ChangePositionForm";
import { NewEmployeeForm } from "./forms/NewEmployeeForm";
import { OffboardForm } from "./forms/OffboardForm";
import { SalaryChangeForm } from "./forms/SalaryChangeForm";
import { useHrOverlay } from "../overlay-context";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Sales",
  "Finance",
  "Marketing",
  "Design",
];

type Tab = "hr" | "employee";

const ChevronDown = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path
      d="M4 6l4 4 4-4"
      stroke="rgba(100,116,139,0.8)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const selectClass =
  "w-full appearance-none bg-white border border-slate-200 rounded-[8px] px-[16px] py-[8px] text-slate-700 text-[16px] outline-none pr-8 cursor-pointer focus:border-slate-300";
const errorSelectClass = `${selectClass} border-red-300 focus:border-red-400`;

const inputClass =
  "border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]";

const labelClass =
  "text-slate-700 text-[14px] font-semibold tracking-[-0.084px]";

const SelectWrapper = ({
  value,
  onChange,
  children,
  hasError,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  hasError?: boolean;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={hasError ? errorSelectClass : selectClass}>
      {children}
    </select>
    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
      <ChevronDown />
    </div>
  </div>
);

export function AddEmployeeRequestDialog({
  action,
  open,
  onOpenChange,
}: {
  action: ActionConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { setBlurred } = useHrOverlay();
  const [tab, setTab] = useState<Tab>("hr");
  const [employeeCode, setEmployeeCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [changeEmail, setChangeEmail] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [dept, setDept] = useState("Engineering");
  const [jobTitle, setJobTitle] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyRegisterNo, setCompanyRegisterNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [workSchedule, setWorkSchedule] = useState("Бүтэн цагаар");
  const [workdays, setWorkdays] = useState("Даваа-Баасан");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [contractDuration, setContractDuration] = useState("");
  const [salaryStep, setSalaryStep] = useState<"person" | "salary">("person");
  const [workStartDate, setWorkStartDate] = useState("");
  const [workTotalDuration, setWorkTotalDuration] = useState("");
  const [prevSalary, setPrevSalary] = useState("");
  const [nextSalary, setNextSalary] = useState("");
  const [salaryDelta, setSalaryDelta] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [terminationDate, setTerminationDate] = useState("");
  const [contractNo, setContractNo] = useState("");
  const [terminationReason, setTerminationReason] = useState("");
  const [newEmployeeStep, setNewEmployeeStep] = useState<1 | 2>(1);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [previewFrameHeight, setPreviewFrameHeight] = useState(1200);
  const [signedDocIds, setSignedDocIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [signatureNotice, setSignatureNotice] = useState<string | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signaturePasscode, setSignaturePasscode] = useState("");
  const [signatureModalError, setSignatureModalError] = useState<string | null>(
    null,
  );
  const [useSignaturePasscode, setUseSignaturePasscode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentDept, setCurrentDept] = useState("Engineering");
  const [currentPosition, setCurrentPosition] = useState("");
  const [nextDept, setNextDept] = useState("Engineering");
  const [nextPosition, setNextPosition] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [recipients, setRecipients] = useState<string[]>(() =>
    action?.recipients.length ? [...action.recipients] : ["hr_manager"],
  );
  const [recipientInput, setRecipientInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<
    ActionConfig["documents"][number] | null
  >(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSignatureOpen] = useState(false);
  const [previewSignatureData, setPreviewSignatureData] = useState("");
  const previewSignatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewSignatureDrawingRef = useRef(false);

  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen && previewOpen) {
      return;
    }

    onOpenChange(nextOpen);
  }

  const documents = action?.documents ?? [];
  const actionKey = action?.name?.toLowerCase() ?? "";
  const actionLabelMap: Record<string, string> = {
    add_employee: "Шинэ ажилтан",
    change_position: "Албан тушаал өөрчлөх",
    promote_employee: "Цалин нэмэх",
    offboard_employee: "Ажлаас чөлөөлөх",
  };
  const actionLabel =
    actionLabelMap[actionKey] ?? action?.name ?? "Шинэ ажилтан";
  const useAddEmployeeLayout = actionKey === "add_employee";
  const useChangePositionLayout = actionKey === "change_position";
  const useSalaryChangeLayout = actionKey === "promote_employee";
  const useOffboardLayout = actionKey === "offboard_employee";

  const addRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && recipientInput.trim()) {
      setRecipients((prev) => [...prev, recipientInput.trim()]);
      setRecipientInput("");
    }
  };

  const removeRecipient = (recipient: string) => {
    setRecipients((prev) => prev.filter((v) => v !== recipient));
  };

  const handleDemoFill = () => {
    setErrors({});
    setTab("employee");
    setSalaryStep("person");
    setNewEmployeeStep(1);
    setEmployeeCode("EMP-0001");
  };

  const searchKey = employeeCode.trim();

  const { data: employeesData } = useQuery<{ employees: Employee[] }>(
    GET_EMPLOYEES,
    {
      variables: { search: searchKey || null, status: null, department: null },
      skip: !searchKey,
      context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
      fetchPolicy: "network-only",
    },
  );

  const matchedEmployee = useMemo(() => {
    if (!searchKey || !employeesData?.employees?.length) return null;
    const lower = searchKey.toLowerCase();
    return (
      employeesData.employees.find(
        (emp) => emp.employeeCode?.toLowerCase() === lower,
      ) ?? employeesData.employees[0]
    );
  }, [employeesData, searchKey]);

  useEffect(() => {
    if (!action) return;
    setEmployeeCode("");
    setRecipients(
      action.recipients.length ? [...action.recipients] : ["hr_manager"],
    );
    setRecipientInput("");
    setTab("hr");
    setSalaryStep("person");
    setErrors({});
    setChangeEmail("");
    setSignedDocIds(new Set());
    setSignatureNotice(null);
    setSignatureModalOpen(false);
    setSignaturePasscode("");
    setSignatureModalError(null);
    setUseSignaturePasscode(false);
    setPreviewOpen(false);
    setPreviewDoc(null);
    setPreviewError(null);
    setPreviewSignatureData("");
  }, [action]);

  useEffect(() => {
    setBlurred(open || previewOpen);
    return () => setBlurred(false);
  }, [open, previewOpen, setBlurred]);

  useEffect(() => {
    if (!open) {
      setNewEmployeeStep(1);
      return;
    }
    if (action?.name?.trim() === "add_employee") {
      setNewEmployeeStep(1);
    }
  }, [open, action?.name]);

  useEffect(() => {
    if (!matchedEmployee) return;
    setLastName(matchedEmployee.lastName ?? "");
    setFirstName(matchedEmployee.firstName ?? "");
    setEmail(matchedEmployee.email ?? "");
    setChangeEmail(matchedEmployee.email ?? "bsunduibazrr8@gmail.com");
    const docProfile = matchedEmployee.documentProfile;
    setRegisterNo(docProfile?.employee_register_no ?? "");
    setPhone(docProfile?.employee_legal_phone ?? "");
    setBranch(matchedEmployee.branch ?? "");
    setDept(matchedEmployee.department ?? "Engineering");
    setJobTitle(matchedEmployee.jobTitle ?? "");
    setCurrentDept(matchedEmployee.department ?? "Engineering");
    setCurrentPosition(matchedEmployee.jobTitle ?? "");
    setHireDate(matchedEmployee.hireDate ?? "");
    setTerminationDate(matchedEmployee.terminationDate ?? "");
  }, [employeeCode, matchedEmployee]);

  const [triggerAction, { loading: submitting }] = useMutation(TRIGGER_ACTION, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
  });
  const signingDocument = false;
  const { data: employerSignatureStatusData } = useQuery<{
    employerSignatureStatus: {
      hasSignature: boolean;
      hasPasscode: boolean;
      updatedAt?: string | null;
    };
  }>(GET_EMPLOYER_SIGNATURE_STATUS, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
    fetchPolicy: "network-only",
  });

  const [loadTemplate, { data: previewData, loading: previewLoading }] =
    useLazyQuery<{ contractTemplate: DocumentContent | null }>(
      GET_CONTRACT_TEMPLATE,
      {
        fetchPolicy: "network-only",
      },
    );

  const previewContent = previewData?.contractTemplate ?? null;
  const previewUrl = useMemo(() => {
    if (!previewContent) return null;
    if (previewContent.contentType === "text/html") return null;
    if (previewContent.contentType === "application/pdf") {
      return `data:${previewContent.contentType};base64,${previewContent.content}`;
    }
    if (previewContent.contentType.startsWith("text/")) {
      return `data:${previewContent.contentType};charset=utf-8,${encodeURIComponent(
        previewContent.content,
      )}`;
    }
    return `data:${previewContent.contentType};base64,${previewContent.content}`;
  }, [previewContent]);
  const employerSignatureStatus =
    employerSignatureStatusData?.employerSignatureStatus ?? null;
  const hasSavedEmployerSignature =
    employerSignatureStatus?.hasSignature ?? false;
  const savedSignatureHasPasscode =
    employerSignatureStatus?.hasPasscode ?? false;

  useEffect(() => {
    if (!signatureModalOpen || hasSavedEmployerSignature) return;
    const canvas = previewSignatureCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0B0E14";
  }, [signatureModalOpen, hasSavedEmployerSignature]);

  async function handleSavePreviewSignature() {
    if (!previewDoc) return;

    if (
      hasSavedEmployerSignature &&
      savedSignatureHasPasscode &&
      !/^[0-9]{4}$/.test(signaturePasscode)
    ) {
      setSignatureModalError("4 ??????? ????? ????? ??????? ??.");
      return;
    }

    if (!hasSavedEmployerSignature && !previewSignatureData) {
      setSignatureModalError("????? ????? ????? ??.");
      return;
    }

    if (
      !hasSavedEmployerSignature &&
      useSignaturePasscode &&
      !/^[0-9]{4}$/.test(signaturePasscode)
    ) {
      setSignatureModalError("4 ??????? ????? ????? ??????? ??.");
      return;
    }

    setSignatureModalError(null);
    setSignaturePasscode("");
    setUseSignaturePasscode(false);
    setSignatureModalOpen(false);
    setSignatureNotice(
      "??? preview ?? ?????? ?????? ??? ?????? ?????????. ?????? ???????? ????? Audit log ???? ????? ?????? ???? ????? ???? ?????.",
    );
  }

  function handlePreviewSignaturePointerDown(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = previewSignatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    previewSignatureDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  }

  function handlePreviewSignaturePointerMove(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (!previewSignatureDrawingRef.current) return;
    const canvas = previewSignatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  }

  function handlePreviewSignaturePointerUp() {
    if (!previewSignatureDrawingRef.current) return;
    previewSignatureDrawingRef.current = false;
    const canvas = previewSignatureCanvasRef.current;
    if (!canvas) return;
    setPreviewSignatureData(canvas.toDataURL("image/png"));
  }

  function handleClearPreviewSignature() {
    const canvas = previewSignatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setPreviewSignatureData("");
  }

  function handlePreviewFrameLoad() {
    const iframe = previewFrameRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const nextHeight =
        doc.body?.scrollHeight ||
        doc.documentElement?.scrollHeight ||
        previewFrameHeight;
      if (nextHeight > 0) {
        setPreviewFrameHeight(nextHeight + 24);
      }
    } catch {
      // Cross-origin (PDF) cannot measure; keep default height
    }
  }

  async function handlePreview(doc: ActionConfig["documents"][number]) {
    setPreviewOpen(true);
    setPreviewDoc(doc);
    setPreviewError(null);
    setSignatureModalOpen(false);
    setSignaturePasscode("");
    setSignatureModalError(null);
    try {
      const result = await loadTemplate({
        variables: { templateId: doc.id },
        context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
      });
      if (!result.data?.contractTemplate) {
        setPreviewError("Баримтын загвар олдсонгүй.");
      }
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Preview ачааллахад алдаа гарлаа.",
      );
    }
  }

  const requiredMessage = "Заавал бөглөнө.";
  const numberOnlyRegex = /^\d+$/;
  const emailRegex = /^[^\s@]+@gmail\.com$/i;
  const employeeCodeRegex = /^EMP-?\d{3,4}$/i;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const isBlank = (value: string) => !value || !value.trim();
    const requireValue = (value: string, key: string, message?: string) => {
      if (isBlank(value)) nextErrors[key] = message ?? requiredMessage;
    };
    const requirePattern = (
      value: string,
      key: string,
      regex: RegExp,
      message: string,
    ) => {
      if (isBlank(value)) {
        nextErrors[key] = requiredMessage;
        return;
      }
      if (!regex.test(value.trim())) nextErrors[key] = message;
    };

    if (useAddEmployeeLayout) {
      requireValue(companyAddress, "companyAddress");
      requirePattern(
        companyRegisterNo,
        "companyRegisterNo",
        numberOnlyRegex,
        "?????? ??? ??????? ??.",
      );
      requireValue(companyName, "companyName");

      if (newEmployeeStep === 1) {
        requirePattern(
          employeeCode,
          "employeeCode",
          employeeCodeRegex,
          "EMP0001 ????????? ??????? ??.",
        );
        requireValue(branch, "branch");
        requireValue(lastName, "lastName");
        requireValue(firstName, "firstName");
        requirePattern(email, "email", emailRegex, "@gmail.com-??? ???????.");
        requireValue(registerNo, "registerNo");
        requirePattern(
          phone,
          "phone",
          numberOnlyRegex,
          "?????? ??? ??????? ??.",
        );
      } else {
        requireValue(dept, "dept");
        requireValue(jobTitle, "jobTitle");
        requireValue(workSchedule, "workSchedule");
        requireValue(workdays, "workdays");
        requirePattern(
          salaryAmount,
          "salaryAmount",
          numberOnlyRegex,
          "?????? ??? ??????? ??.",
        );
        requireValue(contractStart, "contractStart");
        requireValue(contractEnd, "contractEnd");
        requireValue(contractDuration, "contractDuration");
        if (contractStart && contractEnd && contractEnd < contractStart) {
          nextErrors.contractEnd = "?????? ????? ????? ????????? ???? ?????.";
        }
      }
    }

    if (useChangePositionLayout) {
      requirePattern(
        employeeCode,
        "employeeCode",
        employeeCodeRegex,
        "EMP0001 ????????? ??????? ??.",
      );
      requireValue(lastName, "lastName");
      requireValue(firstName, "firstName");
      requirePattern(changeEmail, "email", emailRegex, "@gmail.com-??? ???????.");
      requireValue(currentDept, "currentDept");
      requireValue(currentPosition, "currentPosition");
      requireValue(nextDept, "nextDept");
      requireValue(nextPosition, "nextPosition");
      requireValue(changeReason, "changeReason");
    }

    if (useSalaryChangeLayout) {
      requirePattern(
        employeeCode,
        "employeeCode",
        employeeCodeRegex,
        "EMP0001 ????????? ??????? ??.",
      );
      requireValue(lastName, "lastName");
      requireValue(firstName, "firstName");

      if (salaryStep == "person") {
        requirePattern(email, "email", emailRegex, "@gmail.com-??? ???????.");
      } else {
        requireValue(workStartDate, "workStartDate");
        requireValue(workTotalDuration, "workTotalDuration");
        requirePattern(prevSalary, "prevSalary", numberOnlyRegex, "?????? ??? ??????? ??.");
        requirePattern(nextSalary, "nextSalary", numberOnlyRegex, "?????? ??? ??????? ??.");
        requirePattern(salaryDelta, "salaryDelta", numberOnlyRegex, "?????? ??? ??????? ??.");
        if (
          prevSalary &&
          nextSalary &&
          numberOnlyRegex.test(prevSalary.trim()) &&
          numberOnlyRegex.test(nextSalary.trim()) &&
          Number(nextSalary) <= Number(prevSalary)
        ) {
          nextErrors.nextSalary = "???? ????? ????? ????????? ?? ?????.";
        }
      }
    }

    if (useOffboardLayout) {
      requirePattern(
        employeeCode,
        "employeeCode",
        employeeCodeRegex,
        "EMP0001 ????????? ??????? ??.",
      );
      requireValue(lastName, "lastName");
      requireValue(firstName, "firstName");
      requireValue(registerNo, "registerNo");
      requirePattern(phone, "phone", numberOnlyRegex, "?????? ??? ??????? ??.");
      requireValue(jobTitle, "jobTitle");
      requireValue(hireDate, "hireDate");
      requireValue(terminationDate, "terminationDate");
      requirePattern(contractNo, "contractNo", numberOnlyRegex, "?????? ??? ??????? ??.");
      requireValue(terminationReason, "terminationReason");
      if (hireDate && terminationDate && terminationDate < hireDate) {
        nextErrors.terminationDate = "???????? ????? ????? ????? ????????? ???? ?????.";
      }
    }

    if (recipients.length === 0) {
      nextErrors.recipients = "??????? ??????? 1 ?????? ????? ????? ??.";
    }

    return nextErrors;
  };

  async function handleSubmit() {
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!action?.name) {
      return;
    }
    if (!useAddEmployeeLayout && !matchedEmployee?.id) {
      setErrors((prev) => ({
        ...prev,
        employeeCode: "Ажилтны кодоор ажилтан олдсонгүй.",
      }));
      return;
    }
    // Build template data overrides from form fields
    const overrides: Record<string, string> = {};
    if (useSalaryChangeLayout) {
      if (prevSalary) {
        overrides.base_salary_prev = prevSalary;
        overrides.base_salary_prev_clause = prevSalary;
      }
      if (nextSalary) {
        overrides.base_salary_new = nextSalary;
        overrides.base_salary_new_clause = nextSalary;
      }
      if (salaryDelta) overrides.increase_amount = salaryDelta;
      if (prevSalary && nextSalary && Number(prevSalary) > 0) {
        overrides.increase_percent = String(
          Math.round(
            ((Number(nextSalary) - Number(prevSalary)) / Number(prevSalary)) *
              100,
          ),
        );
      }
    }
    if (useAddEmployeeLayout) {
      if (salaryAmount) {
        overrides.monthly_base_salary_amount = salaryAmount;
        overrides.salary_amount = salaryAmount;
      }
      if (registerNo) overrides.employee_register_no = registerNo;
      if (phone) overrides.employee_phone = phone;
      if (companyAddress) overrides.company_address = companyAddress;
      if (companyRegisterNo) overrides.company_register_no = companyRegisterNo;
    }
    if (useChangePositionLayout) {
      overrides.from_department = currentDept;
      overrides.from_position = currentPosition;
      overrides.to_department = nextDept;
      overrides.to_position = nextPosition;
      if (changeReason) overrides.reason_detail_line_1 = changeReason;
      if (changeEmail) overrides.employee_email = changeEmail;
    }
    if (useOffboardLayout) {
      if (registerNo) overrides.employee_register_no = registerNo;
      if (phone) overrides.employee_phone = phone;
      if (terminationReason) overrides.reason_detail_line_1 = terminationReason;
      if (contractNo) overrides.contract_number = contractNo;
    }

    try {
      const overrideRecipients =
        useChangePositionLayout && changeEmail ? [changeEmail] : recipients;

      await triggerAction({
        variables: {
          employeeId: matchedEmployee.id,
          action: action.name,
          overrideRecipients,
          templateDataOverrides:
            Object.keys(overrides).length > 0 ? overrides : undefined,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        employeeCode:
          err instanceof Error ? err.message : "Илгээхэд алдаа гарлаа.",
      }));
    }
  }

  // ── Хүлээн авагчид + файл (хоёр section-д хуваалцана) ──
  const RecipientsSection = (
    <div className="flex flex-col gap-4">
      <label className={labelClass}>Хүлээн авагчид</label>
      <div className="mb-1 flex min-w-0 flex-wrap gap-1.5">
        {recipients.map((recipient) => (
          <span
            key={recipient}
            className="inline-flex max-w-full items-center gap-1 rounded-[10px] border border-slate-200 px-[9px] py-[3px] text-slate-500 text-[12px] leading-[20px] bg-slate-50">
            {recipient}
            <button
              onClick={() => removeRecipient(recipient)}
              className="text-slate-400 hover:text-slate-700 transition-colors leading-none">
              <FiX className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={recipientInput}
        onChange={(e) => setRecipientInput(e.target.value)}
        onKeyDown={addRecipient}
        placeholder="Хүлээн авагч нэмэх..."
        className="border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-600 text-[14px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.084px]"
      />
    </div>
  );

  const DocumentsSection = (
    <div className="flex flex-col gap-[12px]">
      <label className={labelClass}>Хавсаргасан файл</label>
      {signatureNotice ? (
        <div className="flex items-center gap-2 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
          <FiCheckCircle className="h-4 w-4" />
          <span>{signatureNotice}</span>
        </div>
      ) : null}
      {documents.length > 0 ? (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white flex min-w-0 items-center justify-between gap-[12px] rounded-[12px] px-[6px] py-[8px] border border-slate-200">
            <div className="flex min-w-0 items-center gap-[16px]">
              <div className="bg-white border border-slate-200 rounded-[16px] size-[40px] flex items-center justify-center shrink-0">
                <FiFileText className="h-[18px] w-[18px] text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 text-[14px] font-semibold leading-[20px] tracking-[-0.084px]">
                  {doc.template}
                </p>
                <p className="text-slate-400 text-[12px] leading-[12px] tracking-[-0.072px]">
                  {doc.template.toLowerCase().replace(/\s+/g, "_")}.pdf
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {signedDocIds.has(doc.id) ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  <FiCheckCircle className="h-3.5 w-3.5" />
                  Зурсан
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => void handlePreview(doc)}
                className="text-slate-400 hover:text-slate-700 transition-colors size-[40px] flex items-center justify-center"
                aria-label="Preview template">
                <FiEye className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-slate-400 text-sm">Хавсаргасан файл байхгүй</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="bg-white border border-slate-200 rounded-[16px] flex min-h-0 w-full max-w-[calc(100vw-2rem)] sm:max-w-xl flex-col gap-[16px] p-[24px] max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden overscroll-contain ring-0 scrollbar-hidden pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-semibold text-[20px] leading-6">
            {actionLabel}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleDemoFill}
            className="rounded-[10px] border border-black/12 px-3 py-1.5 text-[12px] font-medium text-[#3f4145] transition-colors hover:bg-[#f5f5f5]">
            Demo бөглөх (EMP-0001)
          </button>
        </div>

        {/* ── ҮНДСЭН ЦАЛИН ӨӨРЧЛӨХ (2 алхам) ── */}
        {useSalaryChangeLayout ? (
          <SalaryChangeForm
            salaryStep={salaryStep}
            employeeCode={employeeCode}
            setEmployeeCode={setEmployeeCode}
            lastName={lastName}
            setLastName={setLastName}
            firstName={firstName}
            setFirstName={setFirstName}
            email={email}
            setEmail={setEmail}
            dept={dept}
            setDept={setDept}
            currentPosition={currentPosition}
            setCurrentPosition={setCurrentPosition}
            nextPosition={nextPosition}
            setNextPosition={setNextPosition}
            workStartDate={workStartDate}
            setWorkStartDate={setWorkStartDate}
            workTotalDuration={workTotalDuration}
            setWorkTotalDuration={setWorkTotalDuration}
            prevSalary={prevSalary}
            setPrevSalary={setPrevSalary}
            nextSalary={nextSalary}
            setNextSalary={setNextSalary}
            salaryDelta={salaryDelta}
            setSalaryDelta={setSalaryDelta}
            departments={DEPARTMENTS}
            errors={errors}
            labelClass={labelClass}
            inputClass={inputClass}
            SelectWrapper={SelectWrapper}
            RecipientsSection={RecipientsSection}
            DocumentsSection={DocumentsSection}
          />
        ) : useChangePositionLayout ? (
          <ChangePositionForm
            employeeCode={employeeCode}
            setEmployeeCode={setEmployeeCode}
            lastName={lastName}
            setLastName={setLastName}
            firstName={firstName}
            setFirstName={setFirstName}
            email={changeEmail}
            setEmail={setChangeEmail}
            currentDept={currentDept}
            setCurrentDept={setCurrentDept}
            currentPosition={currentPosition}
            setCurrentPosition={setCurrentPosition}
            nextDept={nextDept}
            setNextDept={setNextDept}
            nextPosition={nextPosition}
            setNextPosition={setNextPosition}
            changeReason={changeReason}
            setChangeReason={setChangeReason}
            departments={DEPARTMENTS}
            errors={errors}
            labelClass={labelClass}
            inputClass={inputClass}
            SelectWrapper={SelectWrapper}
            RecipientsSection={RecipientsSection}
            DocumentsSection={DocumentsSection}
          />
        ) : useOffboardLayout ? (
          <OffboardForm
            employeeCode={employeeCode}
            setEmployeeCode={setEmployeeCode}
            lastName={lastName}
            setLastName={setLastName}
            firstName={firstName}
            setFirstName={setFirstName}
            registerNo={registerNo}
            setRegisterNo={setRegisterNo}
            phone={phone}
            setPhone={setPhone}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            hireDate={hireDate}
            setHireDate={setHireDate}
            terminationDate={terminationDate}
            setTerminationDate={setTerminationDate}
            contractNo={contractNo}
            setContractNo={setContractNo}
            terminationReason={terminationReason}
            setTerminationReason={setTerminationReason}
            errors={errors}
            labelClass={labelClass}
            inputClass={inputClass}
            RecipientsSection={RecipientsSection}
            DocumentsSection={DocumentsSection}
          />
        ) : useAddEmployeeLayout ? (
          <NewEmployeeForm
            step={newEmployeeStep}
            setStep={setNewEmployeeStep}
            tab={tab}
            setTab={setTab}
            companyAddress={companyAddress}
            setCompanyAddress={setCompanyAddress}
            companyRegisterNo={companyRegisterNo}
            setCompanyRegisterNo={setCompanyRegisterNo}
            companyName={companyName}
            setCompanyName={setCompanyName}
            employeeCode={employeeCode}
            setEmployeeCode={setEmployeeCode}
            branch={branch}
            setBranch={setBranch}
            lastName={lastName}
            setLastName={setLastName}
            firstName={firstName}
            setFirstName={setFirstName}
            email={email}
            setEmail={setEmail}
            registerNo={registerNo}
            setRegisterNo={setRegisterNo}
            phone={phone}
            setPhone={setPhone}
            dept={dept}
            setDept={setDept}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            workSchedule={workSchedule}
            setWorkSchedule={setWorkSchedule}
            workdays={workdays}
            setWorkdays={setWorkdays}
            salaryAmount={salaryAmount}
            setSalaryAmount={setSalaryAmount}
            contractStart={contractStart}
            setContractStart={setContractStart}
            contractEnd={contractEnd}
            setContractEnd={setContractEnd}
            contractDuration={contractDuration}
            setContractDuration={setContractDuration}
            departments={DEPARTMENTS}
            errors={errors}
            labelClass={labelClass}
            inputClass={inputClass}
            SelectWrapper={SelectWrapper}
            RecipientsSection={RecipientsSection}
            DocumentsSection={DocumentsSection}
          />
        ) : (
          <div className="text-sm text-slate-500">
            Энэ үйлдэлд form тохируулаагүй байна.
          </div>
        )}
        {/* ── Товчлуурууд ── */}
        <div className="flex flex-nowrap items-center gap-[20px] justify-end shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className=" px-[20px] py-[10px] rounded-[12px] text-[#FF2B2B] text-[16px] hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap border border-[#FF2B2B]">
            Болих
          </button>
          {useAddEmployeeLayout && newEmployeeStep === 1 ? (
            <button
              onClick={() => setNewEmployeeStep(2)}
              className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap ">
              Цааш
            </button>
          ) : useSalaryChangeLayout && salaryStep === "person" ? (
            <button
              onClick={() => setSalaryStep("salary")}
              className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap">
              Цааш
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap">
              {submitting ? "Илгээж байна..." : "Илгээх"}
            </button>
          )}
        </div>
      </DialogContent>

      <Dialog
        open={previewOpen}
        onOpenChange={(nextOpen) => {
          setPreviewOpen(nextOpen);
          if (!nextOpen) {
            setSignatureModalOpen(false);
            setSignaturePasscode("");
            setSignatureModalError(null);
          }
        }}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[82vh] max-h-[82vh] w-[920px] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <VisuallyHidden>
            <DialogTitle>Баримт</DialogTitle>
          </VisuallyHidden>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex flex-col">
                <p className="text-slate-900 text-sm font-semibold">
                  {previewDoc?.template ?? "Баримт"}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Preview</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignatureModalError(null);
                    setSignaturePasscode("");
                    setSignatureModalOpen(true);
                  }}
                  className="rounded-lg border cursor-pointer border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Гарын үсэг зурах
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewOpen(false);
                    setSignatureModalOpen(false);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <FiX className="text-lg" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-4">
              {previewLoading ? (
                <div className="w-full h-full rounded-xl border border-slate-200 flex items-center justify-center text-sm text-slate-400">
                  Уншиж байна...
                </div>
              ) : previewError ? (
                <div className="w-full h-full rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-sm text-red-500">
                  {previewError}
                </div>
              ) : (
                <div className="relative w-full rounded-xl border border-slate-200 bg-white">
                  {previewContent?.contentType === "text/html" ? (
                    <iframe
                      title={previewDoc?.template ?? "Template preview"}
                      ref={previewFrameRef}
                      onLoad={handlePreviewFrameLoad}
                      className="w-full bg-white"
                      style={{ height: previewFrameHeight }}
                      srcDoc={previewContent.content}
                    />
                  ) : previewUrl ? (
                    <iframe
                      title={previewDoc?.template ?? "Template preview"}
                      className="w-full h-[70vh] bg-white"
                      src={previewUrl}
                      scrolling="yes"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                      Preview бэлэн биш байна.
                    </div>
                  )}

                  {previewSignatureData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSignatureData}
                      alt="Signature"
                      className="absolute bottom-6 right-6 h-16 max-w-[160px] object-contain"
                    />
                  ) : null}

                  {previewSignatureOpen ? (
                    <div
                      className="absolute inset-0"
                      onClick={(event) => event.stopPropagation()}>
                      <canvas
                        ref={previewSignatureCanvasRef}
                        className="h-full w-full cursor-crosshair"
                        onPointerDown={handlePreviewSignaturePointerDown}
                        onPointerMove={handlePreviewSignaturePointerMove}
                        onPointerUp={handlePreviewSignaturePointerUp}
                        onPointerLeave={handlePreviewSignaturePointerUp}
                      />
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleClearPreviewSignature}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          Цэвэрлэх
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePreviewSignature}
                          disabled={false}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                          {signingDocument ? "Хадгалж байна..." : "Дуусгах"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={signatureModalOpen}
        onOpenChange={(nextOpen) => {
          setSignatureModalOpen(nextOpen);
          if (!nextOpen) {
            setSignaturePasscode("");
            setSignatureModalError(null);
            setUseSignaturePasscode(false);
            setPreviewSignatureData("");
            handleClearPreviewSignature();
          }
        }}>
        <DialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <div className="border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-base font-semibold text-slate-900">
              Гарын үсгээр баталгаажуулах
            </DialogTitle>
            <p className="mt-1 text-sm text-slate-500">
              Settings хэсэгт хадгалсан ажил олгогчийн гарын үсгийг ашиглана.
            </p>
          </div>
          <div className="space-y-4 px-6 py-5">
            {hasSavedEmployerSignature ? (
              <>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  ????????? ????? ???? ????? ?????.
                  {employerSignatureStatus?.updatedAt
                    ? ` ${new Date(employerSignatureStatus.updatedAt).toLocaleDateString("mn-MN")} ??????????.`
                    : ""}
                </div>

                {savedSignatureHasPasscode ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="hr-signature-passcode"
                      className="text-sm font-medium text-slate-700">
                      4 ??????? ???
                    </label>
                    <input
                      id="hr-signature-passcode"
                      value={signaturePasscode}
                      onChange={(event) =>
                        setSignaturePasscode(
                          event.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="1234"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  ????????? ????? ???? ???? ?????. ??? ???? ???? ??????? ?????.
                </div>

                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <canvas
                      ref={previewSignatureCanvasRef}
                      onPointerDown={handlePreviewSignaturePointerDown}
                      onPointerMove={handlePreviewSignaturePointerMove}
                      onPointerUp={handlePreviewSignaturePointerUp}
                      onPointerLeave={handlePreviewSignaturePointerUp}
                      className="h-32 w-full cursor-crosshair"
                      style={{ touchAction: "none" }}
                    />
                    {previewSignatureData ? (
                      <button
                        type="button"
                        onClick={handleClearPreviewSignature}
                        className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs text-slate-500 hover:text-red-500">
                        ???????
                      </button>
                    ) : (
                      <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-300">
                        ??? ????? ????? ????? ??
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={useSignaturePasscode}
                      onChange={(event) => setUseSignaturePasscode(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    />
                    4 ??????? ??? ?????
                  </label>

                  {useSignaturePasscode ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="hr-signature-passcode"
                        className="text-sm font-medium text-slate-700">
                        4 ??????? ???
                      </label>
                      <input
                        id="hr-signature-passcode"
                        value={signaturePasscode}
                        onChange={(event) =>
                          setSignaturePasscode(
                            event.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="1234"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {signatureModalError ? (
              <p className="text-sm text-red-500">{signatureModalError}</p>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSignatureModalOpen(false);
                  setSignaturePasscode("");
                  setSignatureModalError(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Болих
              </button>
              <button
                type="button"
                onClick={handleSavePreviewSignature}
                disabled={false}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {signingDocument ? "Баталгаажуулж байна..." : "Баталгаажуулах"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
