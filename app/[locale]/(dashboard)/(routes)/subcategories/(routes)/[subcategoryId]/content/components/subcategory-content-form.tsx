"use client";

import React from "react";
import { z } from "zod";
import { DefaultValues, useForm } from "react-hook-form";
import { Editable, useEditor } from "@wysimark/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/internationalization/client";

import { FileInputBox } from "@/components/ui/file-input-box";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  fileSchema,
  DEFAULT_ACCEPTED_IMAGE_TYPES,
} from "@/constants/general-schemas";
import SassySelect from "@/components/ui/sassy-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z
  .object({
    action: z.enum(["add", "update"]),
    pdf: z.optional(
      fileSchema({
        acceptedTypes: ["application/pdf"],
      })
    ),
    pdfSrc: z.string().optional(),

    studyContent: z.string().optional(),

    coverImage: z.optional(
      fileSchema({
        acceptedTypes: DEFAULT_ACCEPTED_IMAGE_TYPES,
      })
    ),
    coverImageSrc: z.string().optional(),

    timeToRead: z.string().nonempty(),

    fileName: z.string().nonempty(),
    contentType: z.enum(["pdf", "text"]),
  })
  .superRefine((val, ctx) => {
    // lets implement the requirement with proper error messages

    // if action is add
    if (val.action === "add") {
      // cover image is required
      if (!val.coverImage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "cover image is required",
          path: ["coverImage"],
        });
      }

      // at least one of pdf or study content is required
      if (!val.pdf && !val.studyContent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "at least one of pdf or study content is required",
          path: ["pdf", "studyContent"],
        });
      }

      // both pdf and study content can be added if wanted
    }

    // if action is update
    if (val.action === "update") {
      // if cover image source is present
      if (val.coverImageSrc) {
        // cover image is optional
      } else {
        // cover image is required
        if (!val.coverImage) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "cover image is required",
            path: ["coverImage"],
          });
        }
      }

      // both pdf and study content can be added if wanted
    }
  });

export type SubcategoryContentFormState = z.infer<typeof formSchema>;

const INITIAL_VALUES: DefaultValues<SubcategoryContentFormState> = {
  action: "add",
  fileName: "",
  studyContent: "",
  coverImage: undefined,
  pdf: undefined,
  pdfSrc: "",
  coverImageSrc: "",
  timeToRead: undefined,
  contentType: "pdf",
};

// Component Prop
type SubcategoryContentFormProps = {
  action: "add" | "update";
  footer: React.ReactNode;

  /* a function to call when the form is submitted */
  onSubmit: (values: SubcategoryContentFormState) => void;

  /* the initial values of the form */
  initialValues?: DefaultValues<SubcategoryContentFormState>;
};

const SubcategoryContentForm = ({
  footer,
  onSubmit,
  initialValues = INITIAL_VALUES,
}: SubcategoryContentFormProps) => {
  const t = useI18n();
  const editor = useEditor({});
  type TypeOfDoc = "pdf" | "text" | undefined;
  const [contentType, setContentType] = React.useState<TypeOfDoc>(
    initialValues.contentType
  );

  const form = useForm<SubcategoryContentFormState>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            <div className="flex justify-between">
              <FormLabel>{t("pages.subcategoryContent.formTitle")}</FormLabel>

              {/* select here */}
            </div>

            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem className="flex gap-4 space-y-0">
                  <FormLabel className="basis-28 whitespace-nowrap">
                    {t("words.fileName")}:
                  </FormLabel>
                  <div className="flex-col gap-2">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem className="space-y-0 flex gap-2">
                  <FormLabel className="basis-28 whitespace-nowrap">
                    {t("actions.addCover")}:
                  </FormLabel>
                  <div className="space-y-5">
                    <FormControl>
                      <FileInputBox
                        {...field}
                        fileType="image"
                        fileSrc={form.getValues().coverImageSrc}
                      />
                    </FormControl>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem className="flex gap-2 space-y-0">
                  <FormLabel className="basis-28 whitespace-nowrap">
                    {"Content Type"}:
                  </FormLabel>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setContentType(value as TypeOfDoc);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("micsWords.chooseType")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="text">TEXT</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormDescription>
                      {t("micsWords.chooseBetweenPdfAndFile")}
                    </FormDescription>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {contentType === "text" ? (
              <FormField
                control={form.control}
                name="studyContent"
                render={({ field }) => (
                  <FormItem className="flex gap-4 space-y-0">
                    <FormLabel className="basis-28 whitespace-nowrap">
                      {t("pages.dailyStudies.studyContent")}:
                    </FormLabel>
                    <div className="flex-col gap-2">
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
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="pdf"
                render={({ field }) => (
                  <FormItem className="space-y-0 flex gap-2">
                    <FormLabel className="basis-28 whitespace-nowrap">
                      {"Pdf"}:
                    </FormLabel>
                    <div className="space-y-5">
                      <FormControl>
                        <FileInputBox
                          {...field}
                          fileType="pdf"
                          fileSrc={form.getValues().pdfSrc}
                        />
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="timeToRead"
              render={({ field }) => (
                <FormItem className="flex gap-4 space-y-0">
                  <FormLabel className="basis-28 whitespace-nowrap">
                    {t("words.timeToRead")}:
                  </FormLabel>
                  <div className="flex-col gap-2">
                    <SassySelect
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      options={
                        // 1day, 3days, 5days, 1week
                        // if to be used anywhere else too, better make a constant or a function to generate these options
                        [
                          {
                            value: "1day",
                            label: t("intervals.days", { count: 1 }),
                          },
                          {
                            value: "3days",
                            label: t("intervals.days", { count: 3 }),
                          },
                          {
                            value: "5days",
                            label: t("intervals.days", { count: 5 }),
                          },
                          {
                            value: "1week",
                            label: t("intervals.weeks", { count: 1 }),
                          },
                        ]
                      }
                      labelKey="label"
                      valueKey="value"
                      placeholder="Select Time To Read"
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {footer && footer}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubcategoryContentForm;
