import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

function loadEnvFile(filename) {
  const fullPath = path.join(projectRoot, filename);
  if (!existsSync(fullPath)) return;

  const raw = readFileSync(fullPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function walk(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath, relativePath)));
    } else if (entry.isFile()) {
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const bucket = (process.env.SUPABASE_PUBLIC_ASSETS_BUCKET || process.env.NEXT_PUBLIC_PUBLIC_ASSETS_BUCKET || "landing-page").trim();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

if (!existsSync(publicDir)) {
  throw new Error(`Public directory not found: ${publicDir}`);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

try {
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
  if (bucketError && bucketError.message.toLowerCase().includes("not found")) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: "10MB"
    });
    if (createError) throw createError;
  } else if (bucketError) {
    throw bucketError;
  } else if (bucketData && !bucketData.public) {
    console.warn(`Bucket "${bucket}" exists but is not public.`);
  }
} catch (error) {
  throw new Error(`Bucket check/create failed: ${error instanceof Error ? error.message : String(error)}`);
}

const files = await walk(publicDir);
if (files.length === 0) {
  console.log("No files found in public/.");
  process.exit(0);
}

for (const file of files) {
  const content = await readFile(file.fullPath);
  const extension = path.extname(file.relativePath).toLowerCase();
  const contentType =
    extension === ".png" ? "image/png" :
    extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" :
    extension === ".svg" ? "image/svg+xml" :
    extension === ".webp" ? "image/webp" :
    extension === ".gif" ? "image/gif" :
    extension === ".ico" ? "image/x-icon" :
    "application/octet-stream";

  const { error } = await supabase.storage.from(bucket).upload(file.relativePath, content, {
    upsert: true,
    contentType,
    cacheControl: "3600"
  });

  if (error) {
    throw new Error(`Upload failed for ${file.relativePath}: ${error.message}`);
  }

  console.log(`Uploaded ${file.relativePath}`);
}

console.log("");
console.log("Public assets uploaded successfully.");
console.log(`Bucket: ${bucket}`);
console.log(`Suggested NEXT_PUBLIC_PUBLIC_ASSETS_BUCKET=${bucket}`);
console.log(`Optional NEXT_PUBLIC_ASSET_BASE_URL=${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}`);
