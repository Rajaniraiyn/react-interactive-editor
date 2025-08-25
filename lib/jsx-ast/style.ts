import type { JSXElement, Node } from "estree-jsx";
import { ensureStyleAttribute } from "./attributes";

function readStyleObject(element: JSXElement): Record<string, string> {
  const attr = element.openingElement.attributes.find(
    (a) =>
      a.type === "JSXAttribute" &&
      (a.name as any).type === "JSXIdentifier" &&
      (a.name as any).name === "style",
  );
  if (!attr || attr.type !== "JSXAttribute" || !(attr as any).value) return {};
  if ((attr as any).value.type !== "JSXExpressionContainer") return {};
  const expr = (attr as any).value.expression as any;
  if (expr.type !== "ObjectExpression") return {};
  const out: Record<string, string> = {};
  for (const p of expr.properties as any[]) {
    if (
      p.type === "Property" &&
      p.key.type === "Identifier" &&
      p.value.type === "Literal"
    ) {
      out[p.key.name] = String(p.value.value ?? "");
    }
  }
  return out;
}

function writeStyleObject(
  element: JSXElement,
  styleObj: Record<string, string>,
) {
  ensureStyleAttribute(element);
  element.openingElement.attributes = element.openingElement.attributes.map(
    (a) => {
      if (
        a.type === "JSXAttribute" &&
        (a.name as any).type === "JSXIdentifier" &&
        (a.name as any).name === "style"
      ) {
        return {
          ...(a as any),
          value: {
            type: "JSXExpressionContainer",
            expression: {
              type: "ObjectExpression",
              properties: Object.entries(styleObj).map(([k, v]) => ({
                type: "Property",
                method: false,
                shorthand: false,
                computed: false,
                key: { type: "Identifier", name: k },
                value: { type: "Literal", value: v as any },
                kind: "init",
              })),
            } as any,
          } as any,
        } as any;
      }
      return a;
    },
  );
}

export function getStyleValue(node: Node, key: string): string | null {
  if (node.type !== "JSXElement") return null;
  const obj = readStyleObject(node);
  return (obj[key] as string) ?? null;
}

export function setStyleValue(node: Node, key: string, value: string | null) {
  if (node.type !== "JSXElement") return;
  const obj = readStyleObject(node);
  if (value === null || value === "") {
    delete obj[key];
  } else {
    obj[key] = value;
  }
  writeStyleObject(node, obj);
}

export function getStyleEntries(node: Node): [string, string][] {
  if (node.type !== "JSXElement") return [];
  const obj = readStyleObject(node);
  return Object.entries(obj);
}
