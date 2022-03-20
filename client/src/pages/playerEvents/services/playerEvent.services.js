import { dayClasses } from "../../schedule/services/date.utils";

export { dayClasses };

export const getCellData = (row, data, prefetch) => ({
  value: row.value(data),
  className: row.class ? row.class(data) : '',
  linkTo: row.link && row.link(data),
  onHover: row.link && (() => prefetch(data.id)),
});