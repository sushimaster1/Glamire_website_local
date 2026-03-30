import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],
      wishlist: [],
      categories: [],
      settings: null,
      
      fetchCategories: async () => {
        try {
          const { data } = await axios.get('http://localhost:3000/api/products/categories');
          set({ categories: data });
        } catch (err) {
          console.error('Failed to fetch categories', err);
        }
      },

      fetchSettings: async () => {
        try {
          const { data } = await axios.get('http://localhost:3000/api/settings');
          set({ settings: data });
        } catch (err) {
          console.error('Failed to fetch settings', err);
        }
      },
      
      setUser: async (userData, token) => {
        set({ user: userData, token });
        if (token) {
          // Sync profile and merge guest cart
          try {
            const { data: profile } = await axios.get('http://localhost:3000/api/users/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });

            // Merge guest cart with server cart
            const guestCart = get().cart;
            const serverCart = profile.cart.map(item => ({
              product: item.productId,
              variant: item.variant,
              quantity: item.quantity
            }));

            // Deep merge logic
            const mergedCart = [...serverCart];
            guestCart.forEach(gItem => {
              const existingIndex = mergedCart.findIndex(sItem => 
                sItem.product._id === gItem.product._id && 
                sItem.variant.color === gItem.variant.color && 
                sItem.variant.size === gItem.variant.size
              );
              if (existingIndex > -1) {
                mergedCart[existingIndex].quantity += gItem.quantity;
              } else {
                mergedCart.push(gItem);
              }
            });

            // Update server with merged cart
            const formattedForServer = mergedCart.map(item => ({
              productId: item.product._id,
              variant: item.variant,
              quantity: item.quantity
            }));
            
            await axios.post('http://localhost:3000/api/users/cart', 
              { cartItems: formattedForServer },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            set({ 
              cart: mergedCart, 
              wishlist: profile.wishlist 
            });
          } catch (err) {
            console.error("Failed to sync profile", err);
          }
        }
      },

      logout: () => set({ user: null, token: null, cart: [], wishlist: [] }),

      // Syncing helper
      syncCart: async () => {
        const { token, cart } = get();
        if (!token) return;
        try {
          const cartItems = cart.map(item => ({
            productId: item.product._id,
            variant: item.variant,
            quantity: item.quantity
          }));
          await axios.post('http://localhost:3000/api/users/cart', 
            { cartItems }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Failed to sync cart", err);
        }
      },
      
      addToCart: async (product, variant, quantity = 1) => {
        const cart = get().cart;
        const existingItemIndex = cart.findIndex(
          item => item.product._id === product._id && 
                  item.variant.color === variant.color && 
                  item.variant.size === variant.size
        );
        
        let newCart;
        if (existingItemIndex >= 0) {
          newCart = [...cart];
          newCart[existingItemIndex].quantity += quantity;
        } else {
          newCart = [...cart, { product, variant, quantity }];
        }
        set({ cart: newCart });
        get().syncCart();
      },
      
      removeFromCart: (productId, variantColor, variantSize) => {
        const cart = get().cart.filter(item => 
          !(item.product._id === productId && 
            item.variant.color === variantColor && 
            item.variant.size === variantSize)
        );
        set({ cart });
        get().syncCart();
      },
      
      updateCartQuantity: (productId, variantColor, variantSize, quantity) => {
        const cart = get().cart.map(item => {
          if (item.product._id === productId && 
            item.variant.color === variantColor && 
            item.variant.size === variantSize) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ cart });
        get().syncCart();
      },

      clearCart: () => {
        set({ cart: [] });
        get().syncCart();
      },
      
      toggleWishlist: async (product) => {
        const { token, wishlist } = get();
        const exists = wishlist.some(item => item._id === product._id);
        
        let newWishlist;
        if (exists) {
          newWishlist = wishlist.filter(item => item._id !== product._id);
        } else {
          newWishlist = [...wishlist, product];
        }
        set({ wishlist: newWishlist });

        if (token) {
          try {
            await axios.post('http://localhost:3000/api/users/wishlist', 
              { productId: product._id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error("Failed to sync wishlist", err);
          }
        }
      },
    }),
    {
      name: 'glamire-storage',
    }
  )
);

export default useStore;
