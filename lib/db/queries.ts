import { db } from '../db';
import { 
  users, 
  analysisHistory, 
  subscriptions, 
  usageLimits,
  chats,
  chatMessages,
  jobPostings,
  applications,
  applicationStatusHistory,
  resumeVersions,
  emailThreads,
  emailMessages,
  automationRules,
  salaryNegotiations,
  integrations,
  type NewUser, 
  type NewAnalysisHistory,
  type NewSubscription,
  type NewUsageLimits,
  type NewChat,
  type NewChatMessage,
  type NewJobPosting,
  type NewApplication,
  type NewApplicationStatusHistory,
  type NewResumeVersion,
  type NewEmailThread,
  type NewEmailMessage,
  type NewAutomationRule,
  type NewSalaryNegotiation,
  type NewIntegration,
} from './schema';
import { eq, desc, and, or, gte, lte, sql, ilike } from 'drizzle-orm';

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
export async function getUserChats(userId: string, limit?: number) {
  let query = db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt));
  
  if (limit) {
    query = query.limit(limit) as typeof query;
  }
  
  return await query;
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

// Job Postings queries
export async function createJobPosting(jobData: NewJobPosting) {
  const [job] = await db.insert(jobPostings).values(jobData).returning();
  return job;
}

export async function getJobPostingById(id: string, userId: string) {
  const [job] = await db
    .select()
    .from(jobPostings)
    .where(
      and(
        eq(jobPostings.id, id),
        eq(jobPostings.userId, userId)
      )
    )
    .limit(1);
  return job;
}

export async function getUserJobPostings(userId: string, limit = 100) {
  return await db
    .select()
    .from(jobPostings)
    .where(eq(jobPostings.userId, userId))
    .orderBy(desc(jobPostings.createdAt))
    .limit(limit);
}

// Applications queries
export async function createApplication(applicationData: NewApplication) {
  const [application] = await db.insert(applications).values(applicationData).returning();
  
  // Создаем запись в истории статусов
  await db.insert(applicationStatusHistory).values({
    id: crypto.randomUUID(),
    applicationId: application.id,
    status: application.status,
    notes: 'Initial status',
  });
  
  return application;
}

export async function getApplicationById(id: string, userId: string) {
  const [application] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, id),
        eq(applications.userId, userId)
      )
    )
    .limit(1);
  
  if (!application) return null;
  
  // Получаем историю статусов
  const statusHistory = await db
    .select()
    .from(applicationStatusHistory)
    .where(eq(applicationStatusHistory.applicationId, id))
    .orderBy(desc(applicationStatusHistory.createdAt));
  
  // Получаем связанную вакансию, если есть
  let jobPosting = null;
  if (application.jobPostingId) {
    jobPosting = await getJobPostingById(application.jobPostingId, userId);
  }
  
  return {
    ...application,
    statusHistory,
    jobPosting,
  };
}

export async function getUserApplications(userId: string, filters?: {
  status?: string;
  company?: string;
  favorite?: boolean;
  limit?: number;
}) {
  const conditions = [eq(applications.userId, userId)];
  
  if (filters?.status) {
    conditions.push(eq(applications.status, filters.status as any));
  }
  
  if (filters?.company) {
    conditions.push(ilike(applications.company, `%${filters.company}%`));
  }
  
  if (filters?.favorite !== undefined) {
    conditions.push(eq(applications.isFavorite, filters.favorite ? 1 : 0));
  }
  
  return await db
    .select()
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.appliedDate || applications.createdAt))
    .limit(filters?.limit || 100);
}

