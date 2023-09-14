import { create } from "zustand";

type HookState = {
  editingDoc: SingleStudyData | null;
  setEditingDoc: (doc: SingleStudyData | null) => void;
};

const useDailyStudiesForm = create<HookState>((set) => ({
  editingDoc: null,
  setEditingDoc: (doc: SingleStudyData | null) => set({ editingDoc: doc }),
}));

export default useDailyStudiesForm;
