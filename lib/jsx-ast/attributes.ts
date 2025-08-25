import type { JSXElement, Node } from "estree-jsx";

export function setAttribute(
    node: Node,
    name: string,
    value: string | boolean | number | null,
) {
    if (node.type === "JSXElement") {
        if (
            node.openingElement.attributes.some(
                (attribute) =>
                    attribute.type === "JSXAttribute" && (attribute.name as any).name === name,
            )
        ) {
            node.openingElement.attributes = node.openingElement.attributes.map((attribute) =>
                attribute.type === "JSXAttribute" && (attribute.name as any).name === name
                    ? {
                        ...(attribute as any),
                        value: {
                            type: "Literal",
                            value: value as any,
                        },
                    }
                    : attribute,
            );
        } else {
            node.openingElement.attributes.push({
                type: "JSXAttribute",
                name: {
                    type: "JSXIdentifier",
                    name: name,
                } as any,
                value: {
                    type: "Literal",
                    value: value as any,
                },
            } as any);
        }
    }
}

export function getAttribute(node: Node, name: string) {
    if (node.type === "JSXElement") {
        for (const attribute of node.openingElement.attributes) {
            if (attribute.type === "JSXAttribute" && (attribute.name as any).name === name) {
                if ((attribute as any).value?.type === "Literal") {
                    return (attribute as any).value.value;
                }
            }
        }
    }
    return null;
}

// ----- Style attribute helpers -----
export function ensureStyleAttribute(element: JSXElement) {
    const existing = element.openingElement.attributes.find(
        (a) => a.type === "JSXAttribute" && (a.name as any).type === "JSXIdentifier" && (a.name as any).name === "style",
    );
    if (!existing) {
        element.openingElement.attributes.push({
            type: "JSXAttribute",
            name: { type: "JSXIdentifier", name: "style" } as any,
            value: {
                type: "JSXExpressionContainer",
                expression: { type: "ObjectExpression", properties: [] } as any,
            } as any,
        } as any);
    }
}