export async function updateApplication(id: string, userId: string, updateData: Partial<NewApplication>) {
  const oldApplication = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, id),
        eq(applications.userId, userId)
      )
    )
    .limit(1);
  
  if (!oldApplication[0]) {
    throw new Error('Application not found');
  }
  
  const [updated] = await db
    .update(applications)
    .set({ ...updateData, updatedAt: new Date() })
    .where(
      and(
        eq(applications.id, id),
        eq(applications.userId, userId)
      )
    )
    .returning();
  
  // Если статус изменился, добавляем в историю
  if (updateData.status && updateData.status !== oldApplication[0].status) {
    await db.insert(applicationStatusHistory).values({
      id: crypto.randomUUID(),
      applicationId: id,
      status: updateData.status,
      notes: updateData.notes || 'Status changed',
    });
  }
  
  return updated;
}

export async function deleteApplication(id: string, userId: string) {
  await db
    .delete(applications)
    .where(
      and(
        eq(applications.id, id),
        eq(applications.userId, userId)
      )
    );
}

export async function getApplicationsNeedingFollowUp(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        lte(applications.nextFollowUp, today),
        or(
          eq(applications.status, 'applied'),
          eq(applications.status, 'viewed'),
          eq(applications.status, 'phone_screen'),
          eq(applications.status, 'interview')
        )
      )
    )
    .orderBy(applications.nextFollowUp);
}

// Application Statistics
export async function getApplicationStats(userId: string, startDate?: Date, endDate?: Date) {
  const conditions = [eq(applications.userId, userId)];
  
  if (startDate) {
    conditions.push(gte(applications.appliedDate || applications.createdAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(applications.appliedDate || applications.createdAt, endDate));
  }
  
  const stats = await db
    .select({
      status: applications.status,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(applications)
    .where(and(...conditions))
    .groupBy(applications.status);
  
  const total = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(applications)
    .where(and(...conditions));
  
  return {
    byStatus: stats,
    total: total[0]?.count || 0,
  };
}

// Resume Versions queries
export async function createResumeVersion(resumeData: NewResumeVersion) {
  // Если это дефолтное резюме, снимаем флаг с других
  if (resumeData.isDefault === 1) {
    await db
      .update(resumeVersions)
      .set({ isDefault: 0 })
      .where(
        and(
          eq(resumeVersions.userId, resumeData.userId),
          eq(resumeVersions.isDefault, 1)
        )
      );
  }
  
  const [resume] = await db.insert(resumeVersions).values(resumeData).returning();
  return resume;
}

export async function getUserResumeVersions(userId: string) {
  return await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.userId, userId))
    .orderBy(desc(resumeVersions.isDefault), desc(resumeVersions.updatedAt));
}

export async function getResumeVersionById(id: string, userId: string) {
  const [resume] = await db
    .select()
    .from(resumeVersions)
    .where(
      and(
        eq(resumeVersions.id, id),
        eq(resumeVersions.userId, userId)
      )
    )
    .limit(1);
  return resume;
}

export async function updateResumeVersion(id: string, userId: string, updateData: Partial<NewResumeVersion>) {
  // Если устанавливаем как дефолтное, снимаем флаг с других
  if (updateData.isDefault === 1) {
    await db
      .update(resumeVersions)
      .set({ isDefault: 0 })
      .where(
        and(
          eq(resumeVersions.userId, userId),
          eq(resumeVersions.isDefault, 1),
          sql`${resumeVersions.id} != ${id}`
        )
      );
  }
  
  const [updated] = await db
    .update(resumeVersions)
    .set({ ...updateData, updatedAt: new Date() })
    .where(
      and(
        eq(resumeVersions.id, id),
        eq(resumeVersions.userId, userId)
      )
    )
    .returning();
  return updated;
}

export async function deleteResumeVersion(id: string, userId: string) {
  await db
    .delete(resumeVersions)
    .where(
      and(
        eq(resumeVersions.id, id),
        eq(resumeVersions.userId, userId)
      )
    );
}

export async function getDefaultResumeVersion(userId: string) {
  const [resume] = await db
    .select()
    .from(resumeVersions)
    .where(
      and(
        eq(resumeVersions.userId, userId),
        eq(resumeVersions.isDefault, 1)
      )
    )
    .limit(1);
  return resume;
}

// Email Threads queries
export async function getUserEmailThreads(userId: string) {
  const results = await db
    .select({
      thread: emailThreads,
      application: {
        id: applications.id,
        title: applications.title,
        company: applications.company,
        status: applications.status,
      },
    })
    .from(emailThreads)
    .leftJoin(applications, eq(emailThreads.applicationId, applications.id))
    .where(eq(applications.userId, userId))
    .orderBy(desc(emailThreads.lastMessageDate));

  return results.map(r => ({
    ...r.thread,
    application: r.application,
  }));
}

export async function getThreadMessages(threadId: string, userId: string) {
  // Verify thread belongs to user
  const thread = await db
    .select()
    .from(emailThreads)
    .leftJoin(applications, eq(emailThreads.applicationId, applications.id))
    .where(and(eq(emailThreads.id, threadId), eq(applications.userId, userId)))
    .limit(1);

  if (!thread[0]) {
    return [];
  }

  return await db
    .select()
    .from(emailMessages)
    .where(eq(emailMessages.threadId, threadId))
    .orderBy(emailMessages.createdAt);
}

export async function getEmailMessage(messageId: string, userId: string) {
  const result = await db
    .select({
      message: emailMessages,
    })
    .from(emailMessages)
    .leftJoin(emailThreads, eq(emailMessages.threadId, emailThreads.id))
    .leftJoin(applications, eq(emailThreads.applicationId, applications.id))
    .where(and(eq(emailMessages.id, messageId), eq(applications.userId, userId)))
    .limit(1);
  
  return result[0]?.message || null;
}

export async function createEmailMessage(messageData: NewEmailMessage) {
  const [message] = await db.insert(emailMessages).values(messageData).returning();
  return message;
}

export async function updateEmailMessage(messageId: string, updateData: Partial<NewEmailMessage>) {
  const [updated] = await db
    .update(emailMessages)
    .set(updateData)
    .where(eq(emailMessages.id, messageId))
    .returning();
  return updated;
}

// Automation Rules queries
export async function getUserAutomationRules(userId: string) {
  return await db
    .select()
    .from(automationRules)
    .where(eq(automationRules.userId, userId))
    .orderBy(desc(automationRules.createdAt));
}

export async function createAutomationRule(ruleData: NewAutomationRule) {
  const [rule] = await db.insert(automationRules).values(ruleData).returning();
  return rule;
}

export async function updateAutomationRule(id: string, userId: string, updateData: Partial<NewAutomationRule>) {
  const [updated] = await db
    .update(automationRules)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(automationRules.id, id), eq(automationRules.userId, userId)))
    .returning();
  return updated;
}

