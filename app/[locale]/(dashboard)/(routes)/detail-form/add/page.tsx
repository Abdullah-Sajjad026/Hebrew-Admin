"use client";

import React, { useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase-config";
import { useI18n } from "@/internationalization/client";
import { useRouter } from "next/navigation";
import { NavLink } from "@/components/ui/nav-link";
import { Check, Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";

export default function Page() {
  const t = useI18n();
  const router = useRouter();
  const [fields, setFields] = React.useState<filed[] | null>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [newFieldName, setNewFieldName] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(firestore, "appconfig", "detail-form"),
      (doc) => {
        if (doc.exists()) {
          console.log("Document data:", doc.data());

          const filteredData = doc.data()?.fields;

          setFields(filteredData);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleChange = (value: string, name: string) => {
    // handle if the user changes from required to optional or vice versa
    const newFields = fields?.map((field) => {
      if (field.name === name) {
        if (value === "Required") {
          return { ...field, value: true };
        } else {
          return { ...field, value: false };
        }
      } else {
        return field;
      }
    });
    setFields(newFields as filed[]);
  };
  const onClose = () => setIsOpen(false); // close the alert dialog

  const onConfirm = () => {
    // first check if the field name is already exist or not then add it to the fields array
    const isExist = fields?.find((field) => field.name === newFieldName);
    if (isExist) {
      toast.error("Field Already Exist");
    } else {
      const newFields = [
        ...(fields as filed[]),
        { name: newFieldName, value: false },
      ];
      setFields(newFields);
    }
  };
  const onSubmit = async () => {
    // upload the fields to the firebase
    let loadingToastId = toast.loading("Adding Links...");
    setIsUploading(true);
    const DetailFormDoc = doc(firestore, "appconfig", "detail-form");

    try {
      updateDoc(DetailFormDoc, {
        fields: fields,
      });
      toast.success("field Added Successfully");
      toast.dismiss(loadingToastId);
      setIsUploading(false);
      router.back();
    } catch (e) {
      toast.error("Something went wrong");
      toast.dismiss(loadingToastId);
      setIsUploading(false);
      console.log(e);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 ">
        <span className="font-md text-md">
          {t("pages.detailForm.formTitle")} :
        </span>
        <button
          className={buttonVariants()}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {t("pages.detailForm.AddField")}
          <Plus className="mr-2" size={16} />
        </button>
      </div>
      <div className="mt-6 flex flex-row flex-wrap gap-10">
        {fields?.map((field, index) => {
          return (
            <div className="flex flex-row items-center " key={index}>
              <span className="font-md text-md">{field.name} :</span>
              <div className="space-y-2 mr-4">
                <Select
                  onValueChange={(value) => {
                    handleChange(value, field.name);
                  }}
                  defaultValue={field.value === true ? "Required" : "Optional"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Required">
                      {t("pages.detailForm.required")}
                    </SelectItem>
                    <SelectItem value="Optional">
                      {t("pages.detailForm.optional")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-5 w-[95%]">
        <div className="mt-4 flex justify-between">
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
            Cancel
            {}
          </Button>

          <Button
            size={"lg"}
            onClick={() => {
              onSubmit();
            }}
            disabled={isUploading}
          >
            <Check className="w-5 h-5 ml-1" />
            
            {t('actions.approve')}
          </Button>
        </div>
      </div>
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pages.detailForm.AddNewField")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-row items-center">
                <span className="font-md text-md ml-2">
                  {t("pages.detailForm.fieldName")} :
                </span>
                <Input
                  type="text"
                  onChange={(e) => {
                    setNewFieldName(e.target.value);
                  }}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>
              {t("actions.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
