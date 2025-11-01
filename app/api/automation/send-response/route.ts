import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmailMessage, createEmailMessage, updateEmailMessage } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, threadId, responseText } = await request.json();

    // Get original message
    const originalMessage = await getEmailMessage(messageId, session.user.id);
    if (!originalMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // TODO: Integrate with email sending API (Gmail API, etc.)
    // For now, we'll just create a record of the sent message
    
    // Create sent message record
    await createEmailMessage({
      id: crypto.randomUUID(),
      threadId,
      messageId: `sent-${Date.now()}`,
      fromEmail: originalMessage.toEmail,
      toEmail: originalMessage.fromEmail,
      subject: `Re: ${originalMessage.subject}`,
      body: responseText,
      isIncoming: 0,
      isAutomated: 1,
    });

    // Mark original message as responded
    await updateEmailMessage(messageId, {
      needsResponse: 0,
      respondedAt: new Date(),
    });

    // TODO: Actually send email via API
    // await sendEmailViaAPI({
    //   to: originalMessage.fromEmail,
    //   subject: `Re: ${originalMessage.subject}`,
    //   body: responseText,
    // });

    return NextResponse.json({
      success: true,
      message: 'Response sent successfully (simulated - integrate email API)',
    });
  } catch (error: any) {
    console.error('Error sending response:', error);
    return NextResponse.json(
      { error: 'Failed to send response', message: error.message },
      { status: 500 }
    );
  }
}

