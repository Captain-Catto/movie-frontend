import type React from "react";
import TableFilters from "./TableFilters";

function MovieFilters(props: React.ComponentProps<typeof TableFilters>) {
  return <TableFilters {...props} />;
}

export { MovieFilters };
export type { TableFilterOptions as FilterOptions } from "@/types/ui";
export default MovieFilters;
