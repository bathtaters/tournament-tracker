import type { PlayerRecord } from "types/models";
import { Link } from "react-router-dom";
import { statsStyle } from "../../styles/StatsStyles";
import { formatRecord } from "../../../../assets/formatting";
import { useLinkId } from "../../../../common/General/services/idUrl.services";

type StatsRowProps = {
  rowNum?: number;
  id: string;
  name?: string;
  isDrop?: boolean;
  record?: PlayerRecord;
  disableLink?: boolean;
  tooltip?: string;
};

function StatsRow({
  rowNum,
  id,
  name,
  isDrop,
  record,
  disableLink,
  tooltip,
}: StatsRowProps) {
  // Row Number
  const rowHead = (
    <span className={statsStyle.number(isDrop)}>
      {rowNum ? rowNum + ")" : "• "}
    </span>
  );

  const playerUrl = useLinkId(id, "profile/");

  // Missing Player Data
  if (!name)
    return (
      <>
        {rowHead}
        <span className={statsStyle.missing}>– Missing –</span>
      </>
    );

  // Row
  return (
    <>
      {rowHead}

      <Link
        className={statsStyle.name(!!rowNum, disableLink, !!tooltip)}
        data-tip={tooltip}
        to={disableLink ? null : playerUrl}
        role="link"
        aria-disabled={disableLink}
      >
        {name}
      </Link>

      {Boolean(rowNum) && (
        <span className={statsStyle.record}>{formatRecord(record, false)}</span>
      )}
    </>
  );
}

export default StatsRow;
