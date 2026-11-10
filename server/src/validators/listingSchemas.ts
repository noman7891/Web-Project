import { z } from 'zod'

const categoryEnum = z.enum([
  'Electronics',
  'Cards & ID',
  'Keys',
  'Books & Study',
  'Clothing',
  'Bags',
  'Jewelry & Accessories',
  'Other',
])

export const createListingSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must not exceed 120 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  type: z.enum(['lost', 'found'], {
    required_error: 'Type must be either lost or found',
  }),
  category: categoryEnum,
  location: z
    .string({ required_error: 'Location is required' })
    .trim()
    .min(2, 'Location must be at least 2 characters')
    .max(150, 'Location must not exceed 150 characters'),
  itemDate: z.string({ required_error: 'Date is required' }).refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ),
  image: z.string().trim().optional().default(''),
  contactInfo: z
    .string({ required_error: 'Contact information is required' })
    .trim()
    .min(3, 'Contact info must be at least 3 characters')
    .max(150, 'Contact info must not exceed 150 characters'),
})

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['active', 'claimed', 'archived']).optional(),
})

export const queryListingSchema = z.object({
  type: z.enum(['lost', 'found']).optional(),
  category: categoryEnum.optional(),
  status: z.enum(['active', 'claimed', 'archived']).optional(),
  search: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10))) : 12)),
  sortBy: z.enum(['createdAt', 'itemDate', 'title']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
export type QueryListingInput = z.infer<typeof queryListingSchema>

