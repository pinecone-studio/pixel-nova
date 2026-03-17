import type { ChangeEvent, JSX, ReactNode } from "react";

type SelectWrapperProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
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
  labelClass,
  inputClass,
  SelectWrapper,
  RecipientsSection,
  DocumentsSection,
}: NewEmployeeFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-[16px]">
      <div className="flex min-w-0 gap-[16px] shrink-0">
        <button
          onClick={() => setTab("hr")}
          className={`flex-1 py-[8px] px-[12px] rounded-[8px] text-slate-600 text-[12px] font-normal leading-[20px] transition-colors ${
            tab === "hr"
              ? "border border-slate-300 bg-slate-50"
              : "border border-slate-200"
          }`}
        >
          HR
        </button>
        <button
          onClick={() => setTab("employee")}
          className={`flex-1 py-[8px] px-[12px] rounded-[8px] text-slate-600 text-[12px] font-normal leading-[20px] transition-colors ${
            tab === "employee"
              ? "border border-slate-300 bg-slate-50"
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
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Улсын бүртгэлийн дугаар</label>
            <input
              value={companyRegisterNo}
              onChange={(e) => setCompanyRegisterNo(e.target.value)}
              placeholder="31234567345"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Компанийн нэр</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Pinecone Academy"
              className={inputClass}
            />
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
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className={labelClass}>Салбар</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Гурван гол"
              className={inputClass}
            />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
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
          </div>

          <div className="flex flex-col gap-[8px]">
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

          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Албан тушаал</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Junior Engineer"
              className={inputClass}
            />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажлын цаг</label>
              <SelectWrapper
                value={workSchedule}
                onChange={(e) => setWorkSchedule(e.target.value)}
              >
                <option value="Бүтэн цагаар">Бүтэн цагаар</option>
                <option value="Хагас цагаар">Хагас цагаар</option>
                <option value="Ээлжээр">Ээлжээр</option>
              </SelectWrapper>
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Ажлын өдөр</label>
              <SelectWrapper
                value={workdays}
                onChange={(e) => setWorkdays(e.target.value)}
              >
                <option value="Даваа-Баасан">Даваа-Баасан</option>
                <option value="Бямба-Ням">Бямба-Ням</option>
                <option value="Өдөр бүр">Өдөр бүр</option>
              </SelectWrapper>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Цалингийн хэмжээ</label>
            <input
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              placeholder="Хэмжээг оруулна уу..."
              className={inputClass}
            />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-[16px]">
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Гэрээ эхлэх хугацаа</label>
              <input
                type="date"
                value={contractStart}
                onChange={(e) => setContractStart(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-[8px]">
              <label className={labelClass}>Гэрээ дуусах хугацаа</label>
              <input
                type="date"
                value={contractEnd}
                onChange={(e) => setContractEnd(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-[8px]">
            <label className={labelClass}>Гэрээний хүчинтэй хугацаа</label>
            <SelectWrapper
              value={contractDuration}
              onChange={(e) => setContractDuration(e.target.value)}
            >
              <option value="">Сонгох</option>
              <option value="6 сар">6 сар</option>
              <option value="1 жил">1 жил</option>
              <option value="2 жил">2 жил</option>
              <option value="Тодорхойгүй">Тодорхойгүй</option>
            </SelectWrapper>
          </div>
        </>
      )}

      {RecipientsSection}
      {DocumentsSection}
    </div>
  );
}
