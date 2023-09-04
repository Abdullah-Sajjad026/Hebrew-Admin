"use client";

// Importing necessary packages and components
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { fireStorage, firestore } from "@/lib/firebase/firebase-config";
import { useI18n } from "@/internationalization/client";

import SubcategoryContentForm, {
  SubcategoryContentFormState,
} from "../components/subcategory-content-form";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import useSubcategoryContentForm from "../hooks/use-subcategory-content-form";

// Defining the Page component
export default function Page({
  params,
}: {
  params: { subcategoryId: string };
}) {
  // Initializing necessary variables and hooks

  const t = useI18n();
  const router = useRouter();
  const subcategoryId = params.subcategoryId;

  const { editingDoc } = useSubcategoryContentForm();

  const [isUploading, setIsUploading] = React.useState(false);

  // Validating if the subcategory and content exist
  React.useEffect(() => {
    // validating if the subcategory exists
    const subcategoryRef = doc(firestore, "subcategories", subcategoryId);

    getDoc(subcategoryRef)
      .then((doc) => {
        if (!doc.exists()) {
          console.log("No such document!");
          toast.error("Subcategory not found");
          router.push("/404");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
        toast.error("Error getting subcategory");
        router.push("/404");
      });

    // validating if the content exists
    const contentRef = doc(firestore, "category-content", editingDoc?.id!);

    getDoc(contentRef)
      .then((doc) => {
        if (!doc.exists()) {
          console.log("No such document!");
          toast.error("Content not found");
          router.push("/404");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
        toast.error("Error getting content");
        router.push("/404");
      });
  }, [subcategoryId, router, editingDoc?.id]);

  // Function to handle form submission on update
  const onUpdate = async (values: SubcategoryContentFormState) => {
    const loadingToastId = toast.loading("Updating content ...");
    setIsUploading(true);

    const studyDoc = doc(firestore, "category-content", editingDoc?.id!);
    const coverImgRef = ref(
      fireStorage,
      `category-content/${editingDoc?.id}-image`
    );
    const pdfRef = ref(fireStorage, `category-content/${editingDoc?.id}-pdf`);

    try {
      let newCoverSrc, newPdfSrc;

      // Uploading cover image if provided
      if (values.coverImage) {
        try {
          await uploadBytes(coverImgRef, values.coverImage);
          newCoverSrc = await getDownloadURL(coverImgRef);
        } catch (error) {
          console.log({ error });

          toast.dismiss(loadingToastId);
          toast.error("Error uploading cover image");
          return;
        }
      }

      // Uploading PDF if provided
      if (values.pdf) {
        try {
          await uploadBytes(pdfRef, values.pdf);
          newPdfSrc = await getDownloadURL(pdfRef);
        } catch (error) {
          console.log({ error });

          toast.dismiss(loadingToastId);
          toast.error("Error uploading pdf");
          return;
        }
      }

      // Updating the document with new values
      const updatedDoc = {
        name: values.fileName,
        coverImage: newCoverSrc || editingDoc?.coverImage,
        pdf: newPdfSrc || editingDoc?.pdf,
        studyContent: values.studyContent,
        timeToRead: values.timeToRead,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(studyDoc, updatedDoc);

      // Displaying success message and navigating back
      toast.dismiss(loadingToastId);
      toast.success("Updated Successfully");
      router.back();
    } catch (error) {
      console.log({ error });

      // Displaying error message
      toast.dismiss(loadingToastId);
      toast.error("There was an error updating the content");
    }
  };

  // Rendering the SubcategoryContentForm component with necessary props
  return (
    <SubcategoryContentForm
      action="update"
      onSubmit={onUpdate}
      initialValues={{
        action: "update",
        fileName: editingDoc?.name,
        coverImageSrc: editingDoc?.coverImage,
        pdfSrc: editingDoc?.pdf,
        studyContent: editingDoc?.studyContent,
        timeToRead: editingDoc?.timeToRead,
      }}
      footer={
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
            {t("actions.cancel")}
          </Button>

          <Button size={"lg"} type="submit" disabled={isUploading}>
            <Check className="w-5 h-5 ml-1" />
            {t("actions.save")}
          </Button>
        </div>
      }
    />
  );
}
