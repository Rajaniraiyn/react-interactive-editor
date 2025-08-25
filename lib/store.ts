import { randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY_PREFIX = "component:";

export async function createComponent(value: string): Promise<string> {
  const id = randomUUID();
  await redis.set(KEY_PREFIX + id, value);
  return id;
}

export async function getComponent(id: string): Promise<string | undefined> {
  const value = await redis.get<string>(KEY_PREFIX + id);
  return value ?? undefined;
}

export async function updateComponent(
  id: string,
  value: string,
): Promise<boolean> {
  const key = KEY_PREFIX + id;
  const exists = (await redis.exists(key)) === 1;
  if (!exists) return false;
  await redis.set(key, value);
  return true;
}
