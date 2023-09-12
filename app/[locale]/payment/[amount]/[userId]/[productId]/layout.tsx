"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "@/constants/env";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createPaymentIntent } from "@/lib/payments/stripe";
import { Loader } from "@/components/ui/loader";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase-config";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
    amount: string;
    userId: string;
    productId: string;
  };
}) {
  const router = useRouter();

  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<
    string | null
  >(null);

  useEffect(() => {
    // if amount/userId/productId doesn't exist, redirect to home page
    if (!params.amount || !params.userId || !params.productId) {
      toast.error("Invalid payment link");

      router.push(`/${params.locale}`);
      return;
    }

    // if amount/userId/productId exist, get payment intent client secret

    (async () => {
      // validating userId in firebase
      const user = await getDoc(doc(firestore, "users", params.userId));
      if (!user.exists()) {
        toast.error("Invalid User");
        router.push(`/${params.locale}`);
        return;
      }

      // validating productId in firebase
      const product = await getDoc(
        doc(firestore, "consultation", params.productId)
      );
      if (!product.exists() || product.data().fileType === "free") {
        toast.error("Invalid Product");
        router.push(`/${params.locale}`);
        return;
      }

      if (!paymentIntentClientSecret) {
        const { client_secret } = await createPaymentIntent(
          Number(params.amount)
        );
        setPaymentIntentClientSecret(client_secret);
      }
    })();
  }, [
    params.amount,
    params.locale,
    params.productId,
    params.userId,
    paymentIntentClientSecret,
    router,
  ]);

  return !stripePromise || !paymentIntentClientSecret ? (
    <Loader />
  ) : (
    <Elements
      options={{
        clientSecret: paymentIntentClientSecret,
      }}
      stripe={stripePromise}
    >
      {children}
    </Elements>
  );
}
