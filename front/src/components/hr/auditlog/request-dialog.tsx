"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiEye, FiFileText, FiX } from "react-icons/fi";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
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
      className={hasError ? errorSelectClass : selectClass}
    >
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

  const documents = action?.documents ?? [];
  const actionKey = action?.name?.toLowerCase() ?? "";
  const actionLabelMap: Record<string, string> = {
    add_employee: "ADD EMPLOYEE",
    change_position: "CHANGE POSITION",
    promote_employee: "PROMOTE EMPLOYEE",
    offboard_employee: "OFFBOARD EMPLOYEE",
  };
  const actionLabel =
    actionLabelMap[actionKey] ?? action?.name ?? "ADD EMPLOYEE";
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

  /* eslint-disable react-hooks/set-state-in-effect */
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
  }, [action]);

  useEffect(() => {
    setBlurred(open || previewOpen);
    return () => setBlurred(false);
  }, [open, previewOpen, setBlurred]);

  useEffect(() => {
    if (!matchedEmployee) return;
    setLastName(matchedEmployee.lastName ?? "");
    setFirstName(matchedEmployee.firstName ?? "");
    setEmail(matchedEmployee.email ?? "");
    setBranch(matchedEmployee.branch ?? "");
    setDept(matchedEmployee.department ?? "Engineering");
    setJobTitle(matchedEmployee.jobTitle ?? "");
    setCurrentDept(matchedEmployee.department ?? "Engineering");
    setCurrentPosition(matchedEmployee.jobTitle ?? "");
    setHireDate(matchedEmployee.hireDate ?? "");
    setTerminationDate(matchedEmployee.terminationDate ?? "");
  }, [matchedEmployee]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const [triggerAction, { loading: submitting }] = useMutation(TRIGGER_ACTION, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
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

  async function handlePreview(doc: ActionConfig["documents"][number]) {
    setPreviewOpen(true);
    setPreviewDoc(doc);
    setPreviewError(null);
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
      if (tab === "hr") {
        requireValue(companyAddress, "companyAddress");
        requirePattern(
          companyRegisterNo,
          "companyRegisterNo",
          numberOnlyRegex,
          "Зөвхөн тоо оруулна уу.",
        );
        requireValue(companyName, "companyName");
      } else {
        requirePattern(
          employeeCode,
          "employeeCode",
          employeeCodeRegex,
          "EMP0001 хэлбэрээр оруулна уу.",
        );
        requireValue(branch, "branch");
        requireValue(lastName, "lastName");
        requireValue(firstName, "firstName");
        requirePattern(email, "email", emailRegex, "@gmail.com-оор төгсөнө.");
        requireValue(registerNo, "registerNo");
        requirePattern(
          phone,
          "phone",
          numberOnlyRegex,
          "Зөвхөн тоо оруулна уу.",
        );
        requireValue(dept, "dept");
        requireValue(jobTitle, "jobTitle");
        requireValue(workSchedule, "workSchedule");
        requireValue(workdays, "workdays");
        requirePattern(
          salaryAmount,
          "salaryAmount",
          numberOnlyRegex,
          "Зөвхөн тоо оруулна уу.",
        );
        requireValue(contractStart, "contractStart");
        requireValue(contractEnd, "contractEnd");
        requireValue(contractDuration, "contractDuration");
      }
    }

    if (useChangePositionLayout) {
      requirePattern(
        employeeCode,
        "employeeCode",
        employeeCodeRegex,
        "EMP0001 хэлбэрээр оруулна уу.",
      );
      requireValue(lastName, "lastName");
      requireValue(firstName, "firstName");
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
        "EMP0001 хэлбэрээр оруулна уу.",
      );
      requireValue(lastName, "lastName");
      requireValue(firstName, "firstName");

      if (salaryStep === "person") {
        requirePattern(email, "email", emailRegex, "@gmail.com-оор төгсөнө.");
      } else {
        requireValue(workStartDate, "workStartDate");
        requireValue(workTotalDuration, "workTotalDuration");
        requirePattern(
          prevSalary,
          "prevSalary",
          numberOnlyRegex,
          "Зөвхөн тоо оруулна уу.",
        );
        requirePattern(
          nextSalary,
          "nextSalary",
          numberOnlyRegex,
          "Зөвхөн тоо оруулна уу.",
        );
        requirePattern(
          salaryDelta,
          "salaryDelta",
          numberOnlyRegex,
          "Зөвхөн тоо оруулна уу.",
        );
      }
    }

    if (useOffboardLayout) {
      requirePattern(
        employeeCode,
        "employeeCode",
        employeeCodeRegex,
        "EMP0001 хэлбэрээр оруулна уу.",
      );
      requireValue(lastName, "lastName");
      requireValue(firstName, "firstName");
      requireValue(registerNo, "registerNo");
      requirePattern(phone, "phone", numberOnlyRegex, "Зөвхөн тоо оруулна уу.");
      requireValue(jobTitle, "jobTitle");
      requireValue(hireDate, "hireDate");
      requireValue(terminationDate, "terminationDate");
      requirePattern(
        contractNo,
        "contractNo",
        numberOnlyRegex,
        "Зөвхөн тоо оруулна уу.",
      );
      requireValue(terminationReason, "terminationReason");
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
    if (!matchedEmployee?.id) {
      setErrors((prev) => ({
        ...prev,
        employeeCode: "Ажилтны кодоор ажилтан олдсонгүй.",
      }));
      return;
    }
    try {
      await triggerAction({
        variables: {
          employeeId: matchedEmployee.id,
          action: action.name,
          overrideRecipients: recipients,
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
            className="inline-flex max-w-full items-center gap-1 rounded-[10px] border border-slate-200 px-[9px] py-[3px] text-slate-500 text-[12px] leading-[20px] bg-slate-50"
          >
            {recipient}
            <button
              onClick={() => removeRecipient(recipient)}
              className="text-slate-400 hover:text-slate-700 transition-colors leading-none"
            >
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
      {documents.length > 0 ? (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white flex min-w-0 items-center justify-between gap-[12px] rounded-[12px] px-[6px] py-[8px] border border-slate-200"
          >
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
            <button
              onClick={() => void handlePreview(doc)}
              className="text-slate-400 hover:text-slate-700 transition-colors size-[40px] flex items-center justify-center"
              aria-label="Preview template"
            >
              <FiEye className="h-5 w-5" />
            </button>
          </div>
        ))
      ) : (
        <p className="text-slate-400 text-sm">Хавсаргасан файл байхгүй</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-slate-200 rounded-[16px] flex min-h-0 w-full max-w-[calc(100vw-2rem)] sm:max-w-xl flex-col gap-[16px] p-[24px] max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden overscroll-contain ring-0 scrollbar-hidden pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-semibold text-[20px] leading-6">
            {actionLabel}
          </DialogTitle>
        </DialogHeader>

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
            className="border border-slate-200 px-[20px] py-[10px] rounded-[12px] text-slate-500 text-[16px] hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Болих
          </button>
          {useSalaryChangeLayout && salaryStep === "person" ? (
            <button
              onClick={() => setSalaryStep("salary")}
              className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Цааш
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              {submitting ? "Илгээж байна..." : "Илгээх"}
            </button>
          )}
        </div>
      </DialogContent>

      {typeof document !== "undefined" && previewOpen
        ? createPortal(
            <div className="fixed inset-0 z-120 flex items-center justify-center overflow-y-auto backdrop-blur-sm">
              <button
                type="button"
                aria-label="Preview close overlay"
                className="absolute inset-0 bg-black/60"
                onClick={() => setPreviewOpen(false)}
              />
              <div className="relative w-[920px] max-w-[95vw] h-[82vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <div className="flex flex-col">
                    <p className="text-slate-900 text-sm font-semibold">
                      {previewDoc?.template ?? "Баримт"}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">Preview</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
                <div className="h-full bg-slate-50 p-4">
                  {previewLoading ? (
                    <div className="w-full h-full rounded-xl border border-slate-200 flex items-center justify-center text-sm text-slate-400">
                      Уншиж байна...
                    </div>
                  ) : previewError ? (
                    <div className="w-full h-full rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-sm text-red-500">
                      {previewError}
                    </div>
                  ) : previewContent?.contentType === "text/html" ? (
                    <iframe
                      title={previewDoc?.template ?? "Template preview"}
                      className="w-full h-full rounded-xl border border-slate-200 bg-white"
                      srcDoc={previewContent.content}
                    />
                  ) : previewUrl ? (
                    <iframe
                      title={previewDoc?.template ?? "Template preview"}
                      className="w-full h-full rounded-xl border border-slate-200 bg-white"
                      src={previewUrl}
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl border border-slate-200 flex items-center justify-center text-sm text-slate-400">
                      Preview бэлэн биш байна.
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </Dialog>
  );
}
