import { Modal } from "pages/common/Modal";
import Counter from "pages/common/Counter";
import RawData from "pages/common/RawData";
import Loading from "pages/common/Loading";

import MatchPlayer from "./components/MatchPlayer";
import MatchWins from "./components/MatchWins";
import Report from "./components/Report";
import { MatchStyle, PlayerStyle } from "./styles/MatchStyles";
import { drawsClass, DrawsStyle, WinsStyle } from "./styles/CounterStyles";

import { formatDraws } from "./services/match.services";
import useMatchController from "./services/match.controller";
import reportLayout from "./report.layout";

type MatchProps = {
  matchId?: string;
  eventid?: string;
  wincount?: number;
  isEditing: boolean;
};

export default function Match({
  eventid,
  matchId,
  wincount,
  isEditing,
}: MatchProps) {
  // Get component data
  const {
    matchData,
    rankings,
    players,
    showRaw,
    title,
    reportModal,
    showReport,
    setVal,
    clearReport,
    report,
    swapProps,
    maxDraws,
    showLoading,
    error,
  } = useMatchController(eventid, matchId);

  // Loading/Error catcher
  if (showLoading)
    return (
      <MatchStyle>
        <Loading error={error} altMsg=". . ." className="m-auto text-xs" />
      </MatchStyle>
    );

  // Render component
  return (
    <MatchStyle showRaw={showRaw}>
      <PlayerStyle>
        {matchData.players.map((playerid: string, index: number) => (
          <MatchPlayer
            key={playerid}
            id={playerid}
            index={index}
            playerData={players[playerid]}
            record={rankings?.[playerid]?.matchRecord}
            isEditing={isEditing}
            {...swapProps}
          />
        ))}
      </PlayerStyle>

      {matchData.reported && (
        <DrawsStyle
          hidden={!isEditing && (!matchData.draws || matchData.isbye)}
        >
          <Counter
            className={drawsClass(isEditing)}
            isEditing={isEditing}
            maxVal={maxDraws}
            suffix={formatDraws}
            setVal={setVal("draws")}
            val={+(matchData.draws ?? 0)}
          />
        </DrawsStyle>
      )}

      <WinsStyle>
        <MatchWins
          matchData={matchData}
          wincount={wincount}
          isEditing={isEditing}
          clearReport={clearReport}
          setVal={setVal}
          openReport={reportModal.open}
          showReport={showReport}
        />
      </WinsStyle>

      <RawData className="text-xs w-80 m-auto" data={matchData} />

      <Modal backend={reportModal.backend}>
        <Report
          title={title}
          match={matchData}
          report={report}
          layout={reportLayout(matchData.players, players, wincount)}
          lock={reportModal.lock}
          close={reportModal.close}
        />
      </Modal>
    </MatchStyle>
  );
}
