import type { Player, Stats, Team } from "types/models";
import type { CellStyle, Column } from "common/DataTable/DataTable.d";
import { formatPercent } from "assets/formatting";
import { BasicPlayerNameStyle, FullPlayerNameStyle } from "./StatsStyle";

type ExtraData = {
  stats: Stats;
  players: Record<Player["id"], Player>;
  teams: Record<Team["id"], Team>;
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

/** Get team or player data for name */
// const getData = (team?: Team, players: ExtraData["players"] = {}) =>
//   team?.players?.map((id) => players[id]).filter((p) => p?.name && !p.hide);

export const getData = (
  id: Player["id"] | Team["id"],
  players: Record<Player["id"], Player>,
  teams: Record<Team["id"], Team>,
): { player?: Player; team?: Team & { members: Player[] } } => {
  if (!teams[id]) return { player: players[id] ?? { id, name: "" } };
  return {
    team: {
      ...teams[id],
      members: teams[id].players.map((id) => players[id] ?? { id, name: "" }),
    },
  };
};

// Stats columns
const statsLayout: Column<ExtraData>[] = [
  { label: "", get: "index", cellStyle: indexStyle },
  {
    label: "Name",
    get: (id, { players, teams }) => (
      <FullPlayerNameStyle {...getData(id, players, teams)} />
    ),
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
    get: (id, { players, teams }) => (
      <BasicPlayerNameStyle {...getData(id, players, teams)} />
    ),
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
