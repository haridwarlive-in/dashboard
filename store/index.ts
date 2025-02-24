import {create} from "zustand";
import {persist} from "zustand/middleware";

interface AuthState {
  token: string | null;
  admin: boolean
  setToken: (token: string) => void;
  setAdmin: (admin: boolean) => void;
  clearToken: () => void;
}


const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null, // Initial state
      admin: false,

      setToken: (token: string) => set({ token }), // Function to update the token
      clearToken: () => set({ token: null }), // Function to remove token

      setAdmin: (admin: boolean) => set({admin})
    }),
    {
      name: "auth-storage", // Key for localStorage
    }
  )
);

export default useAuthStore;