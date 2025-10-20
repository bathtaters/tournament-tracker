import type { MouseEventHandler } from "react";
import type { EventData, Team } from "types/models";
import type { FormButton, FormLayout } from "common/InputForm/InputForm.d";
import { enums } from "../../assets/validation";
import { getDefault } from "core/services/validation.services";

// Settings Window Layout/Validation
const lockAt = (statusVal: number) => (data?: { status?: number }) =>
  data?.status != null && data?.status >= statusVal;

// Layout object for InputForm
export const editorLayout = (hidePlayers: boolean): FormLayout<EventData> => [
  hidePlayers
    ? [
        {
          label: "Player Count",
          id: "playercount",
          type: "number",
          disabled: lockAt(2),
        },
        {
          label: "Team Event?",
          id: "isteam",
          type: "checkbox",
          disabled: lockAt(2),
        },
        {
          label: "Team Size",
          id: "teamsize",
          type: "number",
          disabled: lockAt(2),
          hidden: ({ isteam }) => !isteam,
        },
      ]
    : "custom",
  [
    {
      label: "Title",
      id: "title",
      type: "text",
      required: true,
      labelClass: "font-normal",
      inputClass: "input-md",
      setValueAs: (title: string) =>
        title.trim() || getDefault("event", "title"),
    },
    {
      label: "Event Format",
      id: "format",
      type: enums.EventFormat,
      defaultValue: "MONRAD",
      disabled: lockAt(2),
    },
    {
      label: "Total Rounds",
      id: "roundcount",
      type: "number",
      disabled: lockAt(3),
      min: (data) => data?.roundactive,
    },
    {
      label: "Team Pairing",
      id: "team",
      type: { "": "No Teams", ...enums.TeamType },
      defaultValue: "",
      disabled: lockAt(2),
    },
    {
      label: "Wins Needed",
      id: "wincount",
      type: "number",
      disabled: lockAt(2),
    },
    {
      label: "Players per Game",
      id: "playerspermatch",
      type: "number",
      disabled: lockAt(2),
    },
    {
      label: "Event URL",
      id: "link",
      type: "url",
      labelClass: "text-sm",
      inputClass: "input-sm",
    },
    {
      label: "Round Timer",
      id: "clocklimit",
      type: "time",
    },
  ],
];

export const editorButtonLayout = (
  id: string | null,
  clickDelete: MouseEventHandler<HTMLInputElement>,
  clickCancel: MouseEventHandler<HTMLInputElement>,
): FormButton[] => {
  const base = id
    ? [
        {
          label: "Delete",
          onClick: clickDelete,
          className: "font-normal btn-error mx-1 sm:mx-4",
        },
      ]
    : [];
  return [...base, { label: "Cancel", onClick: clickCancel }];
};

export const teamEditorLayout: FormLayout<Team> = [
  {
    id: "name",
    label: "Name",
    inputClass: "w-full",
    labelClass: "font-light pb-2 w-full",
    isFragment: true,
  },
  "custom",
];
