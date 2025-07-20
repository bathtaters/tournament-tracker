export const titleStyle = "label font-light mb-2";

export function EditableListStyle({ type, count, children }) {
  return (
    <div className="m-4 w-full">
      <div
        className={titleStyle}
      >{`${type}s${typeof count !== "number" ? "" : ` (${count})`}`}</div>
      {children}
    </div>
  );
}

export function ListRowStyle({ children }) {
  return <div className="min-w-48 my-1">{children}</div>;
}

export function ListNameStyle({ isMissing, onClick, children }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      className={`align-middle${isMissing ? " italic opacity-90" : ""}${onClick ? " link link-hover" : ""}`}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

export function SuggestTextSpacer() {
  return <span className="align-middle" />;
}

export const suggestListLayout = (
  list,
  data,
  nameKey,
  { mutation, label } = {}
) => {
  const suggestList = list.map((id) => ({ id, value: data[id][nameKey] }));
  return !mutation || !label
    ? suggestList
    : suggestList.concat({
        value: label,
        isStatic: true,
        className: "italic text-normal",
      });
};