// Salary Negotiations queries
export async function createSalaryNegotiation(negotiationData: NewSalaryNegotiation) {
  const [negotiation] = await db.insert(salaryNegotiations).values(negotiationData).returning();
  return negotiation;
}

export async function getSalaryNegotiationByApplicationId(applicationId: string, userId: string) {
  const result = await db
    .select({
      negotiation: salaryNegotiations,
    })
    .from(salaryNegotiations)
    .leftJoin(applications, eq(salaryNegotiations.applicationId, applications.id))
    .where(and(eq(salaryNegotiations.applicationId, applicationId), eq(applications.userId, userId)))
    .limit(1);
  
  return result[0]?.negotiation || null;
}

export async function updateSalaryNegotiation(id: string, userId: string, updateData: Partial<NewSalaryNegotiation>) {
  // Verify ownership
  const negotiation = await db
    .select()
    .from(salaryNegotiations)
    .leftJoin(applications, eq(salaryNegotiations.applicationId, applications.id))
    .where(and(eq(salaryNegotiations.id, id), eq(applications.userId, userId)))
    .limit(1);

  if (!negotiation[0]) {
    throw new Error('Negotiation not found');
  }

  const [updated] = await db
    .update(salaryNegotiations)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(salaryNegotiations.id, id))
    .returning();
  return updated;
}

