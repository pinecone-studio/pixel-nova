"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEye, FiFileText, FiX } from "react-icons/fi";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GET_EMPLOYEES } from "@/graphql/queries";
import { TRIGGER_ACTION } from "@/graphql/mutations";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ActionConfig, Employee } from "@/lib/types";
import { ChangePositionForm } from "./forms/ChangePositionForm";
import { NewEmployeeForm } from "./forms/NewEmployeeForm";
import { OffboardForm } from "./forms/OffboardForm";
import { SalaryChangeForm } from "./forms/SalaryChangeForm";

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

const inputClass =
  "border border-slate-200 rounded-[8px] px-[12px] py-[8px] bg-white text-slate-700 text-[16px] placeholder:text-slate-400 outline-none focus:border-slate-300 tracking-[-0.16px]";

const labelClass =
  "text-slate-700 text-[14px] font-semibold tracking-[-0.084px]";

const SelectWrapper = ({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) => (
  <div className="relative">
    <select value={value} onChange={onChange} className={selectClass}>
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentDept, setCurrentDept] = useState("Engineering");
  const [currentPosition, setCurrentPosition] = useState("");
  const [nextDept, setNextDept] = useState("Engineering");
  const [nextPosition, setNextPosition] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [recipients, setRecipients] = useState<string[]>(() =>
    action?.recipients.length ? [...action.recipients] : ["hr_manager"],
  );
  const [recipientInput, setRecipientInput] = useState("");

  const documents = action?.documents ?? [];
  const actionKey = action?.name?.toLowerCase() ?? "";
  const actionLabelMap: Record<string, string> = {
    add_employee: "Шинэ ажилтан",
    change_position: "Албан тушаал өөрчлөх",
    promote_employee: "Ажилтан дэвшүүлэх",
    offboard_employee: "Ажлаас чөлөөлөх",
  };
  const actionLabel = actionLabelMap[actionKey] ?? action?.name ?? "Шинэ ажилтан";
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

  useEffect(() => {
    if (!action) return;
    setEmployeeCode("");
    setRecipients(
      action.recipients.length ? [...action.recipients] : ["hr_manager"],
    );
    setRecipientInput("");
    setTab("hr");
    setSalaryStep("person");
  }, [action]);

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

  const [triggerAction, { loading: submitting }] = useMutation(TRIGGER_ACTION, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
  });

  async function handleSubmit() {
    setSubmitError(null);
    if (!action?.name) {
      setSubmitError("Үйлдлийн нэр олдсонгүй.");
      return;
    }
    if (!matchedEmployee?.id) {
      setSubmitError("Ажилтны кодоор ажилтан олдсонгүй.");
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
      setSubmitError(
        err instanceof Error ? err.message : "Илгээхэд алдаа гарлаа.",
      );
    }
  }

  // ── Хүлээн авагчид + файл (хоёр section-д хуваалцана) ──
  const RecipientsSection = (
    <div className="flex flex-col gap-[8px]">
      <label className={labelClass}>Хүлээн авагчид</label>
      <div className="mb-1 flex min-w-0 flex-wrap gap-[6px]">
        {recipients.map((recipient) => (
          <span
            key={recipient}
            className="inline-flex max-w-full items-center gap-[4px] rounded-[10px] border border-slate-200 px-[9px] py-[3px] text-slate-500 text-[12px] leading-[20px] bg-slate-50"
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
            <button className="text-slate-400 hover:text-slate-700 transition-colors size-[40px] flex items-center justify-center">
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
      <DialogContent className="bg-white border border-slate-200 rounded-[16px] flex w-full max-w-[calc(100vw-2rem)] sm:max-w-xl flex-col gap-[16px] p-[24px] max-h-[92vh] overflow-y-auto overflow-x-hidden ring-0 scrollbar-hidden">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-semibold text-[20px] leading-[24px]">
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
            registerNo={registerNo}
            setRegisterNo={setRegisterNo}
            phone={phone}
            setPhone={setPhone}
            branch={branch}
            setBranch={setBranch}
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
        <div className="flex items-center gap-[20px] justify-end shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="border border-slate-200 px-[20px] py-[10px] rounded-[12px] text-slate-500 text-[16px] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Болих
          </button>
          {useSalaryChangeLayout && salaryStep === "person" ? (
            <button
              onClick={() => setSalaryStep("salary")}
              className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Цааш
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-slate-900 px-[20px] py-[10px] rounded-[12px] text-white text-[16px] hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? "Илгээж байна..." : "Илгээх"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
