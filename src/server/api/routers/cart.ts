import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const cartRouter = createTRPCRouter({
  // Get all cart items for the logged-in user
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const cart = await ctx.db.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    return cart || { items: [] }; // Return empty cart if not found
  }),

  // Add an item to the cart
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find or create a cart for the user
      let cart = await ctx.db.cart.findFirst({
        where: { userId },
      });
      if (!cart) {
        cart = await ctx.db.cart.create({
          data: { userId },
        });
      }

      const existingCartItem = await ctx.db.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: input.productId,
        },
      });

      if (existingCartItem) {
        // Update existing cart item
        await ctx.db.cartItem.update({
          where: {
            id: existingCartItem.id,
          },
          data: {
            quantity: {
              increment: input.quantity,
            },
          },
        });
      } else {
        // Create new cart item
        await ctx.db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: input.productId,
            quantity: input.quantity,
          },
        });
      }

      return { success: true };
    }),

  // Update the quantity of an item in the cart
  updateItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedItem = await ctx.db.cartItem.update({
        where: { id: input.cartItemId },
        data: { quantity: input.quantity },
      });
      return updatedItem;
    }),

  // Remove an item from the cart
  removeItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.cartItem.delete({
        where: { id: input.cartItemId },
      });
      return { success: true };
    }),

  // Clear the cart
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const cart = await ctx.db.cart.findFirst({
      where: { userId },
    });

    if (cart) {
      await ctx.db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { success: true };
  }),
});