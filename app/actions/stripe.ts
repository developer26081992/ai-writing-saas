"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

const PLAN_PRICE_IDS: Record<Plan, string | undefined> = {
  FREE: undefined,
  PRO: process.env.STRIPE_PRO_PRICE_ID,
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

export async function createCheckoutSession(
  organisationId: string,
  plan: Plan
) {
  if (plan === Plan.FREE) {
    return {
      success: false,
      message: "The FREE plan does not require a subscription.",
    };
  }

  const priceId = PLAN_PRICE_IDS[plan];

  if (!priceId) {
    return {
      success: false,
      message: `Stripe price ID for ${plan} is not configured.`,
    };
  }

  const organisation = await prisma.organisation.findUnique({
    where: {
      id: organisationId,
    },
    include: {
      subscription: true,
    },
  });

  if (!organisation) {
    return {
      success: false,
      message: "Organisation not found.",
    };
  }

  let customerId = organisation.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: organisation.name,
      metadata: {
        organisationId,
      },
    });

    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url:
      `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancel_url:
      `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    metadata: {
      organisationId,
      plan,
    },
  });

  return {
    success: true,
    url: session.url,
  };
}