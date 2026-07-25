import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

/** Prefer S3_* names — Netlify reserves AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION */
const endpoint =
  process.env.S3_ENDPOINT_URL || process.env.AWS_ENDPOINT_URL_S3;
const accessKeyId =
  process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const region =
  process.env.S3_REGION || process.env.AWS_REGION || "auto";
export const S3_BUCKET = process.env.S3_BUCKET || "uploads";

export const isS3Configured = () =>
  !!(endpoint && accessKeyId && secretAccessKey);

let client: S3Client | null = null;
let bucketReady: Promise<void> | null = null;

export function getS3Client(): S3Client {
  if (!isS3Configured()) {
    throw new Error("S3 storage is not configured");
  }
  if (!client) {
    client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

/** Ensure bucket exists (Neon Object Storage) */
export async function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const s3 = getS3Client();
      try {
        await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
      } catch {
        try {
          await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
        } catch (err) {
          // Bucket may already exist or be auto-provisioned
          console.warn("[S3] CreateBucket:", err instanceof Error ? err.message : err);
        }
      }
    })();
  }
  await bucketReady;
}

export function publicObjectUrl(key: string): string {
  // Path-style public URL for Neon S3-compatible storage
  return `${endpoint!.replace(/\/$/, "")}/${S3_BUCKET}/${key}`;
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await ensureBucket();
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return publicObjectUrl(key);
}

export async function deleteObject(key: string): Promise<void> {
  if (!isS3Configured()) return;
  const s3 = getS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );
}

export function keyFromPublicUrl(url: string): string | null {
  if (!endpoint) return null;
  const prefix = `${endpoint.replace(/\/$/, "")}/${S3_BUCKET}/`;
  if (url.startsWith(prefix)) return url.slice(prefix.length);
  // Also accept path after bucket name
  const marker = `/${S3_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx >= 0) return url.slice(idx + marker.length);
  return null;
}
