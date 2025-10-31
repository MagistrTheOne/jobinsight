import { db } from '../db';
import { users, analysisHistory, type NewUser, type NewAnalysisHistory } from './schema';
import { eq, desc, and } from 'drizzle-orm';

// User queries
export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function createUser(userData: NewUser) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function updateUser(id: string, userData: Partial<NewUser>) {
  const [user] = await db
    .update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

// Analysis history queries
export async function getAnalysisHistory(userId: string, limit = 50) {
  return await db
    .select()
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId))
    .orderBy(desc(analysisHistory.createdAt))
    .limit(limit);
}

export async function createAnalysisHistory(historyData: NewAnalysisHistory) {
  const [history] = await db.insert(analysisHistory).values(historyData).returning();
  return history;
}

export async function deleteAnalysisHistory(id: string, userId: string) {
  await db
    .delete(analysisHistory)
    .where(
      and(
        eq(analysisHistory.id, id),
        eq(analysisHistory.userId, userId)
      )
    );
}

export async function getAnalysisById(id: string, userId: string) {
  const [analysis] = await db
    .select()
    .from(analysisHistory)
    .where(
      and(
        eq(analysisHistory.id, id),
        eq(analysisHistory.userId, userId)
      )
    )
    .limit(1);
  return analysis;
}

