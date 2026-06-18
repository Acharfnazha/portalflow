"use client";

import { create } from "zustand";
import type { Organization, User, Plan } from "@/types/app.types";

interface WorkspaceStore {
  organization: Organization | null;
  currentUser: User | null;
  isLoaded: boolean;

  setOrganization: (org: Organization) => void;
  setCurrentUser: (user: User) => void;
  setLoaded: () => void;
  reset: () => void;

  // Derived
  plan: Plan;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  canManageTeam: () => boolean;
  canManageBilling: () => boolean;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  organization: null,
  currentUser: null,
  isLoaded: false,

  setOrganization: (org) => set({ organization: org }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setLoaded: () => set({ isLoaded: true }),
  reset: () => set({ organization: null, currentUser: null, isLoaded: false }),

  get plan(): Plan {
    return get().organization?.plan ?? "studio";
  },

  isOwner: () => get().currentUser?.role === "owner",
  isAdmin: () => ["owner", "admin"].includes(get().currentUser?.role ?? ""),
  canManageTeam: () =>
    ["owner", "admin"].includes(get().currentUser?.role ?? ""),
  canManageBilling: () => get().currentUser?.role === "owner",
}));
