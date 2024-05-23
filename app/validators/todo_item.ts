import vine from '@vinejs/vine'

export const createItemValidator = vine.compile(
  vine.object({
    description: vine.string().trim().minLength(1),
    completed: vine.boolean().optional(),
  })
)

export const updateItemValidator = createItemValidator
