import React, { useMemo } from "react";
import EventStats from "./EventStats";
import { statusInfo } from "../../../assets/constants";
import { enums } from "../../../assets/validation";
import { EditEventButton } from "../styles/ButtonStyles";
import {
  ContainerStyle,
  HeaderStyle,
  ValueStyle,
  DetailStyle,
} from "../styles/DashboardStyles";

import { useAccessLevel } from "../../../common/General/common.fetch";

function EventDashboard({ data, openStats }) {
  const { access } = useAccessLevel();

  const headerValue =
    data.status === 2
      ? "Round " + data.roundactive
      : statusInfo[data?.status ?? 0].label;

  const detailLines = useMemo(() => {
    if (!data) return [];
    return [
      [
        `${data.playerspermatch}-Player`,
        `Best of ${(data.wincount ?? 0) * 2 - 1}`,
        `${data.roundcount} Round${data.roundcount === 1 ? "" : "s"}`,
      ].join(" · "),
      [data.team && enums.TeamType[data.team], enums.EventFormat[data.format]]
        .filter(Boolean)
        .join(" · "),
    ];
    // eslint-disable-next-line
  }, [
    data?.format,
    data?.playerspermatch,
    data?.roundcount,
    data?.wincount,
    data?.team,
  ]);

  return (
    <ContainerStyle>
      <HeaderStyle>
        {access > 1 && <EditEventButton onClick={openStats} />}

        <ValueStyle center={access <= 1}>{headerValue}</ValueStyle>

        {data.playerspermatch &&
          data.wincount &&
          detailLines.map((line) => (
            <DetailStyle center={access <= 1} key={line}>
              {line}
            </DetailStyle>
          ))}
      </HeaderStyle>

      {data.players && data.players.length ? <EventStats event={data} /> : null}
    </ContainerStyle>
  );
}

export default EventDashboard;
