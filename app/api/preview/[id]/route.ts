import { NextResponse } from "next/server";
import { getComponent } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const value = await getComponent(id);
  if (typeof value === "undefined") {
    return new NextResponse("Not Found", { status: 404 });
  }
  return new NextResponse(value, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
