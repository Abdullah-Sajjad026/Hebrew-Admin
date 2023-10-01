"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

import { fireStorage, firestore } from "@/lib/firebase/firebase-config";

import { NavLink } from "@/components/ui/nav-link";
import { Loader } from "@/components/ui/loader";
import { Alert } from "@/components/ui/alert";
import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { buttonVariants } from "@/components/ui/button";
import { ListItem } from "@/components/ui/list-item";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useI18n } from "@/internationalization/client";
import { Input } from "@/components/ui/input";
import useDailyStudiesForm from "./components/hooks/use-daliy-studies-form";
import { useRouter } from "next/navigation";
import { Dot } from "lucide-react";

export default function Page() {
  const t = useI18n();
  const router = useRouter();
  const { setEditingDoc } = useDailyStudiesForm();

  const [studies, setStudies] = useState<{
    state: RequestState;
    data: DailyStudyDocument[];
  }>({
    state: "loading",
    data: [],
  });

  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    id: "",
  });

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const constraints = [];
    if (searchText)
      constraints.push(
        orderBy("name"),
        where("name", ">=", searchText),
        where("name", "<=", searchText + "\uf8ff")
      );

    const q = query(collection(firestore, "daily-studies"), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studyData: DailyStudyDocument[] = [];

      snapshot.forEach((doc) => {
        studyData.push({ id: doc.id, ...doc.data() } as DailyStudyDocument);
      });

      setStudies({
        state: "success",
        data: studyData,
      });
    });

    return () => unsubscribe();
  }, [searchText]);

  const deleteStudyFile = async () => {
    const studiesImageRef = ref(
      fireStorage,
      "daily-studies/" + deleteAlert.id + "-image"
    );

    try {
      try {
        await deleteObject(studiesImageRef);
        console.log("studies image deleted");
      } catch (error: any) {
        if (error.code === "storage/object-not-found") {
          console.log("studies image not found. continuing...");
        }
      }

      await deleteDoc(doc(firestore, "daily-studies", deleteAlert.id));
    } catch (error) {
      console.log(error);

      // toast.error(t("pages.newsPopup.deleteError"));
      toast.error("There was an error deleting this file");
    }
  };

  console.log({ studies });

  return (
    <div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span>{t("actions.search")}</span>
          <Input
            placeholder={t("actions.search")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <NavLink href="/daily-studies/add" className={buttonVariants()}>
          {t("actions.addFile")}
        </NavLink>
      </div>

      <ListItem className="bg-primary mt-8 py-2 rounded-full">
        <span>{t("words.serialNo")}</span>
        <span>{t("words.dailyStudies")}</span>
        <span>{t("actions.Assigned")}</span>
        <span>{t("actions.edit")}</span>
        
      </ListItem>

      <div className="mt-6">
        {studies.state === "loading" ? (
          <Loader />
        ) : studies.data.length === 0 ? (
          <Alert>No daily studies content found</Alert>
        ) : (
          <div className="space-y-4">
            {studies.data.map((data, index) => {
              return (
                <ListItem className="rounded-lg" key={data.id}>
                  <span>{index + 1}</span>
                  <span>{data.name}</span>
                  <span><Dot color={data.isAssigned ? "orange" : "tree"} className="w-10 h-10" /></span>
                  <ActionsDropdown
                    onEdit={() => {
                      setEditingDoc(data);
                      router.push("/daily-studies/edit");
                    }}
                    onDelete={() => {
                      setDeleteAlert({
                        isOpen: true,
                        id: data.id,
                      });
                    }}
                  />
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
            id: "",
          })
        }
        onConfirm={deleteStudyFile}
      />
    </div>
  );
}
