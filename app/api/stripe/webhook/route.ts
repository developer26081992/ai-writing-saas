import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Plan, SubscriptionStatus } from "@prisma/client";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", {
      status: 400,
    });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return new Response("Invalid webhook signature", {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const organisationId = session.metadata?.organisationId;
        const plan = session.metadata?.plan as Plan | undefined;

        if (!organisationId || !plan) {
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await syncSubscription(
          organisationId,
          session.customer as string,
          subscription
        );

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription =
          event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const existing =
          await prisma.subscription.findUnique({
            where: {
              stripeCustomerId: customerId,
            },
          });

        if (existing) {
          await syncSubscription(
            existing.organisationId,
            customerId,
            subscription
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription =
          event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const existing =
          await prisma.subscription.findUnique({
            where: {
              stripeCustomerId: customerId,
            },
          });

        if (existing) {
          await prisma.subscription.update({
            where: {
              id: existing.id,
            },
            data: {
              status: SubscriptionStatus.CANCELED,
              plan: Plan.FREE,
              stripeSubscriptionId: null,
              cancelAtPeriodEnd: false,
            },
          });

          await prisma.organisation.update({
            where: {
              id: existing.organisationId,
            },
            data: {
              plan: Plan.FREE,
            },
          });
        }

        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return new Response("Webhook processing failed", {
      status: 500,
    });
  }
}

async function syncSubscription(
  organisationId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;

  const plan = getPlanFromPriceId(priceId);

  const status = mapStripeStatus(subscription.status);

  await prisma.subscription.upsert({
    where: {
      organisationId,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status,
      plan,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(
        subscription.items.data[0].current_period_start * 1000
      ),
      currentPeriodEnd: new Date(
        subscription.items.data[0].current_period_end * 1000
      ),
    },
    create: {
      organisationId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status,
      plan,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(
        subscription.items.data[0].current_period_start * 1000
      ),
      currentPeriodEnd: new Date(
        subscription.items.data[0].current_period_end * 1000
      ),
    },
  });

  await prisma.organisation.update({
    where: {
      id: organisationId,
    },
    data: {
      plan,
    },
  });
}

function getPlanFromPriceId(priceId: string | undefined): Plan {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return Plan.PRO;
  }

  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    return Plan.ENTERPRISE;
  }

  return Plan.FREE;
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;

    case "trialing":
      return SubscriptionStatus.TRIALING;

    case "past_due":
      return SubscriptionStatus.PAST_DUE;

    case "canceled":
      return SubscriptionStatus.CANCELED;

    case "incomplete":
      return SubscriptionStatus.INCOMPLETE;

    case "unpaid":
      return SubscriptionStatus.UNPAID;

    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}