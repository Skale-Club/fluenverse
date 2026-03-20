import fs from "fs";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env.local");

export function readRuntimeConfig() {
  if (!fs.existsSync(ENV_PATH)) {
    return {};
  }

  const content = fs.readFileSync(ENV_PATH, "utf-8");
  const lines = content.split("\n");
  const config: Record<string, string> = {};

  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) {
      continue;
    }

    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    config[match[1]] = value.trim();
  }

  return config;
}
