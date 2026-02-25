export type PageDataError = string | null;

export interface PageListDataResult<T> {
  items: T[];
  totalPages: number;
  error: PageDataError;
}
