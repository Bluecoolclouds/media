/**
 * Pagination helper utilities
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationParams(
  searchParams: URLSearchParams | Record<string, string | undefined>
): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(
    1,
    parseInt(
      (searchParams instanceof URLSearchParams
        ? searchParams.get('page')
        : searchParams.page) || '1',
      10
    )
  );
  const limit = Math.min(
    100,
    Math.max(
      1,
      parseInt(
        (searchParams instanceof URLSearchParams
          ? searchParams.get('limit')
          : searchParams.limit) || '10',
        10
      )
    )
  );

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
