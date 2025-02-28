import {create} from "zustand";
import {persist} from "zustand/middleware";

interface AuthState {
  token: string | null;
  admin: boolean
  setToken: (token: string) => void;
  setAdmin: (admin: boolean) => void;
  clearToken: () => void;
  collaborator: boolean,
  setCollaborator: (collaborator: boolean) => void;
}


const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, // Initial state
      admin: false,
      collaborator: false,

      setToken: (token: string) => set({ token }), // Function to update the token
      clearToken: () => set({ token: null }), // Function to remove token

      setAdmin: (admin: boolean) => set({admin}),
      setCollaborator: (collaborator: boolean) => set({collaborator})
    }),
    {
      name: "auth-storage", // Key for localStorage
    }
  )
);

export default useAuthStore;