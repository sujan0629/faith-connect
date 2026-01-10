import { create } from 'zustand';

type CreatePostState = {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useCreatePostStore = create<CreatePostState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
