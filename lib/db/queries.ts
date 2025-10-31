import { db } from '../db';
import { 
  users, 
  analysisHistory, 
  subscriptions, 
  usageLimits,
  chats,
  chatMessages,
  type NewUser, 
  type NewAnalysisHistory,
  type NewSubscription,
  type NewUsageLimits,
  type NewChat,
  type NewChatMessage,
} from './schema';
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

// Subscription queries
export async function getUserSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return subscription;
}

export async function getSubscriptionByPolarCustomerId(polarCustomerId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.polarCustomerId, polarCustomerId))
    .limit(1);
  return subscription;
}

export async function createOrUpdateSubscription(subscriptionData: NewSubscription) {
  const existing = await getUserSubscription(subscriptionData.userId);
  
  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(subscriptions.userId, subscriptionData.userId))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();
    return created;
  }
}

// Usage limits queries
export async function getUsageLimits(userId: string, periodStart: Date) {
  const [limits] = await db
    .select()
    .from(usageLimits)
    .where(
      and(
        eq(usageLimits.userId, userId),
        eq(usageLimits.periodStart, periodStart)
      )
    )
    .limit(1);
  return limits;
}

export async function createOrGetUsageLimits(userId: string, periodStart: Date) {
  let limits = await getUsageLimits(userId, periodStart);
  
  if (!limits) {
    const [created] = await db
      .insert(usageLimits)
      .values({
        id: crypto.randomUUID(),
        userId,
        periodStart,
        resumeCount: 0,
        jobCount: 0,
        coverLetterCount: 0,
      })
      .returning();
    return created;
  }
  
  return limits;
}

export async function incrementUsageLimit(
  userId: string, 
  type: 'resume' | 'job' | 'coverLetter',
  periodStart: Date
) {
  // Ensure limits record exists
  const current = await createOrGetUsageLimits(userId, periodStart);
  
  const updateData: any = {
    updatedAt: new Date(),
  };
  
  if (type === 'resume') {
    updateData.resumeCount = current.resumeCount + 1;
  } else if (type === 'job') {
    updateData.jobCount = current.jobCount + 1;
  } else {
    updateData.coverLetterCount = current.coverLetterCount + 1;
  }
  
  const [updated] = await db
    .update(usageLimits)
    .set(updateData)
    .where(
      and(
        eq(usageLimits.userId, userId),
        eq(usageLimits.periodStart, periodStart)
      )
    )
    .returning();
  
  return updated;
}

export async function resetUsageLimits(userId: string, newPeriodStart: Date) {
  // Create new period record
  await createOrGetUsageLimits(userId, newPeriodStart);
  
  // Old records will be kept for historical purposes
  // Monthly reset is done by creating a new period record
}

// Chat queries
export async function getUserChats(userId: string) {
  return await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt));
}

export async function getChatById(chatId: string, userId: string) {
  // Verify chat belongs to user
  const [chat] = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.id, chatId),
        eq(chats.userId, userId)
      )
    )
    .limit(1);

  if (!chat) {
    return null;
  }

  // Get messages for this chat
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(chatMessages.createdAt);

  return {
    ...chat,
    messages,
  };
}

export async function createChat(userId: string, title: string) {
  const [chat] = await db
    .insert(chats)
    .values({
      id: crypto.randomUUID(),
      userId,
      title,
    })
    .returning();
  return chat;
}

export async function addChatMessage(chatId: string, role: 'user' | 'assistant' | 'system', content: string) {
  const [message] = await db
    .insert(chatMessages)
    .values({
      id: crypto.randomUUID(),
      chatId,
      role,
      content,
    })
    .returning();
  
  // Update chat's updatedAt timestamp
  await db
    .update(chats)
    .set({ updatedAt: new Date() })
    .where(eq(chats.id, chatId));

  return message;
}

export async function deleteChat(chatId: string, userId: string) {
  // Verify ownership and delete (cascade will delete messages)
  await db
    .delete(chats)
    .where(
      and(
        eq(chats.id, chatId),
        eq(chats.userId, userId)
      )
    );
}

export async function updateChatTitle(chatId: string, title: string) {
  const [updated] = await db
    .update(chats)
    .set({ title, updatedAt: new Date() })
    .where(eq(chats.id, chatId))
    .returning();
  return updated;
}

