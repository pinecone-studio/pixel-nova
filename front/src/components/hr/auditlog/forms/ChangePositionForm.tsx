import type { ChangeEvent, JSX, ReactNode } from "react";
import { FieldError } from "./FieldError";

type SelectWrapperProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  hasError?: boolean;
};

export type ChangePositionFormProps = {
  employeeCode: string;
  setEmployeeCode: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  currentDept: string;
  setCurrentDept: (v: string) => void;
  currentPosition: string;
  setCurrentPosition: (v: string) => void;
  nextDept: string;
  setNextDept: (v: string) => void;
  nextPosition: string;
  setNextPosition: (v: string) => void;
  changeReason: string;
  setChangeReason: (v: string) => void;
  departments: string[];
  errors: Record<string, string>;
  labelClass: string;
  inputClass: string;
  SelectWrapper: (props: SelectWrapperProps) => JSX.Element;
  RecipientsSection: ReactNode;
  DocumentsSection: ReactNode;
};

export function ChangePositionForm({
  employeeCode,
  setEmployeeCode,
  lastName,
  setLastName,
  firstName,
  setFirstName,
  email,
  setEmail,
  currentDept,
  setCurrentDept,
  currentPosition,
  setCurrentPosition,
  nextDept,
  setNextDept,
  nextPosition,
  setNextPosition,
  changeReason,
  setChangeReason,
  departments,
  errors,
  labelClass,
  inputClass,
  SelectWrapper,
  RecipientsSection,
  DocumentsSection,
}: ChangePositionFormProps) {
  const getInputClass = (key: keyof typeof errors) =>
    errors[key]
      ? `${inputClass} border-red-300 focus:border-red-400`
      : inputClass;
  const fillMock = () => {
    const defaultDept = departments?.[0] ?? "Engineering";
    setEmployeeCode("EMP0003");
    setLastName("Дорж");
    setFirstName("Эрдэнэ");
    setCurrentDept(defaultDept);
    setCurrentPosition("Junior Engineer");
    setNextDept(defaultDept);
    setNextPosition("Mid Engineer");
    setChangeReason("Гүйцэтгэлийн үнэлгээ");
  };

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
      <div className="flex min-w-0 flex-col gap-[8px]">
        <label className={labelClass}>Имэйл</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@gmail.com"
          className={getInputClass("email")}
        />
        <FieldError message={errors.email} />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-[16px]">
        <div className="flex min-w-0 flex-col gap-[8px]">
          <label className={labelClass}>Одоогийн хэлтэс</label>
          <SelectWrapper
            value={currentDept}
            onChange={(e) => setCurrentDept(e.target.value)}
            hasError={!!errors.currentDept}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SelectWrapper>
          <FieldError message={errors.currentDept} />
        </div>
        <div className="flex min-w-0 flex-col gap-[8px]">
          <label className={labelClass}>Одоогийн албан тушаал</label>
          <input
            value={currentPosition}
            onChange={(e) => setCurrentPosition(e.target.value)}
            placeholder="Junior Engineer"
            className={getInputClass("currentPosition")}
          />
          <FieldError message={errors.currentPosition} />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-[16px]">
        <div className="flex min-w-0 flex-col gap-[8px]">
          <label className={labelClass}>Шилжих буй хэлтэс</label>
          <SelectWrapper
            value={nextDept}
            onChange={(e) => setNextDept(e.target.value)}
            hasError={!!errors.nextDept}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SelectWrapper>
          <FieldError message={errors.nextDept} />
        </div>
        <div className="flex min-w-0 flex-col gap-[8px]">
          <label className={labelClass}>Шилжих буй албан тушаал</label>
          <input
            value={nextPosition}
            onChange={(e) => setNextPosition(e.target.value)}
            placeholder="Junior Engineer"
            className={getInputClass("nextPosition")}
          />
          <FieldError message={errors.nextPosition} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-[8px]">
        <label className={labelClass}>Албан тушаал өөрчилсөн үндэслэл</label>
        <SelectWrapper
          value={changeReason}
          onChange={(e) => setChangeReason(e.target.value)}
          hasError={!!errors.changeReason}
        >
          <option value="">Сонгох</option>
          <option value="Ажлын шаардлага">Ажлын шаардлага</option>
          <option value="Гүйцэтгэлийн үнэлгээ">Гүйцэтгэлийн үнэлгээ</option>
          <option value="Дотоод шилжилт">Дотоод шилжилт</option>
          <option value="Бусад">Бусад</option>
        </SelectWrapper>
        <FieldError message={errors.changeReason} />
      </div>

      {RecipientsSection}
      {DocumentsSection}
    </div>
  );
}
