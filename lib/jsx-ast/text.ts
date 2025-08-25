import type { Node } from "estree-jsx";

export function canEditText(node: Node) {
    if (node.type === "JSXElement") {
        return node.children.every((child) => child.type === "JSXText");
    } else if (node.type === "JSXText") {
        return true;
    }
    return false;
}

export function getText(node: Node): string {
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

export function setText(node: Node, newText: string) {
    if (node.type === "JSXElement") {
        node.children = [
            {
                type: "JSXText",
                value: newText,
                raw: newText,
            } as any,
        ];
        return;
    } else if (node.type === "JSXText") {
        node.value = newText as any;
        (node as any).raw = newText;
        return;
    }
}


