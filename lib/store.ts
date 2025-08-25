import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const STORE_PATH = path.join(process.cwd(), ".components.json");

type ComponentMap = Record<string, string>;

async function readStore(): Promise<ComponentMap> {
  try {
    const data = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(data) as ComponentMap;
  } catch (error: any) {
    if (error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function writeStore(map: ComponentMap): Promise<void> {
  const data = JSON.stringify(map, null, 2);
  await fs.writeFile(STORE_PATH, data, "utf8");
}

export async function createComponent(value: string): Promise<string> {
  const id = randomUUID();
  const map = await readStore();
  map[id] = value;
  await writeStore(map);
  return id;
}

export async function getComponent(id: string): Promise<string | undefined> {
  const map = await readStore();
  return map[id];
}

export async function updateComponent(
  id: string,
  value: string,
): Promise<boolean> {
  const map = await readStore();
  if (!(id in map)) {
    return false;
  }
  map[id] = value;
  await writeStore(map);
  return true;
}
