import { useEffect, useState } from "react";
import { useGenPlanMutation, useSavePlanMutation } from "../voter.fetch";
import { usePlanSettings } from "./plan.utils";
import { savePlanAlert } from "../../../assets/alerts";
import { planTitle } from "../../../assets/constants";
import { useOpenAlert } from "../../common/common.hooks";

export const planTabs = ["Vote", "View"];
export const finishTabs = ["Results", "Votes"];

export default function usePlanViewController() {
  const {
    voter,
    voters,
    access,
    settings,
    events,
    setStatus,
    isLoading,
    error,
    flashError,
  } = usePlanSettings();

  const [generatePlan] = useGenPlanMutation();
  const [savePlan] = useSavePlanMutation();
  const openAlert = useOpenAlert();

  const handleGenerate = () => generatePlan();

  const handleSave = async () => {
    const answer = await openAlert(savePlanAlert, 0);
    if (answer) savePlan();
  };

  const [tab, selectTab] = useState(!isLoading && access > 2 && !voter ? 1 : 0);
  useEffect(() => {
    if (!isLoading && access > 2 && !voter) selectTab(1);
  }, [isLoading, access, voter]);

  return {
    data: tab === 1 ? voters : voter,
    events,
    settings,

    isLoading,
    error,
    flashError,
    isVoter: access && (access > 2 || voter),

    title: planTitle[settings.planstatus],
    access,
    handleGenerate,
    handleSave,
    setStatus,

    showTabs: Boolean(access && voter && access > 2),
    tab: access > 2 ? tab : 0,
    selectTab,
  };
}
