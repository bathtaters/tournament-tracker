import { useCallback, useMemo } from "react";
import {
  useSetVotersMutation,
  useSetEventsMutation,
  useResetPlanMutation,
} from "../voter.fetch";
import {
  usePlanSettings,
  datePickerToArr,
  serverDatesToArr,
  indexedKeys,
  getPlanned,
} from "./plan.utils";
import {
  useOpenAlert,
  useServerListValue,
  useServerValue,
} from "../../common/common.hooks";
import { plan as config } from "../../../assets/config";
import { resetPlanAlert } from "../../../assets/alerts";

const serverOptions = { throttleDelay: config.updateDelay };

export default function usePlanStartController() {
  const { voters, settings, events, setStatus, updateSettings } =
    usePlanSettings();

  // Date Controller
  const updateServerDates = useCallback(
    (plandates) => updateSettings({ plandates }),
    [updateSettings]
  );
  const [dates, setDates] = useServerListValue(
    serverDatesToArr(settings, settings?.plandates),
    updateServerDates,
    serverOptions
  );
  const { datestart, dateend } = settings;
  const handleDateChange = useCallback(
    (dates) => setDates(datePickerToArr({ datestart, dateend }, dates)),
    [datestart, dateend, setDates]
  );

  // Slot Controller
  const updateServerSlots = useCallback(
    (planslots) => updateSettings({ planslots }),
    [updateSettings]
  );
  const [slots, setSlots] = useServerValue(
    settings?.planslots ?? settings?.dayslots,
    updateServerSlots,
    serverOptions
  );
  const handleSlotChange = useCallback(
    (ev) => setSlots(+ev.target.value),
    [setSlots]
  );

  // Voters Controller
  const sortedVoters = useMemo(() => indexedKeys(voters), [voters]);
  const [setVoters] = useSetVotersMutation();
  const [players, setPlayers] = useServerListValue(
    sortedVoters,
    setVoters,
    serverOptions
  );
  const handlePlayerChange = useCallback(
    (players) => setPlayers(players),
    [setPlayers]
  );

  // Events Controller
  const sortedEvents = useMemo(() => getPlanned(events), [events]);
  const [setEventPlan] = useSetEventsMutation();
  const [planEvents, setEvents] = useServerListValue(
    sortedEvents,
    setEventPlan,
    serverOptions
  );
  const handleEventChange = useCallback(
    (events) => setEvents(events),
    [setEvents]
  );

  // Reset Controller
  const openAlert = useOpenAlert();
  const [resetPlan] = useResetPlanMutation();
  const handleReset = useCallback(
    () => openAlert(resetPlanAlert, 0).then((answer) => answer && resetPlan()),
    [openAlert, resetPlan]
  );

  return {
    settings,
    setStatus,
    dates,
    handleDateChange,
    slots,
    handleSlotChange,
    players,
    handlePlayerChange,
    events: planEvents,
    status: settings?.planstatus,
    handleEventChange,
    handleReset,
  };
}
