"use client";

import type { ChangeEvent, JSX, ReactNode } from "react";
import { DatePickerField } from "@/components/hr/auditlog/date-picker";
import { FieldError } from "./FieldError";

type SelectWrapperProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  hasError?: boolean;
};

export type NewEmployeeFormProps = {
  tab: "hr" | "employee";
  setTab: (v: "hr" | "employee") => void;
  companyAddress: string;
  setCompanyAddress: (v: string) => void;
  companyRegisterNo: string;
  setCompanyRegisterNo: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  employeeCode: string;
  setEmployeeCode: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  registerNo: string;
  setRegisterNo: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  dept: string;
  setDept: (v: string) => void;
  jobTitle: string;
  setJobTitle: (v: string) => void;
  workSchedule: string;
  setWorkSchedule: (v: string) => void;
  workdays: string;
  setWorkdays: (v: string) => void;
  salaryAmount: string;
  setSalaryAmount: (v: string) => void;
  contractStart: string;
  setContractStart: (v: string) => void;
  contractEnd: string;
  setContractEnd: (v: string) => void;
  contractDuration: string;
  setContractDuration: (v: string) => void;
  departments: string[];
  errors: Record<string, string>;
  labelClass: string;
  inputClass: string;
  SelectWrapper: (props: SelectWrapperProps) => JSX.Element;
  RecipientsSection: ReactNode;
  DocumentsSection: ReactNode;
};

export function NewEmployeeForm({
  tab,
  setTab,
  companyAddress,
  setCompanyAddress,
  companyRegisterNo,
  setCompanyRegisterNo,
  companyName,
  setCompanyName,
  employeeCode,
  setEmployeeCode,
  branch,
  setBranch,
  lastName,
  setLastName,
  firstName,
  setFirstName,
  email,
  setEmail,
  registerNo,
  setRegisterNo,
  phone,
  setPhone,
  dept,
  setDept,
  jobTitle,
  setJobTitle,
  workSchedule,
  setWorkSchedule,
  workdays,
  setWorkdays,
  salaryAmount,
  setSalaryAmount,
  contractStart,
  setContractStart,
  contractEnd,
  setContractEnd,
  contractDuration,
  setContractDuration,
  departments,
  errors,
  labelClass,
  inputClass,
  SelectWrapper,
  RecipientsSection,
  DocumentsSection,
}: NewEmployeeFormProps) {
  const getInputClass = (key: keyof typeof errors) =>
    errors[key]
      ? `${inputClass} border-red-300 focus:border-red-400`
      : inputClass;

  return (
    <div className="flex min-w-0 flex-col gap-[16px]">
      <div className="flex min-w-0 gap-[16px] shrink-0">
        <button
          onClick={() => setTab("hr")}
          className={`flex-1 py-2 px-3 cursor-pointer rounded-[8px] text-slate-600 text-[12px] font-normal leading-[20px] transition-colors ${
            tab === "hr"
              ? "border border-[#178AFC] bg-slate-50"
              : "border border-slate-200"
          }`}
        >
          HR
        </button>
        <button
          onClick={() => setTab("employee")}
          className={`flex-1 py-2 px-3 cursor-pointer rounded-[8px] text-slate-600 text-[12px] font-normal leading-[20px] transition-colors ${
            tab === "employee"
              ? "border border-[#178AFC] bg-slate-50"
              : "border border-slate-200"
          }`}
        >
          Ажилтан
        </button>
      </div>

      {tab === "hr" ? (
        <>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Компанийн Хаяг</label>
            <input
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Сүхбаатар дүүрэг, Гурван гол оффис 3 давхар"
              className={getInputClass("companyAddress")}
            />
            <FieldError message={errors.companyAddress} />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Улсын бүртгэлийн дугаар</label>
            <input
              value={companyRegisterNo}
              onChange={(e) => setCompanyRegisterNo(e.target.value)}
              placeholder="31234567345"
              className={getInputClass("companyRegisterNo")}
            />
            <FieldError message={errors.companyRegisterNo} />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Компанийн нэр</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Pinecone Academy"
              className={getInputClass("companyName")}
            />
            <FieldError message={errors.companyName} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Ажилтны код</label>
            <input
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="EMP001"
              className={getInputClass("employeeCode")}
            />
            <FieldError message={errors.employeeCode} />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Салбар</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Гурван гол"
              className={getInputClass("branch")}
            />
            <FieldError message={errors.branch} />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Овог</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Дорж"
                className={getInputClass("lastName")}
              />
              <FieldError message={errors.lastName} />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Нэр</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Дуламрагчаа"
                className={getInputClass("firstName")}
              />
              <FieldError message={errors.firstName} />
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Имэйл</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dorj@company.com"
              className={getInputClass("email")}
            />
            <FieldError message={errors.email} />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Регистрийн дугаар</label>
              <input
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder="УХ04272036"
                className={getInputClass("registerNo")}
              />
              <FieldError message={errors.registerNo} />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Утасны дугаар</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99999999"
                className={getInputClass("phone")}
              />
              <FieldError message={errors.phone} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Хэлтэс</label>
            <SelectWrapper
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              hasError={!!errors.dept}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectWrapper>
            <FieldError message={errors.dept} />
          </div>

          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Албан тушаал</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Junior Engineer"
              className={getInputClass("jobTitle")}
            />
            <FieldError message={errors.jobTitle} />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажлын цаг</label>
              <SelectWrapper
                value={workSchedule}
                onChange={(e) => setWorkSchedule(e.target.value)}
                hasError={!!errors.workSchedule}
              >
                <option value="Бүтэн цагаар">Бүтэн цагаар</option>
                <option value="Хагас цагаар">Хагас цагаар</option>
                <option value="Ээлжээр">Ээлжээр</option>
              </SelectWrapper>
              <FieldError message={errors.workSchedule} />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажлын өдөр</label>
              <SelectWrapper
                value={workdays}
                onChange={(e) => setWorkdays(e.target.value)}
                hasError={!!errors.workdays}
              >
                <option value="Даваа-Баасан">Даваа-Баасан</option>
                <option value="Бямба-Ням">Бямба-Ням</option>
                <option value="Өдөр бүр">Өдөр бүр</option>
              </SelectWrapper>
              <FieldError message={errors.workdays} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Цалингийн хэмжээ</label>
            <input
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              placeholder="Хэмжээг оруулна уу..."
              className={getInputClass("salaryAmount")}
            />
            <FieldError message={errors.salaryAmount} />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Гэрээ эхлэх хугацаа</label>
              <DatePickerField
                value={contractStart}
                onChange={setContractStart}
                inputClass={getInputClass("contractStart")}
              />
              <FieldError message={errors.contractStart} />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Гэрээ дуусах хугацаа</label>
              <DatePickerField
                value={contractEnd}
                onChange={setContractEnd}
                inputClass={getInputClass("contractEnd")}
              />
              <FieldError message={errors.contractEnd} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Гэрээний хүчинтэй хугацаа</label>
            <SelectWrapper
              value={contractDuration}
              onChange={(e) => setContractDuration(e.target.value)}
              hasError={!!errors.contractDuration}
            >
              <option value="">Сонгох</option>
              <option value="6 сар">6 сар</option>
              <option value="1 жил">1 жил</option>
              <option value="2 жил">2 жил</option>
              <option value="Тодорхойгүй">Тодорхойгүй</option>
            </SelectWrapper>
            <FieldError message={errors.contractDuration} />
          </div>
        </>
      )}

      {RecipientsSection}
      {DocumentsSection}
    </div>
  );
}
