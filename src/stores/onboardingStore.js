import { create } from 'zustand';

export const useOnboardingStore = create((set) => ({
    // Analyze Step
    reason: null,
    setReason: (reason) => set({ reason }),

    // User Details
    name: '',
    email: '',
    password: '',
    setName: (name) => set({ name }),
    setEmail: (email) => set({ email }),
    setPassword: (password) => set({ password }),

    // Step 1-3: Self Reflection
    description: '',
    dailyThoughts: '',
    futureWorries: '',
    setDescribe: (data) => set((state) => ({ ...state, ...data })),

    // Step 4: Admiration
    admiredText: '',
    admiredImages: [],
    setAdmired: (data) => set((state) => ({ ...state, ...data })),

    // Step 5-8: Vision
    homeImages: [],
    carImages: [],
    fashionImages: [],
    fitnessImages: [],
    setVisionImages: (key, images) => set((state) => ({ ...state, [key]: images })),

    reset: () => set({
        reason: null,
        name: '',
        email: '',
        password: '',
        description: '',
        dailyThoughts: '',
        futureWorries: '',
        admiredText: '',
        admiredImages: [],
        homeImages: [],
        carImages: [],
        fashionImages: [],
        fitnessImages: [],
    }),
}));
