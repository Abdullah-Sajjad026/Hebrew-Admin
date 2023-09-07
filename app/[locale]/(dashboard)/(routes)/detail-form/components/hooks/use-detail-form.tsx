import { create } from "zustand";


type HookState = {
  detailFields: filed[] | null;
  setDetailFields: (doc: filed[] | null) => void;
};

const useDetailForm = create<HookState>((set) => ({
  detailFields: null,
  setDetailFields: (doc: filed[] | null) => set({ detailFields: doc }),
}));

export default useDetailForm;
