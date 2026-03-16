import { jsonScalar } from "./scalars";
import { queryResolvers } from "./queryResolvers";
import { mutationResolvers } from "./mutationResolvers";

function parseDocumentProfile(value: string | null | undefined) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export const resolvers = {
  JSON: jsonScalar,
  Employee: {
    documentProfile: (employee: { documentProfile?: string | null }) =>
      parseDocumentProfile(employee.documentProfile),
    numberOfVacationDays: (employee: { numberOfVacationDays?: unknown }) => {
      const value = employee.numberOfVacationDays;
      if (value == null) return null;
      if (typeof value === "number") return Number.isFinite(value) ? value : null;
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    },
  },
  Query: queryResolvers,
  Mutation: mutationResolvers,
};
