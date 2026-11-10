import { z } from 'zod'

export const createClaimSchema = z.object({
  listingId: z
    .string({ required_error: 'Listing ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Listing ID format'),
  explanation: z
    .string({ required_error: 'Explanation of ownership is required' })
    .trim()
    .min(15, 'Explanation must be at least 15 characters to explain ownership proof')
    .max(2000, 'Explanation cannot exceed 2000 characters'),
})

export const updateClaimStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    required_error: 'Status must be either approved or rejected',
  }),
  adminNote: z
    .string()
    .trim()
    .max(1000, 'Admin note cannot exceed 1000 characters')
    .optional()
    .default(''),
})

export type CreateClaimInput = z.infer<typeof createClaimSchema>
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>

