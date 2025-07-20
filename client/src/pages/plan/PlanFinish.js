import { useState } from "react";
import DaysContainer from "../schedule/components/DaysContainer";
import PlanTabView from "./components/PlanTabView";
import Tabs from "../common/Tabs";
import {
  PlanWrapperStyle,
  PlanTitleStyle,
  PlanFooterStyle,
  PlanButton,
} from "./styles/PlanStyles";
import usePlanViewController, {
  finishTabs,
} from "./services/planVote.controller";
import { planTitle } from "../../assets/constants";

function PlanFinish() {
  const [isExpanded, setExpanded] = useState(false);

  const {
    data,
    events,
    settings,
    access,
    setStatus,
    handleSave,
    showTabs,
    tab,
    selectTab,
  } = usePlanViewController();

  return (
    <PlanWrapperStyle>
      <PlanTitleStyle
        title={planTitle[settings.planstatus]}
        left={
          access > 2 && (
            <PlanButton className="btn-secondary" onClick={setStatus(2)}>
              ← Re-Vote
            </PlanButton>
          )
        }
        right={
          tab === 0 && (
            <PlanButton
              className={isExpanded ? "btn-neutral" : "btn-primary"}
              onClick={() => setExpanded((x) => !x)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </PlanButton>
          )
        }
      />

      {showTabs && (
        <Tabs labels={finishTabs} value={tab} onChange={selectTab} />
      )}

      {tab === 0 && <DaysContainer isPlan={true} expandAll={isExpanded} />}

      {tab === 1 && (
        <PlanTabView
          voters={data}
          events={events}
          settings={settings}
          showScores={showTabs}
        />
      )}

      {access > 2 && (
        <PlanFooterStyle>
          <PlanButton className="btn-error" onClick={handleSave}>
            Save Schedule
          </PlanButton>
        </PlanFooterStyle>
      )}
    </PlanWrapperStyle>
  );
}

export default PlanFinish;
