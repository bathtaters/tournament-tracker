import type { ChangeEvent } from "react";
import type { EventData } from "types/models";
import { useCallback, useMemo } from "react";
import {
  useResetPlanMutation,
  useSetEventsMutation,
  useSetVotersMutation,
} from "../voter.fetch";
import {
  datePickerToArr,
  getPlanned,
  indexedKeys,
  serverDatesToArr,
  usePlanSettings,
} from "./plan.utils";
import { useAccessLevel } from "../../../common/General/common.fetch";
import {
  useOpenAlert,
  useServerListValue,
  useServerValue,
} from "../../../common/General/common.hooks";
import { plan as config } from "../../../assets/config";
import { resetPlanAlert } from "../../../assets/alerts";

import { getLimit } from "../../../core/services/validation.services";

const slotLimits = { ...getLimit("settings", "planslots") };
if (!slotLimits.min) slotLimits.min = 1;

const serverOptions = { throttleDelay: config.updateDelay };

export default function usePlanStartController() {
  const { voters, settings, events, setStatus, updateSettings } =
    usePlanSettings();
  const { access } = useAccessLevel();

  // Date Controller
  const updateServerDates = useCallback(
    (plandates: string[]) => updateSettings({ plandates }),
    [updateSettings],
  );
  const [dates, setDates] = useServerListValue(
    serverDatesToArr(settings, settings?.plandates),
    updateServerDates,
    serverOptions,
  );
  const { datestart, dateend } = settings;
  const handleDateChange = useCallback(
    (dates: { startDate?: Date; endDate?: Date }) =>
      setDates(datePickerToArr({ datestart, dateend }, dates)),
    [datestart, dateend, setDates],
  );

  // Slot Controller
  const updateServerSlots = useCallback(
    (planslots: number) => updateSettings({ planslots }),
    [updateSettings],
  );
  const [slots, setSlots] = useServerValue(
    settings?.planslots ?? settings?.dayslots,
    updateServerSlots,
    serverOptions,
  );
  const handleSlotChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => setSlots(+ev.target.value),
    [setSlots],
  );
  const slotProps = {
    ...slotLimits,
    value: slots,
    onChange: handleSlotChange,
    disabled: access < 3,
  };

  // Voters Controller
  const sortedVoters = useMemo(() => indexedKeys(voters), [voters]);
  const [setVoters] = useSetVotersMutation();
  const [players, setPlayers] = useServerListValue(
    sortedVoters,
    setVoters,
    serverOptions,
  );
  const handlePlayerChange = useCallback(
    (players: string[]) => setPlayers(players),
    [setPlayers],
  );

  // Events Controller
  const sortedEvents = useMemo(() => getPlanned(events), [events]);
  const [setEventPlan] = useSetEventsMutation();
  const [planEvents, setEvents] = useServerListValue(
    sortedEvents,
    setEventPlan,
    serverOptions,
  );
  const handleEventChange = useCallback(
    (events: EventData["id"][]) => setEvents(events),
    [setEvents],
  );

  // Reset Controller
  const openAlert = useOpenAlert();
  const [resetPlan] = useResetPlanMutation();
  const handleReset = useCallback(
    () =>
      openAlert(resetPlanAlert, 0).then(
        (answer) => answer && resetPlan(undefined),
      ),
    [openAlert, resetPlan],
  );

  return {
    access,
    settings,
    setStatus,
    dates,
    handleDateChange,
    slotProps,
    players,
    handlePlayerChange,
    events: planEvents,
    status: settings?.planstatus,
    handleEventChange,
    handleReset,
  };
}
