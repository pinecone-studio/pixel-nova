import { jsonScalar } from "./scalars";
import { queryResolvers } from "./queryResolvers";
import { mutationResolvers } from "./mutationResolvers";

export const resolvers = {
  JSON: jsonScalar,
  Query: queryResolvers,
  Mutation: mutationResolvers,
};
