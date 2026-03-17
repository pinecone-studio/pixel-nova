import type { ChangeEvent, JSX, ReactNode } from "react";

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
  registerNo: string;
  setRegisterNo: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
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
  labelClass: string;
  inputClass: string;
  SelectWrapper: ({
    value,
    onChange,
    children,
  }: {
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    children: ReactNode;
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
  registerNo,
  setRegisterNo,
  phone,
  setPhone,
  branch,
  setBranch,
  dept,
  setDept,
  currentPosition,
  setCurrentPosition,
  nextPosition,
  setNextPosition,
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
  departments,
  labelClass,
  inputClass,
  SelectWrapper,
  RecipientsSection,
  DocumentsSection,
}: SalaryChangeFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-[16px]">
      {salaryStep === "person" ? (
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
              className={inputClass}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Овог</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Дорж"
              className={inputClass}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Нэр</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Дуламрагчаа"
              className={inputClass}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Имэйл</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dorj@company.com"
              className={inputClass}
            />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Регистрийн дугаар</label>
              <input
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder="УХ04272036"
                className={inputClass}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Утасны дугаар</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99999999"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Салбар</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Гурван гол"
              className={inputClass}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Хэлтэс</label>
            <SelectWrapper
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectWrapper>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Одоогийн албан тушаал</label>
              <input
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                placeholder="Junior Engineer"
                className={inputClass}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Дэвших албан тушаал</label>
              <input
                value={nextPosition}
                onChange={(e) => setNextPosition(e.target.value)}
                placeholder="Senior Engineer"
                className={inputClass}
              />
            </div>
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
              className={inputClass}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Овог</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Дорж"
              className={inputClass}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Нэр</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Дуламрагчаа"
              className={inputClass}
            />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажиллаж эхэлсэн хугацаа</label>
              <input
                value={workStartDate}
                onChange={(e) => setWorkStartDate(e.target.value)}
                placeholder="Хугацаа оруулах"
                className={inputClass}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажилласан нийт хугацаа</label>
              <input
                value={workTotalDuration}
                onChange={(e) => setWorkTotalDuration(e.target.value)}
                placeholder="Хугацаа оруулах"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Өмнөх цалин</label>
              <input
                value={prevSalary}
                onChange={(e) => setPrevSalary(e.target.value)}
                placeholder="9999999"
                className={inputClass}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Шинэ цалин</label>
              <input
                value={nextSalary}
                onChange={(e) => setNextSalary(e.target.value)}
                placeholder="9999999"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Цалин өөрчлөгдсөн дүн</label>
            <input
              value={salaryDelta}
              onChange={(e) => setSalaryDelta(e.target.value)}
              placeholder="9999999"
              className={inputClass}
            />
          </div>
        </>
      )}

      {RecipientsSection}
      {DocumentsSection}
    </div>
  );
}
