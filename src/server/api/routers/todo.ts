import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { todoInput } from "~/types";

export const todoRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    if (!todos) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No todos found",
      });
    }

    const cleanedTodos = todos
      .map(({ id, userId, title, content, completed, createdAt }) => ({
        id,
        userId,
        title,
        content,
        completed,
        createdAt,
      }))
      .sort((a, b) => a.createdAt.getDate() - b.createdAt.getDate());

    return cleanedTodos;
  }),

  createPost: protectedProcedure
    .input(todoInput)
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title,
          content: input.content,
        },
      });

      return todo;
    }),

  deletePost: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.delete({
        where: {
          id: input,
        },
      });

      return todo;
    }),

  toggleCompleted: protectedProcedure
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input: { id, completed } }) => {
      return await ctx.prisma.todo.update({
        where: {
          id,
        },
        data: {
          completed,
        },
      });
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
