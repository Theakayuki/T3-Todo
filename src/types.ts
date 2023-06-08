import { z } from "zod";

export const todoInput = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(1)
    .max(50),
  content: z
    .string({
      required_error: "Content is required",
    })
    .min(1)
    .max(500),
});
