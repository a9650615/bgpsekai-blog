import { defineCollection, z } from 'astro:content';

const baseSchema = ({ image }: { image: () => z.ZodType }) =>
  z.object({
    title: z.string(),
    slug: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string(),
    tags: z.array(z.string()).default([]),
    featureImage: image().optional(),
    excerpt: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  });

const posts = defineCollection({
  type: 'content',
  schema: baseSchema,
});

const pages = defineCollection({
  type: 'content',
  schema: baseSchema,
});

export const collections = { posts, pages };
