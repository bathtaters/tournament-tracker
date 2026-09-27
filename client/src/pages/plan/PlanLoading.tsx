import React from "react";
import { LoadingWrapper } from "../../common/Loading/LoadingStyle";
import {
  PlanWrapperStyle,
  PlanTitleStyle,
  PlanButton,
  PlanErrorStyle,
} from "./styles/PlanStyles";
import { usePlanSettings } from "./services/plan.utils";
import { planTitle } from "../../assets/constants";

function PlanLoading() {
  const { progress, access, settings, setStatus, planerror } =
    usePlanSettings(true);

  return (
    <PlanWrapperStyle>
      <PlanTitleStyle
        title={planTitle[settings.planstatus]}
        left={
          access > 2 && (
            <PlanButton className="btn-error" onClick={setStatus(2)}>
              ← Cancel
            </PlanButton>
          )
        }
      />

      {planerror ? (
        <PlanErrorStyle>Planning error: {planerror}</PlanErrorStyle>
      ) : (
        <LoadingWrapper progress={progress}>
          This make take a while. Or not, who knows.
        </LoadingWrapper>
      )}
    </PlanWrapperStyle>
  );
}

export default PlanLoading;
