import type { EventData } from "types/models";
import { useState } from "react";
import { useEventQuery } from "../voter.fetch";
import { useSetEventMutation } from "../../eventEditor/eventEditor.fetch";
import { createItemAlert, itemCreateError } from "../../../assets/alerts";
import {
  useLockScreen,
  useOpenAlert,
} from "../../../common/General/common.hooks";
import { createLockCaption } from "../../../assets/constants";
import { useModal } from "../../../common/Modal/Modal";

export default function useEventList(
  value: EventData["id"][],
  onChange: (ids: EventData["id"][]) => void,
) {
  // Event Editor modal
  const { backend, open, close, lock } = useModal();
  const [editId, setEditId] = useState<EventData["id"] | null>(null);

  // Load DB
  const query = useEventQuery();
  const [createEventMutation, { isLoading: isAddingEvent }] =
    useSetEventMutation();

  // Init globals
  const openAlert = useOpenAlert();
  useLockScreen(isAddingEvent, createLockCaption("Event"));

  // Add new event to DB
  const createEvent = async (title: string) => {
    // Check for errors
    if (!title.trim()) return false;

    // Confirm create
    const answer = await openAlert(createItemAlert("Event", title), 0);
    if (!answer) return false;

    // Create & Push event
    const eventData = { title };
    const result = await createEventMutation(eventData);
    if (result?.error || !result?.data?.id)
      throw itemCreateError("Event", result, { name: title });
    return result.data;
  };

  const filter = ({ status }: EventData) => status < 2;

  return {
    editId,
    backend,
    lock,
    close,

    listProps: {
      value,
      onChange,
      query,
      filter,
      displayValue: "title",

      onClick: (id: EventData["id"]) => () => {
        setEditId(id);
        open();
      },

      autofill: {
        label: `Fill ${query.data ? Object.values(query.data).filter(filter).length : "All"}`,
        onClick: () => {
          onChange(
            Object.keys(query.data).filter((id) => filter(query.data[id])),
          );
        },
      },

      create: {
        label: "Add New...",
        mutation: createEvent,
        hideOnEmpty: true,
      },
    },
  };
}
