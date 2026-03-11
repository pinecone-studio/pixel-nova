import { GraphQLScalarType, Kind, type ValueNode } from "graphql";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function parseJsonLiteral(valueNode: ValueNode): JsonValue {
  switch (valueNode.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return valueNode.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(valueNode.value);
    case Kind.NULL:
      return null;
    case Kind.OBJECT:
      return Object.fromEntries(
        valueNode.fields.map((field) => [
          field.name.value,
          parseJsonLiteral(field.value),
        ]),
      );
    case Kind.LIST:
      return valueNode.values.map((item) => parseJsonLiteral(item));
    default:
      return null;
  }
}

export const jsonScalar = new GraphQLScalarType({
  name: "JSON",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (valueNode) => parseJsonLiteral(valueNode),
});
