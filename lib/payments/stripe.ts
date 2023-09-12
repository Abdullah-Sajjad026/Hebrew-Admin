// this file is going to be used as backend for stripe

import Stripe from "stripe";

import { STRIPE_SECRET_KEY } from "@/constants/env";

// implementing in a good way to avoid multiple instances of stripe. Singleton pattern

let stripe: Stripe;

const getStripeInstance = () => {
  if (!stripe) {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
      typescript: true,
    });
  }

  return stripe;
};

/**

 * Create a payment intent

 * @param amount Amount in dollars

 * @returns

 */

const createPaymentIntent = async (dollars: number) => {
  // converting amount to cents
  const amount = dollars * 100;

  // get stripe instance
  const stripe = getStripeInstance();

  // create payment intent with amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // return client secret
  return { client_secret: paymentIntent.client_secret };
};

export { createPaymentIntent };
