import type { MatchData } from "types/models";
import Counter from "../../../common/Counter/Counter";
import { ByeStyle, winClass, WinsSeparator } from "../styles/CounterStyles";
import { ClearReportButton, ReportButton } from "../styles/ButtonStyles";
import { IncompleteStyle } from "../styles/ReportStyles";
import { winValue } from "../services/match.services";

type WinsBoxProps = {
  matchData: MatchData;
  wincount: number;
  index: number;
  isEditing: boolean;
  setVal: (key: string) => (value: number) => any;
};

type MatchWinsProps = Omit<WinsBoxProps, "index"> & {
  clearReport: () => any;
  openReport: () => any;
  showReport: boolean;
};

function MatchWins({
  matchData,
  wincount,
  isEditing,
  clearReport,
  setVal,
  openReport,
  showReport,
}: MatchWinsProps) {
  if (!matchData.reported)
    return showReport ? (
      <ReportButton disabled={isEditing} onClick={openReport} />
    ) : (
      <IncompleteStyle />
    );

  return (
    <>
      {matchData.players.map((id, index) => (
        <WinsBox
          matchData={matchData}
          wincount={wincount}
          index={index}
          isEditing={isEditing}
          setVal={setVal}
          key={id + ".w"}
        />
      ))}
      {isEditing && <ClearReportButton onClick={clearReport} />}
    </>
  );
}

// Each win counter
function WinsBox({
  matchData,
  wincount,
  index,
  isEditing,
  setVal,
}: WinsBoxProps) {
  if (matchData.players?.length === 1 && !isEditing)
    return <ByeStyle>Bye</ByeStyle>;

  return (
    <>
      <WinsSeparator visible={!!index} />

      <Counter
        isEditing={isEditing}
        maxVal={wincount}
        setVal={setVal("wins." + index)}
        val={winValue(matchData.wins, index)}
        className={winClass(
          matchData.wins && matchData.wins[index],
          isEditing,
          matchData,
        )}
      />
    </>
  );
}

export default MatchWins;
