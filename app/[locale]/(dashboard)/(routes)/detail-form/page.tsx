"use client";
import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ListItem } from "@/components/ui/list-item";
import { NavLink } from "@/components/ui/nav-link";
import { useI18n } from "@/internationalization/client";
import { firestore } from "@/lib/firebase/firebase-config";
import {  doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Loader, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Page() {
  const t = useI18n();

  const [detailForm, setDetailForm] = useState<{
    state: RequestState;
    data: filed[];
  }>({
    state: "loading",
    data: [],
  });

  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    type: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(firestore, "appconfig", "detail-form"),
      (doc) => {
        if (doc.exists()) {
          console.log("Document data:", doc.data());

          const filteredData = doc.data()?.fields;

          setDetailForm({
            state: "success",
            data: filteredData,
          });
          
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOptional = async (name: string) => {
    const docRef = doc(firestore, "appconfig", "detail-form");
    let loading = toast.loading("Updating...");
    try {
        await updateDoc(docRef, {
            fields: detailForm.data?.map((data) => {
              if (data.name === name) {
                return {
                  ...data,
                  value: false,
                };
              } else {
                return data;
              }
            }),
          });
            toast.success("Updated successfully");
            toast.dismiss(loading);
    } catch (error) {
        toast.error("Something went wrong");
        toast.dismiss(loading);
    }
        
  }


  const handleRequired = async (name: string) => {
    const docRef = doc(firestore, "appconfig", "detail-form");
    let loading = toast.loading("Updating...");
    try {
        await updateDoc(docRef, {
            fields: detailForm.data?.map((data) => {
              if (data.name === name) {
                return {
                  ...data,
                  value: true,
                };
              } else {
                return data;
              }
            }),
          });
            toast.success("Updated successfully");
            toast.dismiss(loading);
    } catch (error) {
        toast.error("Something went wrong");
        toast.dismiss(loading);
    }
        
  }


    const handleDelete = async (name: string) => {
        const docRef = doc(firestore, "appconfig", "detail-form");
        let loading = toast.loading("Deleting...");
        try {
            await updateDoc(docRef, {
                fields: detailForm.data?.filter((data) => data.name !== name),
              });
                toast.success("Deleted successfully");
                toast.dismiss(loading);
        } catch (error) {
            toast.error("Something went wrong");
            toast.dismiss(loading);
            console.log(error)
        }
    }

  console.log(detailForm.data);
  return (
    <div>
      <div className="flex justify-between items-center gap-4 flex-row-reverse">
        <NavLink href="/detail-form/add" className={buttonVariants()}>
          {t("pages.detailForm.AddField")}
          <Plus className="mr-2" size={16} />
        </NavLink>
      </div>
      <ListItem className="bg-primary mt-8 py-2 rounded-full">
        <span>{t("words.serialNo")}</span>
        <span>{t("pages.detailForm.fieldName")}</span>
        <span>{t("actions.edit")}</span>
      </ListItem>
      <div className="mt-6">
        {detailForm.state === "loading" ? (
          <Loader />
        ) : detailForm.data?.length === 0 ? (
          <Alert>You have not added any links yet.</Alert>
        ) : (
          <div className="space-y-4">
            {detailForm.data?.map((data, index) => {
              return (
                <ListItem className="rounded-lg" key={data.name}>
                  <span>{index + 1}</span>
                  <span>{data.name}</span>
               {
                data.value === true ? 
                <ActionsDropdown
                    onOptional={() => {
                        handleOptional(data.name);
                        
                    }}
                    onDelete={() => {
                      setDeleteAlert({
                        isOpen: true,
                        type: data.name,
                      });
                    }}
                  />:
                  <ActionsDropdown
                    onRequired={() => {
                        
                        handleRequired(data.name);
                    }}
                    onDelete={() => {
                      setDeleteAlert({
                        isOpen: true,
                        type: data.name,
                      });
                    }}
                  />
               }   
                </ListItem>
              );
            })}
          </div>
        )}
      </div>
      <ConfirmationDialog
        isOpen={deleteAlert.isOpen}
        onClose={() =>
          setDeleteAlert({
            isOpen: false,
            type: "",
          })
        }
        onConfirm={()=>{
            handleDelete(deleteAlert.type);
        }}
      />
    </div>
    
  );
}

export default Page;
