import "server-only";

import { NextResponse } from "next/server";
import { readDevSelection, writeDevSelection } from "./dev-selection-store";
import type { DevSelectionRecord } from "../lib/devtools/dev-selection";

export const dynamic = "force-dynamic";

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return notFound();
  }

  const record = await readDevSelection();
  if (!record) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({
    ...record,
    elements: record.elements?.length ? record.elements : [record.element],
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return notFound();
  }

  try {
    const payload = (await request.json()) as DevSelectionRecord;
    const elements = payload.elements?.length ? payload.elements : [payload.element];
    const record: DevSelectionRecord = {
      version: 1,
      capturedAt: payload.capturedAt,
      page: payload.page,
      session: payload.session ?? {
        id: "legacy-session",
        label: "Session 1",
        index: 1,
        updatedAt: payload.capturedAt,
      },
      element: elements[elements.length - 1],
      elements,
    };

    await writeDevSelection(record);
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Invalid selection payload" }, { status: 400 });
  }
}
