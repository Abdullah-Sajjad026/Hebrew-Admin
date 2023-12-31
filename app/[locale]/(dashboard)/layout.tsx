"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

import { Card } from "@/components/ui/card";
import { DashboardHeader } from "./components/header";
import { DashboardSidebar } from "./components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { Loader } from "@/components/ui/loader";

/**
 * Layout for the whole dashboard
 */
export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, authLoading } = useAuthContext();

  useEffect(() => {
    if (!authLoading)
      if (!isLoggedIn) {
        router.push("/login");
      }
  }, [isLoggedIn, authLoading, router]);

  return (
    <>
      <div className="flex h-screen max-h-screen">
        <DashboardSidebar />
        <div className="flex-grow basis-[768px] shrink-0 ">
          <div className="flex flex-col ">
            <DashboardHeader />
            {/* 4rem resembles to the height of the header */}
            <main className="p-6 flex-grow h-[calc(100vh-5rem)]">
              {/* we need a global card in dashboard where the content is gonna rest  */}
              <div className="h-8 pr-6">
                <h3>{searchParams.get("title")}</h3>
              </div>
              <Card className="p-3 rounded-2xl h-[calc(100%-2rem)] border-primary content-wrapper">
                <ScrollArea dir="rtl" className="h-full">
                  <div className="px-7 py-2 h-full">{children}</div>
                </ScrollArea>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
