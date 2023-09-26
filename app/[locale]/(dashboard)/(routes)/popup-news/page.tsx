"use client";

import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ListItem } from "@/components/ui/list-item";
import { Loader } from "@/components/ui/loader";
import { NavLink } from "@/components/ui/nav-link";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/internationalization/client";
import { fireStorage, firestore } from "@/lib/firebase/firebase-config";
import {
  DocumentData,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function PopupNews() {
  const t = useI18n();
  const [news, setNews] = useState<{
    state: RequestState;
    data: DocumentData[];
  }>({
    state: "loading",
    data: [],
  });

  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    id: "",
  });

  const changeNewsStatus = (id: string, newStatus: boolean) => {
    const newsRef = doc(firestore, "news", id);

    try {
      updateDoc(newsRef, {
        active: newStatus,
      });
    } catch (error) {
      console.log(error);
      // toast.error(t("pages.newsPopup.changeStatusError"));
      toast.error("There was an error changing the news status");
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "news"),
      (snapshot) => {
        const newsData: DocumentData[] = [];

        snapshot.forEach((doc) => {
          newsData.push({ id: doc.id, ...doc.data() });
        });

        setNews({
          state: "success",
          data: newsData,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        {t("pages.newsPopup.popupNewsTitle")}
        <NavLink href="/popup-news/add" className={buttonVariants()}>
          {t("pages.newsPopup.addNews")}
        </NavLink>
      </div>
      <div className="mt-4">
        {news.state === "loading" ? (
          <Loader />
        ) : news.data.length === 0 ? (
          <Alert>{t("pages.newsPopup.noNews")}</Alert>
        ) : (
          <div className="grid grid-cols-2 gap-8">
            {news.data.map((news) => (
              <ListItem key={news.id} className="flex flex-col items-start">
                <div className="flex justify-between gap-3 w-full">
                  <div className="flex gap-3">
                    {news.image ? (
                      <Image
                        src={news.image}
                        width={100}
                        height={100}
                        alt="News image"
                        className="object-cover h-24 w-28 rounded-md"
                      />
                    ) : (
                      <span>No image</span>
                    )}

                    {news.video ? (
                      <video
                        src={news.video}
                        controls
                        className="object-cover h-24 w-28 rounded-md"
                      />
                    ) : (
                      <span>No video</span>
                    )}
                  </div>
                  <div className="flex items-start gap-1 z-10">
                    <Checkbox
                      defaultChecked={news.active}
                      onCheckedChange={(checked: boolean) =>
                        changeNewsStatus(news.id, checked)
                      }
                    />
                    <ActionsDropdown
                      onDelete={() =>
                        setDeleteAlert({
                          isOpen: true,
                          id: news.id,
                        })
                      }
                    />
                  </div>
                </div>
                <Separator />

                {/* controlling lines by class */}
                <p className="text-start line-clamp-3">{news.content}</p>
              </ListItem>
            ))}
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
        onConfirm={async () => {
          const newsImageRef = ref(
            fireStorage,
            "news/" + deleteAlert.id + "-image"
          );
          const newsVideoRef = ref(
            fireStorage,
            "news/" + deleteAlert.id + "-video"
          );

          try {
            try {
              await deleteObject(newsImageRef);
              console.log("news image deleted");
            } catch (e) {
              console.log("no image to delete");
            }

            try {
              await deleteObject(newsVideoRef);
              console.log("news video deleted");
            } catch (e) {
              console.log("no video to delete");
            }

            await deleteDoc(doc(firestore, "news", deleteAlert.id));
          } catch (error) {
            console.log(error);
            // toast.error(t("pages.newsPopup.deleteError"));
            toast.error("There was an error deleting the news");
          }
        }}
      />
    </div>
  );
}
