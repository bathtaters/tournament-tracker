import RawDataStyle from "./styles/RawDataStyle";
import { useShowRaw } from "./common.fetch";

// Display raw data
export default function RawData({
  data,
  className = "",
}: {
  data?: any;
  className?: string;
}) {
  const showRaw = useShowRaw();

  if (!showRaw || !data) return null;

  const styleData = JSON.stringify(data)
    .replace(/:/g, ": ")
    .replace(/,/g, ", ");

  return <RawDataStyle className={className}>{styleData}</RawDataStyle>;
}
