import { create } from 'zustand';

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  isSelected?: boolean; // NEW: Track if currently selected by this user
  claimedBy?: string | null; 
}

interface BillState {
  items: ReceiptItem[];
  addItem: (name: string, price: number) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void; // NEW Action
  clearBill: () => void;
}

export const useBillStore = create<BillState>((set) => ({
  items: [],
  
  addItem: (name, price) => set((state) => ({
    items: [{
      id: crypto.randomUUID(), 
      name,
      price,
      isSelected: false, // Default to unselected
      claimedBy: null
    }, ...state.items] // Add to top
  })),

  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),

  toggleItem: (id) => set((state) => ({
    items: state.items.map((item) => 
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    )
  })),

  clearBill: () => set({ items: [] }),
}));