type DailyStudyDocument = {
  id: string;
  name: string;
  coverImage: string;
  pdfLink: string;
  studyContent: string;
  contentType: "text" | "pdf" | "Both";
  createdAt: FieldValue;
  updatedAt: FieldValue;
  showDate: string,
  isAssigned?:boolean
};
