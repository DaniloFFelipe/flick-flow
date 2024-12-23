import { z } from 'zod'

export const paginatedMetadataSchema = z.object({
  total: z.number(),
  per_page: z.coerce.number(),
  page_index: z.coerce.number(),
  next_page_index: z.number().nullable(),
})

export const paginatedSchema = z.object({
  meta: paginatedMetadataSchema,
})

export type PaginatedMetadata = z.infer<typeof paginatedMetadataSchema>

export interface Paginated<Data> {
  meta: PaginatedMetadata
  data: Data[]
}

export interface Pagination {
  per_page: number
  page_index: number
}

export const defaultPagination: Pagination = {
  page_index: 0,
  per_page: 20,
}

export function createPaginationResponse<Data>(
  data: Data[],
  total: number,
  pagination: Pagination,
): Paginated<Data> {
  const hasNext = total / pagination.per_page > pagination.page_index + 1
  const response: Paginated<(typeof data)[0]> = {
    data,
    meta: {
      next_page_index: hasNext ? pagination.page_index + 1 : null,
      page_index: pagination.page_index,
      per_page: pagination.per_page,
      total,
    },
  }

  return response
}

export const paginationSchema = z.object({
  per_page: z.coerce.number().min(1).default(20),
  page_index: z.coerce.number().min(0).default(0),
})
