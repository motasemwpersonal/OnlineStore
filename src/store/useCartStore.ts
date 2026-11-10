import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Bundle } from '@/types/database';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addProduct: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  addBundle: (bundle: Bundle, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  getTotalPrice: () => number;
  getOriginalTotalPrice: () => number;
  getTotalSavings: () => number;
  getItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addProduct: (product, quantity = 1, selectedVariants = {}) => {
        // تحديد السعر بعد الخصم إن وجد عرض ساري
        const hasActiveOffer =
          product.active_offer &&
          product.active_offer.is_active &&
          new Date(product.active_offer.end_date) > new Date() &&
          new Date(product.active_offer.start_date) <= new Date();

        const unitPrice = hasActiveOffer ? Number(product.active_offer!.discount_price) : Number(product.base_price);
        const originalPrice = Number(product.base_price);

        // إنشاء معرف فريد مبني على خيارات المنتج
        const variantKey = Object.entries(selectedVariants)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`)
          .join('|');
        const cartItemId = `prod_${product.id}_${variantKey || 'default'}`;

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.cartItemId === cartItemId);

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            // التحقق من المخزون المتاح
            const newQuantity = Math.min(currentItem.quantity + quantity, product.stock_quantity || 999);
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: newQuantity,
            };
            return { items: updatedItems, isOpen: true };
          }

          const newItem: CartItem = {
            cartItemId,
            type: 'product',
            product,
            quantity: Math.min(quantity, product.stock_quantity || 999),
            selectedVariants,
            unitPrice,
            originalPrice,
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      addBundle: (bundle, quantity = 1) => {
        const cartItemId = `bundle_${bundle.id}`;
        const unitPrice = Number(bundle.bundle_price);
        const originalPrice = Number(bundle.original_total_price);

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.cartItemId === cartItemId);

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + quantity,
            };
            return { items: updatedItems, isOpen: true };
          }

          const newItem: CartItem = {
            cartItemId,
            type: 'bundle',
            bundle,
            quantity,
            unitPrice,
            originalPrice,
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.cartItemId === cartItemId) {
              const maxStock = item.product?.stock_quantity ?? 999;
              return {
                ...item,
                quantity: Math.min(quantity, maxStock),
              };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      getOriginalTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
      },

      getTotalSavings: () => {
        const total = get().getTotalPrice();
        const original = get().getOriginalTotalPrice();
        return Math.max(0, original - total);
      },

      getItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'online_store_cart_v1',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
