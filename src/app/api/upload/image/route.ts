import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authorization = request.headers.get("Authorization") || "";

    const response = await fetch(`${BACKEND_URL}/api/upload/image`, {
      method: "POST",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result?.message || "Upload failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[upload/image]", err);
    return NextResponse.json(
      { success: false, error: "Server error during upload" },
      { status: 500 }
    );
  }
}
