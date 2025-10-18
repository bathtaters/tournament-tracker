import type { Player, Stats } from "types/models";
import type { CellStyle, Column } from "common/DataTable/DataTable.d";
import { formatPercent } from "assets/formatting";
import { BasicPlayerNameStyle, FullPlayerNameStyle } from "./StatsStyle";

type ExtraData = {
  players: Record<string, Player>;
  stats: Stats;
};

// Stats table classes
const hdrClass = "text-md sm:text-lg",
  indexStyle: CellStyle = {
    size: "base",
    color: "primary",
    weight: "light",
    align: "right",
  },
  titleStyle: CellStyle = {
    size: "lg",
    color: "secondary",
    weight: "light",
    align: "left",
  },
  listStyle: CellStyle = {
    size: "lg",
    color: "secondary",
    weight: "light",
    align: "center",
  };

// Stats columns
const statsLayout: Column<ExtraData>[] = [
  { label: "", get: "index", cellStyle: indexStyle },
  {
    label: "Name",
    get: (id, { players }) => <FullPlayerNameStyle player={players[id]} />,
    cellStyle: titleStyle,
    hdrClass: "text-lg",
    default: "?",
  },
  {
    label: "W",
    get: (id, { stats }) => stats[id]?.matchRecord?.[0],
    hdrClass: "text-lg",
    default: "-",
  },
  {
    label: "L",
    get: (id, { stats }) => stats[id]?.matchRecord?.[1],
    hdrClass: "text-lg",
    default: "-",
  },
  {
    label: "D",
    get: (id, { stats }) => stats[id]?.matchRecord?.[2],
    hdrClass: "text-lg",
    default: "-",
  },
  {
    label: "G",
    get: (id, { stats }) => stats[id]?.gameRate,
    format: formatPercent,
    hdrClass: "text-lg",
    default: "-",
  },
  {
    label: "OMW",
    get: (id, { stats }) => stats[id]?.oppMatch,
    format: formatPercent,
    default: "-",
    hdrClass,
  },
  {
    label: "OGW",
    get: (id, { stats }) => stats[id]?.oppGame,
    format: formatPercent,
    default: "-",
    hdrClass,
  },
];

const basicLayout: Column<ExtraData>[] = [
  {
    label: "Name",
    cellStyle: listStyle,
    hdrClass: "text-lg",
    default: "?",
    get: (id, { players }) => <BasicPlayerNameStyle player={players[id]} />,
  },
];

const creditsRow: Column<ExtraData> = {
  label: "Credits",
  get: (id, { players }) => players[id]?.credits,
  hdrClass: "text-lg",
  default: "-",
};

export default function getStatsLayout(basic = false, showCredits = false) {
  if (basic) return showCredits ? [...basicLayout, creditsRow] : basicLayout;
  if (!showCredits) return statsLayout;
  return [...statsLayout.slice(0, 2), creditsRow, ...statsLayout.slice(2)];
}
