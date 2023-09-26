"use client";

import React, { useEffect } from "react";

import { useI18n } from "@/internationalization/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useRequestForm from "../components/use-request-form";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase-config";

function Page() {
  const t = useI18n();
  const router = useRouter();

  const { editingDoc } = useRequestForm();
  const [incomingDoc, setIncomingDoc] = React.useState<RequestsData | null>(
    null
  );
  const [isUploading, setIsUploading] = React.useState(false);

  useEffect(() => {
    if (editingDoc) {
      setIncomingDoc(editingDoc);
    } else {
      toast.error("Not Found");
      router.back();
    }
  }, [editingDoc]);

  const handleSubmit = async (id: string) => {
    const loadingToastId = toast.loading("Approving...");

    setIsUploading(true);

    const requestRef = doc(firestore, "requests", id); // gets the request doc
    try {
      // updates the request doc
      await updateDoc(requestRef, {
        approve: true,
        updatedAt: serverTimestamp(),
      });
      toast.dismiss(loadingToastId);
      toast.success("Request approved successfully");
      router.back();
    } catch (error) {
      // logs the error if error occurs
      console.log(error);
      toast.dismiss(loadingToastId);
      toast.error("Error approving request");
    }
  };
  return (
    <div className="flex flex-col justify-between gap-3">
      <div className="space-y-8 ">
        <div className="flex justify-between">
          <Label>{t("pages.requests.formTitle")}</Label>
        </div>
        <div className="mt-18">
          {incomingDoc &&
            incomingDoc.fields &&
            Object.entries(incomingDoc.fields).map(([key, value]) => (
              <div className="flex gap-2 mt-4 w-full" key={key}>
                <Label className="basis-36 text-base whitespace-nowrap font-medium">
                  {key}:
                </Label>
                <p className="text-base">{value}</p>
              </div>
            ))}
        </div>
      </div>
      <footer className="flex justify-between ">
        <Button
          size={"lg"}
          variant="outline"
          type="reset"
          className="mx-4"
          disabled={isUploading}
          onClick={() => {
            router.back();
          }}
        >
          <X className="w-5 h-5 ml-1" />
          {t("actions.back")}
        </Button>
        {!incomingDoc?.approve && (
          <Button
            size={"lg"}
            onClick={() => {
              handleSubmit(incomingDoc?.id as string);
            }}
            disabled={isUploading}
          >
            <Check className="w-5 h-5 ml-1" />
            {t("actions.approve")}
          </Button>
        )}
      </footer>
    </div>
  );
}

export default Page;
