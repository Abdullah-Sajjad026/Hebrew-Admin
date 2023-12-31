"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Mail, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScopedI18n } from "@/internationalization/client";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { fireAuth } from "@/lib/firebase/firebase-config";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

type FormSchema = z.infer<typeof formSchema>;

function LoginPage() {
  const t = useScopedI18n("auth");
  const router = useRouter();
  const { authLoading, isLoggedIn, authError } = useAuthContext();

  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(fireAuth);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    toast.dismiss();

    if (authError) {
      console.log({ authError });
      toast.error(authError.message);
    }

    if (authLoading) {
      toast.loading("Signing you in...");
    }

    if (isLoggedIn) {
      toast.success("You are signed in!");
      router.back();
    }
  }, [authError, authLoading, isLoggedIn, router]);

  return (
    <Card className="w-[450px] rounded-2xl">
      <CardHeader className="text-center py-12">
        <CardTitle>{t("loginTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="pb-12">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              // this function should be separated if exceeds 1 line
              (values) =>
                signInWithEmailAndPassword(values.email, values.password)
            )}
            className="space-y-10"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      placeholder={t("email")}
                      icon={<Mail width={21} />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      type="password"
                      placeholder={t("password")}
                      icon={<Unlock width="21" />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center">
              <Button disabled={loading}>{t("login")}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LoginPage;
