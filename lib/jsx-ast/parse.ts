import acornJsx from "acorn-jsx";
import { fromJs } from "esast-util-from-js";
import type { JSXElement, Program } from "estree-jsx";
import { jsx, toJs } from "estree-util-to-js";
import { visit } from "estree-util-visit";
import { EDIT_MARKER } from "./constants";

export interface CodeWithNodeMappingResult {
  code: string;
  nodeMap: Map<number, JSXElement>;
  ast: Program;
}

export function codeWithNodeMapping(
  rawCode: string,
): CodeWithNodeMappingResult {
  const ast = fromJs(rawCode, {
    plugins: [
      acornJsx({ allowNamespacedObjects: true, allowNamespaces: true }),
    ],
  });
  const nodeMap = new Map<number, JSXElement>();
  let editId = 0;
  visit(ast, (node) => {
    if (node.type === "JSXElement") {
      // Remove existing edit marker to avoid duplicates across re-processing
      node.openingElement.attributes = node.openingElement.attributes.filter(
        (attr) =>
          !(
            attr.type === "JSXAttribute" &&
            attr.name.type === "JSXIdentifier" &&
            attr.name.name === EDIT_MARKER
          ),
      );
      node.openingElement.attributes.push({
        type: "JSXAttribute",
        name: {
          type: "JSXIdentifier",
          name: EDIT_MARKER,
        },
        value: {
          type: "Literal",
          value: editId,
          raw: editId.toString(),
        },
      } as any);
      nodeMap.set(editId, node);
      editId++;
    }
  });
  return {
    code: astToCode(ast),
    nodeMap,
    ast,
  };
}

export function astToCode(ast: Program) {
  const { value: code } = toJs(ast, { handlers: jsx });
  // remove trailing semicolon
  return code.replace(/;\s*$/, "");
}
