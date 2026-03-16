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
  },
  Query: queryResolvers,
  Mutation: mutationResolvers,
};
