import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderMode = 'dineIn' | 'takeaway';

interface OrderModesConfig {
  dineInEnabled: boolean;
  takeawayEnabled: boolean;
}

interface MenuState {
  selectedOrderMode: OrderMode;
  orderModesConfig: OrderModesConfig;
  setOrderMode: (mode: OrderMode) => void;
  setOrderModesConfig: (config: OrderModesConfig) => void;
  getEffectiveOrderMode: () => OrderMode;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      selectedOrderMode: 'dineIn',
      orderModesConfig: {
        dineInEnabled: true,
        takeawayEnabled: true,
      },
      setOrderMode: (mode) => set({ selectedOrderMode: mode }),
      setOrderModesConfig: (config) => set({ orderModesConfig: config }),
      getEffectiveOrderMode: () => {
        return get().selectedOrderMode;
      }
    }),
    {
      name: 'menu-order-mode-storage',
      partialize: (state) => ({ selectedOrderMode: state.selectedOrderMode }),
    }
  )
);
