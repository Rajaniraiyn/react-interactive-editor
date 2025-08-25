"use client";



import acornJsx from "acorn-jsx";
import { fromJs } from "esast-util-from-js";
import type { JSXElement, Literal, Node, Program, SimpleLiteral } from "estree-jsx";
import { jsx, toJs } from "estree-util-to-js";
import { visit } from "estree-util-visit";
import { useEffect, useMemo, useRef, useState } from "react";
import JsxParser from "react-jsx-parser";
import { ElementPicker } from "./element-picker";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarSeparator,
  useSidebar
} from "./ui/sidebar";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface InteractiveEditorProps {
  code: string;
}

const EDIT_MARKER = "data-__interactive-editor-edit-id";

export function InteractiveEditor({
  code: initialCode,
}: InteractiveEditorProps) {
  const [code, setCode] = useState(initialCode);

  const {
    code: processedCode,
    nodeMap,
    ast,
  } = useMemo(() => codeWithNodeMapping(code), [code]);
  const editableRegionRef = useRef<HTMLDivElement>(null);

  const [pickedElement, setPickedElement] = useState<HTMLElement | null>(null);

  const pickedNode = useMemo(() => {
    if (!pickedElement) return null;
    const editId = pickedElement.getAttribute(EDIT_MARKER);
    if (!editId) return null;
    return nodeMap.get(Number.parseInt(editId)) ?? null;
  }, [pickedElement, nodeMap]);

  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <div ref={editableRegionRef}>
          <JsxParser jsx={processedCode} />
        </div>
        <Editor
          node={pickedNode}
          onMutate={() => {
            setCode(astToCode(ast));
          }}
        />
      </SidebarProvider>
      <ElementPicker
        containerRef={editableRegionRef}
        canPick={(e) => e.getAttribute(EDIT_MARKER) !== null}
        onPick={setPickedElement}
      />
    </>
  );
}

function codeWithNodeMapping(rawCode: string) {
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
      });
      nodeMap.set(editId, node);
      editId++;
    }
  });
  console.log(ast);
  return {
    code: astToCode(ast),
    nodeMap,
    ast,
  };
}

function astToCode(ast: Program) {
  const { value: code } = toJs(ast, { handlers: jsx });
  // remove trailing semicolon
  return code.replace(/;\s*$/, "");
}

interface EditorProps {
  node: Node | null;
  onMutate?: () => void;
}

