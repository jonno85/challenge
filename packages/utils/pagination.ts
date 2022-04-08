export type SortItems = {
  by: string[];
  direction?: string[];
};
export interface PaginateArgs {
  pagination: {
    page: number;
    offset: number;
    pageSize: number;
    totalCount?: number;
    lastPage?: number;
  };
  filters: { [key: string]: number | string };
  sort: SortItems;
}

export type PagedResult<T> = {
  paginate: PaginateArgs;
  data: T[];
};
