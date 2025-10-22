"use server";

import { asc } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";

// Get projects via Drizzle ORM
export async function getProjects() {
  const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.createdAt));
  return rows;
}
