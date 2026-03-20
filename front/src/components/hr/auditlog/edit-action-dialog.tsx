"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  FiEye,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { createPortal } from "react-dom";

import { UPDATE_REGISTRY } from "@/graphql/mutations/actions";
import { GET_ACTIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ActionConfig } from "@/lib/types";
import { useHrOverlay } from "../overlay-context";

interface EditActionDialogProps {
  action: ActionConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DocEntry {
  id: string;
  template: string;
  order: number;
}

function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-[18px] font-medium leading-6 text-[#121316]">
        {label}
      </label>

      <div className="flex min-h-10 flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-2 rounded-full border border-[#D5D7DA] bg-white px-4 py-1.5 text-[16px] leading-6 text-[#6B7280] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((entry) => entry !== value))}
              className="text-[#6B7280] transition-colors hover:text-[#121316]"
              aria-label={`Remove ${value}`}
            >
              <FiX className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 flex-1 rounded-[12px] border border-[#D5D7DA] bg-white px-4 text-[16px] text-[#121316] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#121316]/30"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#D5D7DA] text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#121316]"
          aria-label={`Add ${label}`}
        >
          <FiPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function DocumentsEditor({
  docs,
  originalDocs,
  onChange,
}: {
  docs: DocEntry[];
  originalDocs: DocEntry[];
  onChange: (docs: DocEntry[]) => void;
}) {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

  const addDoc = () => {
    const nextOrder =
      docs.length > 0 ? Math.max(...docs.map((doc) => doc.order)) + 1 : 1;
    onChange([...docs, { id: "", template: "", order: nextOrder }]);
    setExpandedIndices((prev) => [...prev, docs.length]);
  };

  const updateDoc = (
    index: number,
    field: keyof DocEntry,
    value: string | number,
  ) => {
    const updated = [...docs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeDoc = (index: number) => {
    onChange(docs.filter((_, currentIndex) => currentIndex !== index));
    setExpandedIndices((prev) =>
      prev.filter((entry) => entry !== index).map((entry) => (entry > index ? entry - 1 : entry)),
    );
  };

  const resetDoc = (index: number) => {
    const original = originalDocs[index];
    if (!original) return;
    const updated = [...docs];
    updated[index] = { ...original };
    onChange(updated);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((entry) => entry !== index)
        : [...prev, index],
    );
  };

  const visibleDocs = docs.map((doc, index) => ({ doc, index }));

  return (
    <div className="flex flex-col gap-4">
      <label className="text-[18px] font-medium leading-6 text-[#121316]">
        Хавсаргасан файл
      </label>

      <div className="flex flex-col gap-4">
        {visibleDocs.map(({ doc, index }) => {
          const isExpanded = expandedIndices.includes(index);
          const fileName = doc.id
            ? `${doc.id.toLowerCase().replace(/\s+/g, "_")}.pdf`
            : "document.pdf";

          return (
            <div
              key={`${doc.id}-${doc.order}-${index}`}
              className="rounded-[20px] border border-[#D5D7DA] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border border-[#D5D7DA] bg-[#FAFAFA] text-[#3F4145]">
                  <FiFileText className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[18px] font-medium leading-7 text-[#121316]">
                    {doc.template || "Шинэ баримт"}
                  </p>
                  <p className="truncate text-[14px] leading-5 text-[#84878B]">
                    {fileName}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#3F4145] transition-colors hover:bg-[#F4F4F5]"
                    aria-label="Toggle document details"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => resetDoc(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#3F4145] transition-colors hover:bg-[#F4F4F5]"
                    aria-label="Reset document values"
                  >
                    <FiRefreshCw className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDoc(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#B42318] transition-colors hover:bg-[#FEF3F2]"
                    aria-label="Remove document"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-4 grid gap-3 border-t border-[#EAECF0] pt-4 md:grid-cols-[96px_1fr_1fr]">
                  <input
                    type="number"
                    value={doc.order}
                    onChange={(event) =>
                      updateDoc(index, "order", Number(event.target.value))
                    }
                    className="h-11 rounded-[12px] border border-[#D5D7DA] bg-white px-4 text-[15px] text-[#121316] outline-none focus:border-[#121316]/30"
                    min={1}
                    placeholder="Order"
                  />
                  <input
                    type="text"
                    value={doc.id}
                    onChange={(event) => updateDoc(index, "id", event.target.value)}
                    placeholder="ID: employment_contract"
                    className="h-11 rounded-[12px] border border-[#D5D7DA] bg-white px-4 text-[15px] text-[#121316] placeholder:text-[#9CA3AF] outline-none focus:border-[#121316]/30"
                  />
                  <input
                    type="text"
                    value={doc.template}
                    onChange={(event) =>
                      updateDoc(index, "template", event.target.value)
                    }
                    placeholder="Файл: employment_contract"
                    className="h-11 rounded-[12px] border border-[#D5D7DA] bg-white px-4 text-[15px] text-[#121316] placeholder:text-[#9CA3AF] outline-none focus:border-[#121316]/30"
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addDoc}
        className="flex items-center gap-2 self-start rounded-[12px] border border-dashed border-[#D5D7DA] px-4 py-2 text-[14px] font-medium text-[#3F4145] transition-colors hover:border-[#121316]/30 hover:text-[#121316]"
      >
        <FiPlus className="h-4 w-4" />
        Баримт нэмэх
      </button>
    </div>
  );
}

export function EditActionDialog({
  action,
  open,
  onOpenChange,
}: EditActionDialogProps) {
  const { setBlurred } = useHrOverlay();

  useEffect(() => {
    setBlurred(open);
    return () => setBlurred(false);
  }, [open, setBlurred]);

  if (!open || !action) return null;

  const dialog = <EditActionDialogContent key={action.name} action={action} onOpenChange={onOpenChange} />;

  return typeof document !== "undefined"
    ? createPortal(dialog, document.body)
    : dialog;
}

function EditActionDialogContent({
  action,
  onOpenChange,
}: {
  action: ActionConfig;
  onOpenChange: (open: boolean) => void;
}) {
  const [phase, setPhase] = useState(action.phase);
  const [triggerCondition, setTriggerCondition] = useState(
    action.triggerCondition ?? "",
  );
  const [triggerFields, setTriggerFields] = useState<string[]>([
    ...action.triggerFields,
  ]);
  const [requiredEmployeeFields, setRequiredEmployeeFields] = useState<string[]>(
    [...action.requiredEmployeeFields],
  );
  const [recipients, setRecipients] = useState<string[]>([...action.recipients]);
  const [docs, setDocs] = useState<DocEntry[]>(action.documents.map((doc) => ({ ...doc })));
  const [error, setError] = useState<string | null>(null);

  const [updateRegistry, { loading }] = useMutation(UPDATE_REGISTRY, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
    refetchQueries: [
      {
        query: GET_ACTIONS,
        context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
      },
    ],
  });

  const validationErrors = useMemo(() => {
    const nextErrors: string[] = [];
    if (!phase) nextErrors.push("Үе шат сонгоно уу");
    if (triggerFields.length === 0) nextErrors.push("Идэвхжүүлэх талбар хоосон байна");
    if (recipients.length === 0) nextErrors.push("Хүлээн авагч нэмнэ үү");

    const validDocs = docs.filter((doc) => doc.id && doc.template);
    if (validDocs.length === 0) {
      nextErrors.push("Дор хаяж нэг баримт нэмнэ үү");
    }

    const duplicateIds = validDocs
      .map((doc) => doc.id)
      .filter((id, index, all) => all.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      nextErrors.push(`Давхардсан баримт ID: ${duplicateIds.join(", ")}`);
    }

    const incompleteDocs = docs.filter(
      (doc) => (doc.id && !doc.template) || (!doc.id && doc.template),
    );
    if (incompleteDocs.length > 0) {
      nextErrors.push("Баримтын ID болон файлын нэрийг хоёуланг нь бөглөнө үү");
    }

    return nextErrors;
  }, [docs, phase, recipients, triggerFields]);

  const handleSave = useCallback(async () => {
    if (!action) return;

    setError(null);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(" · "));
      return;
    }

    try {
      await updateRegistry({
        variables: {
          input: {
            name: action.name,
            phase,
            triggerCondition: triggerCondition || null,
            triggerFields,
            requiredEmployeeFields,
            recipients,
            documents: docs
              .filter((doc) => doc.id && doc.template)
              .map((doc) => ({
                id: doc.id,
                template: doc.template,
                order: doc.order,
              })),
          },
        },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }, [
    action,
    docs,
    onOpenChange,
    phase,
    recipients,
    requiredEmployeeFields,
    triggerCondition,
    triggerFields,
    updateRegistry,
    validationErrors,
  ]);

  const actionLabels: Record<string, string> = {
    add_employee: "Шинэ ажилтан нэмэх",
    promote_employee: "Цалин нэмэх",
    change_position: "Албан тушаал өөрчлөх",
    offboard_employee: "Ажлаас чөлөөлөх",
  };

  const usePresetLayout = [
    "add_employee",
    "promote_employee",
    "change_position",
    "offboard_employee",
  ].includes(action.name);

  const originalDocs = action.documents.map((doc) => ({ ...doc }));

  const dialog = (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-4">
      <button
        type="button"
        aria-label="Close edit action overlay"
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative max-h-[92vh] w-full max-w-[586px] overflow-y-auto rounded-[24px] bg-white shadow-[0_24px_48px_rgba(16,24,40,0.18)]">
        <div className="flex items-center justify-between px-7 pb-3 pt-7">
          <h3 className="text-[24px] font-semibold leading-8 text-[#121316]">
            {actionLabels[action.name] ?? action.name}
          </h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#121316] transition-colors hover:bg-[#F4F4F5]"
            aria-label="Close dialog"
          >
            <FiX className="h-7 w-7" />
          </button>
        </div>

        <div className="flex flex-col gap-8 px-7 pb-8 pt-3">
          {usePresetLayout ? (
            <>
              <ChipInput
                label="Шаардлагатай мэдээллүүд"
                values={requiredEmployeeFields}
                onChange={setRequiredEmployeeFields}
                placeholder="Нэр оруулна уу"
              />

              <ChipInput
                label="Хүлээн авагчид"
                values={recipients}
                onChange={setRecipients}
                placeholder="Нэр оруулна уу"
              />

              <DocumentsEditor
                docs={docs}
                originalDocs={originalDocs}
                onChange={setDocs}
              />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#3F4145]">
                  Үе шат
                </label>
                <select
                  value={phase}
                  onChange={(event) => setPhase(event.target.value)}
                  className="h-11 w-full rounded-[12px] border border-[#D5D7DA] bg-white px-4 text-[15px] text-[#121316] outline-none focus:border-[#121316]/30"
                >
                  <option value="onboarding">onboarding</option>
                  <option value="working">working</option>
                  <option value="offboarding">offboarding</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#3F4145]">
                  Идэвхжүүлэх нөхцөл
                </label>
                <input
                  type="text"
                  value={triggerCondition}
                  onChange={(event) => setTriggerCondition(event.target.value)}
                  placeholder="status === 'Ирсэн' && hireDate"
                  className="h-11 w-full rounded-[12px] border border-[#D5D7DA] bg-white px-4 text-[15px] text-[#121316] placeholder:text-[#9CA3AF] outline-none focus:border-[#121316]/30"
                />
              </div>

              <ChipInput
                label="Идэвхжүүлэх талбарууд"
                values={triggerFields}
                onChange={setTriggerFields}
                placeholder="Нэр оруулна уу"
              />

              <ChipInput
                label="Шаардлагатай мэдээллүүд"
                values={requiredEmployeeFields}
                onChange={setRequiredEmployeeFields}
                placeholder="Нэр оруулна уу"
              />

              <ChipInput
                label="Хүлээн авагчид"
                values={recipients}
                onChange={setRecipients}
                placeholder="Нэр оруулна уу"
              />

              <DocumentsEditor
                docs={docs}
                originalDocs={originalDocs}
                onChange={setDocs}
              />
            </>
          )}

          {error ? (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600">
              {error}
            </div>
          ) : null}

          {validationErrors.length > 0 && !error ? (
            <div className="flex flex-wrap gap-2">
              {validationErrors.map((message) => (
                <span
                  key={message}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[12px] text-amber-700"
                >
                  {message}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-w-[116px] rounded-[18px] border border-[#D5D7DA] px-6 py-3 text-[18px] font-medium leading-7 text-[#3F4145] transition-colors hover:bg-[#F9FAFB]"
            >
              Болих
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || validationErrors.length > 0}
              className="min-w-[116px] rounded-[18px] bg-[#23252B] px-6 py-3 text-[18px] font-medium leading-7 text-white transition-colors hover:bg-[#17191E] disabled:opacity-50"
            >
              {loading ? "Хадгалж байна..." : "Засах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return dialog;
}
