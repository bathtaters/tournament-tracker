import React, { useMemo } from "react";
import EventStats from "./EventStats";
import { statusInfo } from "../../../assets/constants";
import { EditEventButton } from "../styles/ButtonStyles";
import {
  ContainerStyle,
  HeaderStyle,
  ValueStyle,
  DetailStyle,
} from "../styles/DashboardStyles";

import { useAccessLevel } from "../../common/common.fetch";

function EventDashboard({ data, openStats }) {
  const { access } = useAccessLevel();

  const headerValue =
    data.status === 2
      ? "Round " + data.roundactive
      : statusInfo[data?.status ?? 0].label;

  const headerDetail = useMemo(
    () =>
      data
        ? `${data.playerspermatch}-Player, ${data.roundcount} Rounds, Best of ${(data.wincount ?? 0) * 2 - 1}`
        : "",
    // eslint-disable-next-line
    [data?.playerspermatch, data?.roundcount, data?.wincount]
  );

  return (
    <ContainerStyle>
      <HeaderStyle>
        {access > 1 && <EditEventButton onClick={openStats} />}

        <ValueStyle center={access <= 1}>{headerValue}</ValueStyle>

        {data.playerspermatch && data.wincount && (
          <DetailStyle center={access <= 1}>{headerDetail}</DetailStyle>
        )}
      </HeaderStyle>

      {data.players && data.players.length ? <EventStats event={data} /> : null}
    </ContainerStyle>
  );
}

export default EventDashboard;
