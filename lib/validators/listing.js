const { z } = require('zod');

const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title too long'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(2000, 'Description too long'),
  price: z.coerce.number().positive('Price must be a positive number'),
  quantityAvailable: z.coerce.number().int().min(0, 'Quantity must be 0 or greater'),
  isActive: z.boolean().optional().default(true),
});

const updateListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title too long').optional(),
  description: z.string().min(5, 'Description must be at least 5 characters').max(2000, 'Description too long').optional(),
  price: z.coerce.number().positive('Price must be a positive number').optional(),
  quantityAvailable: z.coerce.number().int().min(0, 'Quantity must be 0 or greater').optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
};