function Editor({ node, onMutate }: EditorProps) {

  const {  setOpen, setOpenMobile } = useSidebar();
  const [newStyleKey, setNewStyleKey] = useState("");
  const [newStyleValue, setNewStyleValue] = useState("");

  useEffect(() => {
    if (node) {
      setOpen(true);
      setOpenMobile(true);
    }
  }, [node, setOpen, setOpenMobile]);

  return (
    <Sidebar side="right" variant="inset">
      <SidebarHeader>Editor</SidebarHeader>
      <SidebarSeparator />
      {node && (
        <SidebarContent>
          {canEditText(node) && (
            <div>
              <h3>Text</h3>
              <Textarea
                value={getText(node)}
                onChange={(e) => {
                  setText(node, e.target.value);
                  onMutate?.();
                }}
              />
            </div>
          )}
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium">Background Color</h3>
              <Input
                type="color"
                value={getStyleValue(node, 'backgroundColor') ?? '#000000'}
                onChange={(e) => {
                  setStyleValue(node, 'backgroundColor', e.target.value);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium">Text Color</h3>
              <Input
                type="color"
                value={getStyleValue(node, 'color') ?? '#000000'}
                onChange={(e) => {
                  setStyleValue(node, 'color', e.target.value);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium">Padding</h3>
              <Input
                placeholder="e.g. 1rem, 16px"
                value={getStyleValue(node, 'padding') ?? ''}
                onChange={(e) => {
                  setStyleValue(node, 'padding', e.target.value || null);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-sm font-medium">Margin</h3>
              <Input
                placeholder="e.g. 1rem, 16px"
                value={getStyleValue(node, 'margin') ?? ''}
                onChange={(e) => {
                  setStyleValue(node, 'margin', e.target.value || null);
                  onMutate?.();
                }}
              />
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Other styles</h3>
              <div className="grid gap-2">
                {getStyleEntries(node).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-2 items-center">
                    <Input readOnly value={k} />
                    <Input
                      value={v}
                      onChange={(e) => {
                        setStyleValue(node, k, e.target.value || null);
                        onMutate?.();
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Input
                  placeholder="property (e.g. borderRadius)"
                  value={newStyleKey}
                  onChange={(e) => setNewStyleKey(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder="value (e.g. 8px)"
                    value={newStyleValue}
                    onChange={(e) => setNewStyleValue(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (!newStyleKey) return;
                      setStyleValue(node, newStyleKey, newStyleValue || null);
                      setNewStyleKey("");
                      setNewStyleValue("");
                      onMutate?.();
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SidebarContent>
      )}
      <SidebarSeparator />
      <SidebarFooter>Footer</SidebarFooter>
    </Sidebar>
  );
}

function canEditText(node: Node) {
  if (node.type === "JSXElement") {
    return node.children.every((child) => child.type === "JSXText");
  } else if (node.type === "JSXText") {
    return true;
  }
  return false;
}

function getText(node: Node): string {
  if (node.type === "JSXElement") {
    return node.children
      .map((child) => {
        if (child.type === "JSXText") {
          return child.value;
        }
      })
      .join("");
  } else if (node.type === "JSXText") {
    return node.value;
  }
  return "";
}

function setText(node: Node, newText: string) {
  if (node.type === "JSXElement") {
    node.children = [
      {
        type: "JSXText",
        value: newText,
        raw: newText,
      },
    ];
    return;
  } else if (node.type === "JSXText") {
    node.value = newText;
    node.raw = newText;
    return;
  }
}

function setAttribute(node: Node, name: string, value: string | boolean | number | null) {
  if (node.type === "JSXElement") {
    if (node.openingElement.attributes.some(attribute => attribute.type === 'JSXAttribute' && attribute.name.name === name)) {
      node.openingElement.attributes = node.openingElement.attributes.map(attribute => attribute.type === 'JSXAttribute' && attribute.name.name === name ? {
        ...attribute,
        value: {
          type: 'Literal',
          value: value,
        }
      } : attribute);
    } else {
      node.openingElement.attributes.push({
        type: 'JSXAttribute',
        name: {
          type: 'JSXIdentifier',
          name: name
        },
        value: {
          type: 'Literal',
          value: value,
        }
      });
    }
  }
}

function getAttribute(node: Node, name: string) {
  if (node.type === "JSXElement") {
    for (const attribute of node.openingElement.attributes) {
      if (attribute.type === 'JSXAttribute' && attribute.name.name === name) {
        if (attribute.value?.type === 'Literal') {
          return attribute.value.value;
        }
      }
    }
  }
  return null;
}

// ----- Style attribute helpers -----
function ensureStyleAttribute(element: JSXElement) {
  const existing = element.openingElement.attributes.find(
    (a) => a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === 'style'
  );
  if (!existing) {
    element.openingElement.attributes.push({
      type: 'JSXAttribute',
      name: { type: 'JSXIdentifier', name: 'style' },
      value: {
        type: 'JSXExpressionContainer',
        expression: { type: 'ObjectExpression', properties: [] },
      },
    } as any);
  }
}

function readStyleObject(element: JSXElement): any {
  const attr = element.openingElement.attributes.find(
    (a) => a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === 'style'
  );
  if (!attr || attr.type !== 'JSXAttribute' || !attr.value) return {};
  if (attr.value.type !== 'JSXExpressionContainer') return {};
  const expr = attr.value.expression;
  if (expr.type !== 'ObjectExpression') return {};
  const out: Record<string, string> = {};
  for (const p of expr.properties) {
    if (p.type === 'Property' && p.key.type === 'Identifier' && p.value.type === 'Literal') {
      out[p.key.name] = String(p.value.value ?? '');
    }
  }
  return out;
}

function writeStyleObject(element: JSXElement, styleObj: Record<string, string>) {
  ensureStyleAttribute(element);
  element.openingElement.attributes = element.openingElement.attributes.map((a) => {
    if (a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === 'style') {
      return {
        ...a,
        value: {
          type: 'JSXExpressionContainer',
          expression: {
            type: 'ObjectExpression',
            properties: Object.entries(styleObj).map(([k, v]) => ({
              type: 'Property',
              method: false,
              shorthand: false,
              computed: false,
              key: { type: 'Identifier', name: k },
              value: { type: 'Literal', value: v },
              kind: 'init',
            })),
          },
        },
      } as any;
    }
    return a;
  });
}

function getStyleValue(node: Node, key: string): string | null {
  if (node.type !== 'JSXElement') return null;
  const obj = readStyleObject(node);
  return (obj[key] as string) ?? null;
}

function setStyleValue(node: Node, key: string, value: string | null) {
  if (node.type !== 'JSXElement') return;
  const obj = readStyleObject(node);
  if (value === null || value === '') {
    delete obj[key];
  } else {
    obj[key] = value;
  }
  writeStyleObject(node, obj);
}

function getStyleEntries(node: Node): [string, string][] {
  if (node.type !== 'JSXElement') return [];
  const obj = readStyleObject(node);
  return Object.entries(obj);
}