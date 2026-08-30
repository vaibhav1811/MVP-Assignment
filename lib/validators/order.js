const { z } = require('zod');

const createOrderSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

module.exports = {
  createOrderSchema,
};
