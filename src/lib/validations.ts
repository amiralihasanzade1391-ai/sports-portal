import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  image: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .min(3, { message: "Comment must be at least 3 characters" })
    .max(1000, { message: "Comment cannot exceed 1000 characters" }),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const articleSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  slug: z.string().min(3, { message: "Slug is required" }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters" }),
  content: z.string().min(20, { message: "Content must be at least 20 characters" }),
  category: z.enum(["FOOTBALL", "BASKETBALL", "TENNIS", "CRICKET", "GENERAL"]),
  coverImage: z.string().url({ message: "Cover image must be a valid URL" }),
  published: z.boolean().default(false),
});

export type ArticleInput = z.infer<typeof articleSchema>;
