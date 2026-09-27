import { useEffect, useState } from "react";
import { useGenPlanMutation, useSavePlanMutation } from "../voter.fetch";
import { usePlanSettings } from "./plan.utils";
import { savePlanAlert } from "../../../assets/alerts";
import { planTitle } from "../../../assets/constants";
import { useOpenAlert } from "../../../common/General/common.hooks";

export const planTabs = ["Vote", "View"];
export const finishTabs = ["Results", "Votes"];

export default function usePlanViewController(isFinished = false) {
  const {
    voter,
    voters,
    access,
    settings,
    events,
    setStatus,
    isLoading,
    error,
    planerror,
  } = usePlanSettings();

  const [generatePlan] = useGenPlanMutation();
  const [savePlan] = useSavePlanMutation();
  const openAlert = useOpenAlert();

  const handleGenerate = () => generatePlan(undefined);

  const handleSave = async () => {
    const answer = await openAlert(savePlanAlert, 0);
    if (answer) savePlan(undefined);
  };

  const [tab, selectTab] = useState(
    !isLoading && !isFinished && access > 2 && !voter ? 1 : 0,
  );
  useEffect(() => {
    if (!isLoading && !isFinished && access > 2 && !voter) selectTab(1);
  }, [isLoading, isFinished, access, voter]);

  return {
    data: tab === 1 ? voters : voter,
    events,
    settings,

    isLoading,
    error,
    planerror,
    isVoter: access && (access > 2 || voter),

    title: planTitle[settings.planstatus],
    access,
    handleGenerate,
    handleSave,
    setStatus,

    showTabs: Boolean(access && (voter || isFinished) && access > 2),
    tab: access > 2 ? tab : 0,
    selectTab,
  };
}
