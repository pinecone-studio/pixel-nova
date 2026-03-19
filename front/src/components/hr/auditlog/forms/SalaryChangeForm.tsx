import type { ChangeEvent, JSX, ReactNode } from "react";
import { DatePickerField } from "@/components/hr/auditlog/date-picker";
import { FieldError } from "./FieldError";

export type SalaryChangeFormProps = {
  salaryStep: "person" | "salary";
  employeeCode: string;
  setEmployeeCode: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  dept: string;
  setDept: (v: string) => void;
  currentPosition: string;
  setCurrentPosition: (v: string) => void;
  nextPosition: string;
  setNextPosition: (v: string) => void;
  workStartDate: string;
  setWorkStartDate: (v: string) => void;
  workTotalDuration: string;
  setWorkTotalDuration: (v: string) => void;
  prevSalary: string;
  setPrevSalary: (v: string) => void;
  nextSalary: string;
  setNextSalary: (v: string) => void;
  salaryDelta: string;
  setSalaryDelta: (v: string) => void;
  departments: string[];
  errors: Record<string, string>;
  labelClass: string;
  inputClass: string;
  SelectWrapper: ({
    value,
    onChange,
    children,
    hasError,
  }: {
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    children: ReactNode;
    hasError?: boolean;
  }) => JSX.Element;
  RecipientsSection: ReactNode;
  DocumentsSection: ReactNode;
};

export function SalaryChangeForm({
  salaryStep,
  employeeCode,
  setEmployeeCode,
  lastName,
  setLastName,
  firstName,
  setFirstName,
  email,
  setEmail,
  workStartDate,
  setWorkStartDate,
  workTotalDuration,
  setWorkTotalDuration,
  prevSalary,
  setPrevSalary,
  nextSalary,
  setNextSalary,
  salaryDelta,
  setSalaryDelta,
  errors,
  labelClass,
  inputClass,
  RecipientsSection,
  DocumentsSection,
}: SalaryChangeFormProps) {
  const getInputClass = (key: keyof typeof errors) =>
    errors[key]
      ? `${inputClass} border-red-300 focus:border-red-400`
      : inputClass;
  const fillMock = () => {
    setEmployeeCode("EMP0003");
    setLastName("Дорж");
    setFirstName("Эрдэнэ");
    setEmail("dorj.erde@gmail.com");
    setWorkStartDate("2024-02-01");
    setWorkTotalDuration("2 жил 1 сар");
    setPrevSalary("3500000");
    setNextSalary("4200000");
    setSalaryDelta("700000");
  };

  return (
    <div className="flex min-w-0 flex-col gap-[16px]">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={fillMock}
          className="rounded-[10px] border border-black/12 px-3 py-1.5 text-[12px] font-medium text-[#3f4145] transition-colors hover:bg-[#f5f5f5]"
        >
          Demo бөглөх
        </button>
      </div>
      {salaryStep === "person" ? (
        <>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Ажилтны код</label>
            <input
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="EMP-0001"
              name="employee_code"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className={getInputClass("employeeCode")}
            />
            <FieldError message={errors.employeeCode} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label className={labelClass}>Овог</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Дорж"
              className={getInputClass("lastName")}
            />
            <FieldError message={errors.lastName} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label className={labelClass}>Нэр</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Дуламрагчаа"
              className={getInputClass("firstName")}
            />
            <FieldError message={errors.firstName} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label className={labelClass}>Имэйл</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dorj@company.com"
              className={getInputClass("email")}
            />
            <FieldError message={errors.email} />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClass}>Ажиллаж эхэлсэн хугацаа</label>
              <DatePickerField
                value={workStartDate}
                onChange={setWorkStartDate}
                inputClass={getInputClass("workStartDate")}
              />
              <FieldError message={errors.workStartDate} />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <label className={labelClass}>Ажилласан нийт хугацаа</label>
              <input
                value={workTotalDuration}
                onChange={(e) => setWorkTotalDuration(e.target.value)}
                placeholder="Хугацаа оруулах"
                className={getInputClass("workTotalDuration")}
              />
              <FieldError message={errors.workTotalDuration} />
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClass}>Өмнөх цалин</label>
              <input
                value={prevSalary}
                onChange={(e) => setPrevSalary(e.target.value)}
                placeholder="9999999"
                className={getInputClass("prevSalary")}
              />
              <FieldError message={errors.prevSalary} />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={labelClass}>Шинэ цалин</label>
              <input
                value={nextSalary}
                onChange={(e) => setNextSalary(e.target.value)}
                placeholder="9999999"
                className={getInputClass("nextSalary")}
              />
              <FieldError message={errors.nextSalary} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label className={labelClass}>Цалин өөрчлөгдсөн дүн</label>
            <input
              value={salaryDelta}
              onChange={(e) => setSalaryDelta(e.target.value)}
              placeholder="9999999"
              className={getInputClass("salaryDelta")}
            />
            <FieldError message={errors.salaryDelta} />
          </div>
        </>
      ) : (
        <>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Ажилтны код</label>
            <input
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="EMP001"
              name="employee_code"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className={getInputClass("employeeCode")}
            />
            <FieldError message={errors.employeeCode} />
          </div>
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
          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажиллаж эхэлсэн хугацаа</label>
              <DatePickerField
                value={workStartDate}
                onChange={setWorkStartDate}
                inputClass={getInputClass("workStartDate")}
              />
              <FieldError message={errors.workStartDate} />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажилласан нийт хугацаа</label>
              <input
                value={workTotalDuration}
                onChange={(e) => setWorkTotalDuration(e.target.value)}
                placeholder="Хугацаа оруулах"
                className={getInputClass("workTotalDuration")}
              />
              <FieldError message={errors.workTotalDuration} />
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Өмнөх цалин</label>
              <input
                value={prevSalary}
                onChange={(e) => setPrevSalary(e.target.value)}
                placeholder="9999999"
                className={getInputClass("prevSalary")}
              />
              <FieldError message={errors.prevSalary} />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Шинэ цалин</label>
              <input
                value={nextSalary}
                onChange={(e) => setNextSalary(e.target.value)}
                placeholder="9999999"
                className={getInputClass("nextSalary")}
              />
              <FieldError message={errors.nextSalary} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Цалин өөрчлөгдсөн дүн</label>
            <input
              value={salaryDelta}
              onChange={(e) => setSalaryDelta(e.target.value)}
              placeholder="9999999"
              className={getInputClass("salaryDelta")}
            />
            <FieldError message={errors.salaryDelta} />
          </div>
        </>
      )}

      {RecipientsSection}
      {DocumentsSection}
    </div>
  );
}
