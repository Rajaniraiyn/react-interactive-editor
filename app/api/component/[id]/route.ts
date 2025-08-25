import { NextResponse } from "next/server";
import { updateComponent } from "@/lib/store";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
    const updated = await updateComponent(id, value);
    if (!updated) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({ id, value });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Error" },
      { status: 500 },
    );
  }
}
