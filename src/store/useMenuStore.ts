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
  isOrderingEnabled: () => boolean;
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
        const { dineInEnabled, takeawayEnabled } = get().orderModesConfig;
        const selected = get().selectedOrderMode;

        if (selected === 'dineIn' && !dineInEnabled && takeawayEnabled) return 'takeaway';
        if (selected === 'takeaway' && !takeawayEnabled && dineInEnabled) return 'dineIn';
        return selected;
      },
      isOrderingEnabled: () => {
        const { dineInEnabled, takeawayEnabled } = get().orderModesConfig;
        return dineInEnabled || takeawayEnabled;
      }
    }),
    {
      name: 'menu-order-mode-storage',
      partialize: (state) => ({ selectedOrderMode: state.selectedOrderMode }),
    }
  )
);
