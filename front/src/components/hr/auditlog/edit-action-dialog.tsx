"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";

import { UPDATE_REGISTRY } from "@/graphql/mutations/actions";
import { GET_ACTIONS } from "@/graphql/queries";
import { buildGraphQLHeaders } from "@/lib/apollo-client";
import type { ActionConfig } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Chip input (for triggerFields, recipients, requiredEmployeeFields)
// ---------------------------------------------------------------------------

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#3f4145]">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 rounded-full border border-black/12 bg-[#f5f5f5] px-2.5 py-1 text-[12px] text-[#121316]">
            {val}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== val))}
              className="ml-0.5 text-[#77818c] hover:text-red-500">
              <FiX className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 flex-1 rounded-[8px] border border-black/12 bg-white px-3 text-[13px] text-[#121316] placeholder:text-[#77818c] outline-none focus:border-[#121316]/30"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-black/12 text-[#77818c] hover:bg-[#f5f5f5] hover:text-[#121316]">
          <FiPlus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Documents editor
// ---------------------------------------------------------------------------

function DocumentsEditor({
  docs,
  onChange,
}: {
  docs: DocEntry[];
  onChange: (docs: DocEntry[]) => void;
}) {
  const addDoc = () => {
    const nextOrder =
      docs.length > 0 ? Math.max(...docs.map((d) => d.order)) + 1 : 1;
    onChange([...docs, { id: "", template: "", order: nextOrder }]);
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
    onChange(docs.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#3f4145]">
        Баримт бичгүүд
      </label>
      <div className="flex flex-col gap-2">
        {docs
          .sort((a, b) => a.order - b.order)
          .map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-[10px] border border-black/12 bg-[#fafafa] px-3 py-2">
              <input
                type="number"
                value={doc.order}
                onChange={(e) =>
                  updateDoc(idx, "order", Number(e.target.value))
                }
                className="h-7 w-12 rounded-[6px] border border-black/12 bg-white px-2 text-center text-[12px] outline-none"
                min={1}
              />
              <input
                type="text"
                value={doc.id}
                onChange={(e) => updateDoc(idx, "id", e.target.value)}
                placeholder="ID (жнь: employment_contract)"
                className="h-7 flex-1 rounded-[6px] border border-black/12 bg-white px-2 text-[12px] outline-none placeholder:text-[#77818c]"
              />
              <input
                type="text"
                value={doc.template}
                onChange={(e) => updateDoc(idx, "template", e.target.value)}
                placeholder="Файл (жнь: employment_contract.html)"
                className="h-7 flex-1 rounded-[6px] border border-black/12 bg-white px-2 text-[12px] outline-none placeholder:text-[#77818c]"
              />
              <button
                type="button"
                onClick={() => removeDoc(idx)}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#77818c] hover:bg-red-50 hover:text-red-500">
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
      </div>
      <button
        type="button"
        onClick={addDoc}
        className="mt-2 flex items-center gap-1.5 rounded-[8px] border border-dashed border-black/20 px-3 py-1.5 text-[12px] text-[#3f4145] hover:border-[#121316]/30 hover:text-[#121316]">
        <FiPlus className="h-3 w-3" />
        Баримт нэмэх
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export function EditActionDialog({
  action,
  open,
  onOpenChange,
}: EditActionDialogProps) {
  const [phase, setPhase] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [triggerFields, setTriggerFields] = useState<string[]>([]);
  const [requiredEmployeeFields, setRequiredEmployeeFields] = useState<
    string[]
  >([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [prevAction, setPrevAction] = useState<ActionConfig | null>(null);

  if (action !== prevAction) {
    setPrevAction(action);
    if (action) {
      setPhase(action.phase);
      setTriggerCondition(action.triggerCondition ?? "");
      setTriggerFields([...action.triggerFields]);
      setRequiredEmployeeFields([...action.requiredEmployeeFields]);
      setRecipients([...action.recipients]);
      setDocs(action.documents.map((d) => ({ ...d })));
      setError(null);
    }
  }

  const [updateRegistry, { loading }] = useMutation(UPDATE_REGISTRY, {
    context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
    refetchQueries: [
      {
        query: GET_ACTIONS,
        context: { headers: buildGraphQLHeaders({ actorRole: "hr" }) },
      },
    ],
  });

  // ---- Validation ----
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!phase) errors.push("Үе шат сонгоно уу");
    if (triggerFields.length === 0)
      errors.push("Идэвхлүүлэх талбар хоосон байна");
    if (recipients.length === 0) errors.push("Хүлээн авагч нэмнэ үү");
    const validDocs = docs.filter((d) => d.id && d.template);
    if (validDocs.length === 0)
      errors.push("Дор хаяж нэг баримт бичиг нэмнэ үү");
    const dupDocIds = validDocs
      .map((d) => d.id)
      .filter((id, i, arr) => arr.indexOf(id) !== i);
    if (dupDocIds.length > 0)
      errors.push(`Давхардсан баримт ID: ${dupDocIds.join(", ")}`);
    const incompleteDocs = docs.filter(
      (d) => (d.id && !d.template) || (!d.id && d.template),
    );
    if (incompleteDocs.length > 0)
      errors.push("Баримтын ID болон файл хоёуланг бөглөнө үү");
    return errors;
  }, [phase, triggerFields, recipients, docs]);

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
              .filter((d) => d.id && d.template)
              .map((d) => ({ id: d.id, template: d.template, order: d.order })),
          },
        },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  }, [
    action,
    phase,
    triggerCondition,
    triggerFields,
    requiredEmployeeFields,
    recipients,
    docs,
    validationErrors,
    updateRegistry,
    onOpenChange,
  ]);

  if (!open || !action) return null;

  const ACTION_LABELS: Record<string, string> = {
    add_employee: "Шинэ ажилтан",
    promote_employee: "Ажилтан дэвшүүлэх",
    change_position: "Албан тушаал өөрчлөх",
    offboard_employee: "Ажлаас чөлөөлөх",
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-black/12 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/12 bg-white px-6 py-4 rounded-t-[24px]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#121316]">
              {ACTION_LABELS[action.name] ?? action.name} — Тохиргоо засах
            </h3>
            <p className="text-[13px] text-[#3f4145]">{action.name}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#77818c] transition-colors hover:bg-[#f5f5f5] hover:text-[#121316]">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Phase */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#3f4145]">
              Үе шат (Phase)
            </label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="h-9 w-full rounded-[8px] border border-black/12 bg-white px-3 text-[13px] text-[#121316] outline-none focus:border-[#121316]/30">
              <option value="onboarding">onboarding</option>
              <option value="working">working</option>
              <option value="offboarding">offboarding</option>
            </select>
          </div>

          {/* Trigger condition */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#3f4145]">
              Идэвхлүүлэх нөхцөл
            </label>
            <input
              type="text"
              value={triggerCondition}
              onChange={(e) => setTriggerCondition(e.target.value)}
              placeholder="жнь: status === 'Ирсэн' && hireDate"
              className="h-9 w-full rounded-[8px] border border-black/12 bg-white px-3 text-[13px] text-[#121316] placeholder:text-[#77818c] outline-none focus:border-[#121316]/30"
            />
          </div>

          {/* Trigger fields */}
          <ChipInput
            label="Идэвхлүүлэх талбарууд"
            values={triggerFields}
            onChange={setTriggerFields}
            placeholder="жнь: status, hireDate"
          />

          {/* Required employee fields */}
          <ChipInput
            label="Шаардлагатай ажилтны талбарууд"
            values={requiredEmployeeFields}
            onChange={setRequiredEmployeeFields}
            placeholder="жнь: employee_register_no"
          />

          {/* Recipients */}
          <ChipInput
            label="Хүлээн авагчид"
            values={recipients}
            onChange={setRecipients}
            placeholder="жнь: hr, employee, manager"
          />

          {/* Documents */}
          <DocumentsEditor docs={docs} onChange={setDocs} />

          {/* Error */}
          {error && (
            <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-black/12 bg-white px-6 py-4 rounded-b-[24px]">
          {validationErrors.length > 0 && !error && (
            <div className="flex flex-wrap gap-1.5">
              {validationErrors.map((msg) => (
                <span
                  key={msg}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] text-amber-700">
                  {msg}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-[10px] border border-black/12 px-4 py-2 text-[13px] font-medium text-[#3f4145] transition-colors hover:bg-[#f5f5f5]">
              Болих
            </button>
            <button
              onClick={handleSave}
              disabled={loading || validationErrors.length > 0}
              className="rounded-[10px] bg-[#121316] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1f2126] disabled:opacity-50">
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
