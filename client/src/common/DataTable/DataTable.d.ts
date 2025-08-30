import { ReactNode } from "react";

/**
 * Column definition interface for DataTable
 *
 * @param label - header text
 * @param id - column ID (Default: use 'label')
 * @param span - columns to span (default: 1)
 * @param hdrClass - header cell class
 * @param className - column cells class (not applied to header cell)
 * @param default - default value to use if get() returns undef/null
 * @param get - `(rowId, extra, rowIndex) => Element` - get value for specified row @ this column
 * @param format - Function to format a column value (default value excluded)
 */
export type Column<Extra> = {
  label: string;
  id?: string;
  span?: number;
  hdrClass?: string;
  className?: string | GetClass<Extra>;
  cellStyle?: Partial<CellStyle>;
  default?: ReactNode;
  get?:
    | ReactNode
    | ((rowId: string, extra: Extra, rowIndex: number) => ReactNode);
  format?: (value?: any) => ReactNode;
};

export type RowActionHandler<Extra, Event> = (
  rowId: string,
  event: Event,
  extra: Extra,
  idx: number,
) => void;

type GetClass<Extra> = (id: string, extra: Extra) => string;

type CellStyle = {
  align: "left" | "center" | "right";
  weight:
    | "thin"
    | "extralight"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold";
  size: "xs" | "sm" | "base" | "lg" | "xl" | `${number}xl`;
  color: string;
};
