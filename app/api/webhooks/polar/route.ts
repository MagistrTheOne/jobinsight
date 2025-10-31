import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateSubscription, getUserByEmail, getSubscriptionByPolarCustomerId } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('Polar webhook received:', { type, data });

    // Handle different webhook events
    switch (type) {
      case 'checkout.succeeded': {
        const { customer, customer_email, subscription } = data;
        
        // Find user by email (Polar sends customer_email)
        if (!customer_email) {
          console.error('No customer_email in webhook data');
          return NextResponse.json({ error: 'Missing customer_email' }, { status: 400 });
        }

        const user = await getUserByEmail(customer_email);
        if (!user) {
          console.error('User not found for email:', customer_email);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create or update subscription to Pro
        await createOrUpdateSubscription({
          id: crypto.randomUUID(),
          userId: user.id,
          plan: 'pro',
          polarCustomerId: customer?.id || null,
          polarSubscriptionId: subscription?.id || null,
          status: 'active',
          currentPeriodStart: subscription?.current_period_start 
            ? new Date(subscription.current_period_start * 1000)
            : null,
          currentPeriodEnd: subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        });

        console.log('Subscription activated for user:', user.id);
        break;
      }

      case 'subscription.updated': {
        const { subscription, customer } = data;
        
        if (!subscription || !customer?.id) {
          return NextResponse.json({ error: 'Missing subscription or customer data' }, { status: 400 });
        }

        // Find subscription by Polar customer ID
        const existingSubscription = await getSubscriptionByPolarCustomerId(customer.id);
        
        if (existingSubscription) {
          // Update subscription
          await createOrUpdateSubscription({
            id: existingSubscription.id,
            userId: existingSubscription.userId,
            plan: 'pro',
            polarCustomerId: customer.id,
            polarSubscriptionId: subscription.id || existingSubscription.polarSubscriptionId,
            status: subscription.status === 'active' ? 'active' : 'cancelled',
            currentPeriodStart: subscription.current_period_start 
              ? new Date(subscription.current_period_start * 1000)
              : existingSubscription.currentPeriodStart,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : existingSubscription.currentPeriodEnd,
          });
          
          console.log('Subscription updated for user:', existingSubscription.userId);
        } else {
          console.warn('Subscription not found for customer:', customer.id);
        }
        break;
      }

      case 'subscription.cancelled': {
        const { subscription, customer } = data;
        
        if (!customer?.id) {
          return NextResponse.json({ error: 'Missing customer data' }, { status: 400 });
        }

        // Find subscription by Polar customer ID
        const existingSubscription = await getSubscriptionByPolarCustomerId(customer.id);
        
        if (existingSubscription) {
          // Update subscription to cancelled
          await createOrUpdateSubscription({
            id: existingSubscription.id,
            userId: existingSubscription.userId,
            plan: 'free', // Downgrade to free
            polarCustomerId: customer.id,
            polarSubscriptionId: subscription?.id || existingSubscription.polarSubscriptionId,
            status: 'cancelled',
            currentPeriodStart: existingSubscription.currentPeriodStart,
            currentPeriodEnd: subscription?.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : existingSubscription.currentPeriodEnd,
          });
          
          console.log('Subscription cancelled for user:', existingSubscription.userId);
        } else {
          console.warn('Subscription not found for customer:', customer.id);
        }
        break;
      }

      default:
        console.log('Unhandled webhook type:', type);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Polar webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for webhook verification (optional)
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Polar webhook endpoint' });
}

