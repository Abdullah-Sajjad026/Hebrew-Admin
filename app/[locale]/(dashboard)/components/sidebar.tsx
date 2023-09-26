"use client";

import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/ui/nav-link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/contexts/auth-context";
import { useScopedI18n } from "@/internationalization/client";
import { firestore } from "@/lib/firebase/firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Banknote,
  Book,
  BookOpen,
  FileText,
  GalleryVertical,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Newspaper,
  Settings,
  Share2,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import React from "react";

export const DashboardSidebar = () => {
  const { signOutUser } = useAuthContext();
  const scopedT = useScopedI18n("dashboard.sidebar");
  const settingsDoc = doc(firestore, "appconfig", "panel-settings");

  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(undefined);

  const sidebarItems = [
    {
      name: scopedT("categories"),
      href: `/categories?title=${scopedT("categories")}`,
      icon: LayoutDashboard,
    },
    {
      name: scopedT("subcategories"),
      href: `/subcategories?title=${scopedT("subcategories")}`,
      icon: LayoutList,
    },
    {
      name: scopedT("links"),
      href: `/links?title=${scopedT("links")}`,
      icon: Share2,
    },
    {
      name: scopedT("consultation"),
      href: `/consultation?title=${scopedT("consultation")}`,
      icon: Banknote,
    },
    {
      name: scopedT("requests"),
      href: `/requests?title=${scopedT("requests")}`,
      icon: UserCheck,
    },
    {
      name: scopedT("settings"),
      href: `/settings?title=${scopedT("settings")}`,
      icon: Settings,
    },
    {
      name: scopedT("dailyStudies"),
      href: `/daily-studies?title=${scopedT("dailyStudies")}`,
      icon: BookOpen,
    },
    {
      name: scopedT("homeSlider"),
      href: `/home-slider?title=${scopedT("homeSlider")}`,
      icon: GalleryVertical,
    },

    {
      name: scopedT("popupNews"),
      href: `/popup-news?title=${scopedT("popupNews")}`,
      icon: Newspaper,
    },
    {
      name: scopedT("book"),
      href: `/book?title=${scopedT("book")}`,
      icon: Book,
    },
  ];

  React.useEffect(() => {
    const unsub = onSnapshot(settingsDoc, (doc) => {
      const data = doc.data();
      if (data) {
        setLogoUrl(data.adminLogo);
      }
    });

    return () => unsub();
  }, []);

  return (
    <aside className="flex flex-col shrink-0 basis-60 grow-0 h-screen pb-2 bg-primary">
      <div className="flex gap-4 items-center px-4 pt-2 h-20">
        <Image
          width="80"
          height="80"
          src={logoUrl || "/images/admin-logo.png"}
          alt="Admin Image"
          className="rounded-full w-16 h-16"
        />
        <span className="text-lg font-bold">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          רשב"י
        </span>
      </div>

      <div className="mt-8">
        <ScrollArea className="h-[calc(100vh-12rem)]" dir="rtl">
          <ul className="flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-primary-foreground hover:text-primary"
                  activeClassName="bg-primary-foreground text-primary"
                >
                  {item.icon && <item.icon className="w-6 h-6" />}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <Separator className="bg-gray/40 mt-auto mb-3" />

      <Button
        variant="ghost"
        onClick={signOutUser}
        className=" px-4 flex items-center gap-3 self-start"
      >
        <LogOut className="w-6 h-6" />
        <span>{scopedT("logout")}</span>
      </Button>
    </aside>
  );
};
