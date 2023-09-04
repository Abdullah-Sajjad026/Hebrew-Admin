"use client";

import { z } from "zod";
import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/internationalization/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  fileSchema,
  DEFAULT_ACCEPTED_IMAGE_TYPES,
  DEFAULT_ACCEPTED_VIDEO_TYPES,
  DEFAULT_VIDEO_MAX_SIZE,
} from "@/constants/general-schemas";
import { FileInputBox } from "@/components/ui/file-input-box";
import { Textarea } from "@/components/ui/textarea";
import { Editable, useEditor } from "@wysimark/react";

type PopupNewsFormProps = {
  /* a header component to render above the form. Excluded from the form and not in the className implementation */
  header?: React.ReactNode;

  /* a footer component to render below the form. Excluded from className implementation */
  footer: React.ReactNode;

  /* a className to apply to the form */
  className?: string;

  /* a function to call when the form is submitted */
  onSubmit: (values: PopupNewsFormState) => void;

  /* the initial values of the form */
  initialValues?: DefaultValues<PopupNewsFormState>;
};

const formSchema = z.object({
  newsContent: z.string().nonempty(),
  newsImage: z.optional(
    fileSchema({
      acceptedTypes: DEFAULT_ACCEPTED_IMAGE_TYPES,
    })
  ),
  newsVideo: z.optional(
    fileSchema({
      acceptedTypes: DEFAULT_ACCEPTED_VIDEO_TYPES,
      maxSize: DEFAULT_VIDEO_MAX_SIZE,
    })
  ),
});

export type PopupNewsFormState = z.infer<typeof formSchema>;

const INITIAL_VALUES: DefaultValues<PopupNewsFormState> = {
  newsContent: "",
  // newsImage is of type FileList so we can use the FileList type to initialize it
  newsImage: undefined,
  newsVideo: undefined,
};

/*
    News Popup Form:
*/
export default function PopupNewsForm({
  header,
  footer,
  onSubmit,
  className = "",
  initialValues = INITIAL_VALUES,
}: PopupNewsFormProps) {
  const t = useI18n();
  const editor = useEditor({});

  const form = useForm<PopupNewsFormState>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  return (
    <div>
      {header && header}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className={`${className} flex flex-col gap-4 `}>
            <div className="flex items-start gap-4 justify-around">
              <FormField
                control={form.control}
                name="newsImage"
                render={({ field }) => (
                  <FormItem className="space-y-0 flex gap-2">
                    <FormLabel>{t("words.image") + ":"} </FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <FileInputBox {...field} fileType="image" />
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newsVideo"
                render={({ field }) => (
                  <FormItem className="space-y-0 flex gap-2">
                    <FormLabel>{t("words.video") + ":"} </FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <FileInputBox fileType="video" {...field} />
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4">
              <FormField
                control={form.control}
                name="newsContent"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-4">
                      <FormLabel>{t("words.text") + ":"} </FormLabel>
                      <div className="space-y-2 flex-grow">
                        <FormControl>
                          <Editable
                            editor={editor}
                            value={field.value!}
                            onChange={field.onChange}
                            className="w-full min-w-[700px] min-h-[400px] border border-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          {footer && footer}
        </form>
      </Form>
    </div>
  );
}
