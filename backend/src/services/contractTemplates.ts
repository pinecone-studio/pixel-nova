import actionRegistry from "../config/action-registry.json";
import type { NormalizedActionConfig } from "../db/queries";

const addEmployeeRequired =
  actionRegistry.actions.add_employee.requiredEmployeeFields ?? [];
const promoteEmployeeRequired =
  actionRegistry.actions.promote_employee.requiredEmployeeFields ?? [];
const changePositionRequired =
  actionRegistry.actions.change_position.requiredEmployeeFields ?? [];
const offboardRequired =
  actionRegistry.actions.offboard_employee.requiredEmployeeFields ?? [];

export const CONTRACT_TEMPLATE_CONFIG = {
  employment_contract: {
    template: "employment_contract.html",
    required: addEmployeeRequired,
  },
  probation_order: {
    template: "probation_order.html",
    required: addEmployeeRequired,
  },
  job_description: {
    template: "job_description.html",
    required: addEmployeeRequired,
  },
  nda: {
    template: "nda.html",
    required: addEmployeeRequired,
  },
  salary_increase_order: {
    template: "salary_increase_order.html",
    required: promoteEmployeeRequired,
  },
  position_update_order: {
    template: "position_update_order.html",
    required: changePositionRequired,
  },
  contract_addendum: {
    template: "contract_addendum.html",
    required: changePositionRequired,
  },
  termination_order: {
    template: "termination_order.html",
    required: offboardRequired,
  },
  handover_sheet: {
    template: "handover_sheet.html",
    required: offboardRequired,
  },
} as const;

export type ContractTemplateId = keyof typeof CONTRACT_TEMPLATE_CONFIG;

export function normalizeContractTemplateIds(input: string[]) {
  const allowed = new Set(Object.keys(CONTRACT_TEMPLATE_CONFIG));
  const unique: string[] = [];
  for (const id of input) {
    if (!allowed.has(id)) continue;
    if (!unique.includes(id)) unique.push(id);
  }
  return unique as ContractTemplateId[];
}

export function buildContractActionConfig(templateIds: ContractTemplateId[]) {
  const requiredFields = new Set<string>();
  const documents = templateIds.map((id, index) => {
    const config = CONTRACT_TEMPLATE_CONFIG[id];
    config.required.forEach((field) => requiredFields.add(field));
    return {
      id,
      template: config.template,
      order: index + 1,
    };
  });

  return {
    id: "contract_request",
    name: "contract_request",
    phase: "contract-request",
    triggerCondition: null,
    triggerFields: [],
    requiredEmployeeFields: Array.from(requiredFields),
    recipients: ["hr_team"],
    documents,
  } as unknown as NormalizedActionConfig;
}
