import { NextResponse } from "next/server";
import { createComponent } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let value = "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      value = typeof body === "string" ? body : (body?.value ?? "");
    } else {
      value = await request.text();
    }
    if (!value || typeof value !== "string") {
      return NextResponse.json(
        { error: "Missing string body" },
        { status: 400 },
      );
    }
    const id = await createComponent(value);
    return NextResponse.json({ id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Error" },
      { status: 500 },
    );
  }
}
