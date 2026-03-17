import type { ReactNode } from "react";

export type OffboardFormProps = {
  employeeCode: string;
  setEmployeeCode: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  registerNo: string;
  setRegisterNo: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  jobTitle: string;
  setJobTitle: (v: string) => void;
  hireDate: string;
  setHireDate: (v: string) => void;
  terminationDate: string;
  setTerminationDate: (v: string) => void;
  contractNo: string;
  setContractNo: (v: string) => void;
  terminationReason: string;
  setTerminationReason: (v: string) => void;
  labelClass: string;
  inputClass: string;
  RecipientsSection: ReactNode;
  DocumentsSection: ReactNode;
};

export function OffboardForm({
  employeeCode,
  setEmployeeCode,
  lastName,
  setLastName,
  firstName,
  setFirstName,
  registerNo,
  setRegisterNo,
  phone,
  setPhone,
  jobTitle,
  setJobTitle,
  hireDate,
  setHireDate,
  terminationDate,
  setTerminationDate,
  contractNo,
  setContractNo,
  terminationReason,
  setTerminationReason,
  labelClass,
  inputClass,
  RecipientsSection,
  DocumentsSection,
}: OffboardFormProps) {
  return (
    <div className="flex min-w-0 flex-col gap-[16px]">
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
          <label className={labelClass}>Ажилд орсон огноо</label>
          <input
            type="date"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-[8px]">
          <label className={labelClass}>Ажлаас чөлөөлөх огноо</label>
          <input
            type="date"
            value={terminationDate}
            onChange={(e) => setTerminationDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-[8px]">
        <label className={labelClass}>Хөдөлмөрийн гэрээний дугаар</label>
        <input
          value={contractNo}
          onChange={(e) => setContractNo(e.target.value)}
          placeholder="2345678987"
          className={inputClass}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-[8px]">
        <label className={labelClass}>Чөлөөлөх үндэслэл</label>
        <select
          value={terminationReason}
          onChange={(e) => setTerminationReason(e.target.value)}
          className={inputClass}
        >
          <option value="">Сонгох</option>
          <option value="Ажилтны өөрийн хүсэлтээр">
            Ажилтны өөрийн хүсэлтээр
          </option>
          <option value="Ажил олгогчийн санаачилгаар — ноцтой зөрчил">
            Ажил олгогчийн санаачилгаар — ноцтой зөрчил
          </option>
          <option value="Ажил олгогчийн санаачилгаар — бусад">
            Ажил олгогчийн санаачилгаар — бусад
          </option>
          <option value="Гэрээний хугацаа дууссан">
            Гэрээний хугацаа дууссан
          </option>
          <option value="Талуудын харилцан тохиролцоо">
            Талуудын харилцан тохиролцоо
          </option>
          <option value="Бусад">Бусад</option>
        </select>
      </div>

      {RecipientsSection}
      {DocumentsSection}
    </div>
  );
}
