type DailyStudyDocument = {
  id: string;
  name: string;
  coverImage: string;
  pdfLink: string;
  studyContent: string;
  contentType: "text" | "pdf" | "Both";
  createdAt: FieldValue;
  updatedAt: FieldValue;
  showDate: string
};
type  BookDoc = DailyStudyDocument

type SingleStudyData = Omit<BookDoc, "showDate">;
type studyData = Omit<BookDoc, "showDate">[];