import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import {
  isS3Configured,
  uploadObject,
  deleteObject,
  keyFromPublicUrl,
} from "@/lib/storage/s3";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

const BLOCKED_EXT = new Set(["exe", "bat", "cmd", "sh", "ps1", "js", "ts", "php", "py", "rb"]);

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extRaw = file.name.split(".").pop() ?? "";
    const ext = extRaw.toLowerCase() || "jpg";
    if (BLOCKED_EXT.has(ext)) {
      return NextResponse.json(
        { error: `File type .${ext} is not allowed for security.` },
        { status: 400 }
      );
    }
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const contentType = file.type || `image/${ext === "jpg" ? "jpeg" : ext}`;

    if (isS3Configured()) {
      const key = `products/${filename}`;
      const url = await uploadObject(key, buffer, contentType);
      return NextResponse.json({ url, filename: key });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}`, filename });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[upload]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  if (isS3Configured()) {
    const key = keyFromPublicUrl(url);
    if (key) await deleteObject(key);
    return NextResponse.json({ success: true });
  }

  if (url.startsWith("/uploads/")) {
    try {
      await unlink(join(process.cwd(), "public", url));
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({ success: true });
}
