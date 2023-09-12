"use client";

import React from "react";
import toast from "react-hot-toast";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  FieldValue,
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase-config";

export default function Page({
  params,
}: {
  params: {
    locale: string;
    amount: string;
    userId: string;
    productId: string;
  };
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentState, setPaymentState] = React.useState<
    "idle" | "processing" | "success" | "erred"
  >("idle");

  /**
   * Handle payment submission
   */
  const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (paymentState === "processing" || !stripe || !elements) {
      toast.error(
        "Payment is already in progress or it is not possible to pay at the moment. Please try again later."
      );
      return;
    }

    setPaymentState("processing");
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentState("erred");
        toast.error(error.message! || "Something went wrong");

        // don't know why I am adding an extra try catch here
        try {
          await addDoc(collection(firestore, "transactions"), {
            paymentIntent: paymentIntent,
            status: "failed",
            userId: params.userId,
            productId: params.productId,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.log("Error adding transaction to firestore: ", err);
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentState("success");
        toast.success("Payment successful");

        // here too
        try {
          await addDoc(collection(firestore, "transactions"), {
            paymentIntent: paymentIntent,
            amount: paymentIntent.amount,
            userId: params.userId,
            productId: params.productId,
            createdAt: paymentIntent.created,
            status: "success",
          });
        } catch (err) {
          console.log("Error adding transaction to firestore: ", err);
        }
      }
    } catch (error: any) {
      console.log(error);
      setPaymentState("erred");
      toast.error(error?.message || "Something went wrong");

      try {
        await addDoc(collection(firestore, "transactions"), {
          paymentIntent: null,
          status: "failed",
          amount: Number(params.amount),
          userId: params.userId,
          productId: params.productId,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.log("Error adding transaction to firestore: ", err);
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      {paymentState === "success" ? (
        <div className="max-w-lg mx-auto my-8">
          <h1 className="text-3xl text-center">Payment successful</h1>
        </div>
      ) : paymentState === "erred" ? (
        <div className="max-w-lg mx-auto my-8">
          <h1 className="text-3xl text-center">Payment failed</h1>
        </div>
      ) : (
        <form onSubmit={handlePayment} className="max-w-lg mx-auto my-8">
          <PaymentElement />
          <Button
            type="submit"
            className="mt-3"
            disabled={!stripe || !elements}
          >
            Pay
          </Button>
        </form>
      )}
    </div>
  );
}
