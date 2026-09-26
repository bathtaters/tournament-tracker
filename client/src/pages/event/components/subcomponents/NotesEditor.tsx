import { useCallback } from "react";
import {
  NotesWrapperStyle,
  NotesStyle,
  NotesOverlayStyle,
  CharCountStyle,
  EditNotesButton,
} from "../../styles/NoteEditorStyles";
import useTextEditor from "../../services/notesEditor.services";
import { useSetEventMutation } from "../../event.fetch";

import { getLimit } from "../../../../core/services/validation.services";
const charLimit = getLimit("event", "notes").max;

type NotesEditorProps = {
  id: string;
  notes?: string;
};

export default function NotesEditor({ id, notes }: NotesEditorProps) {
  // Save to server
  const [updateEvent, { isLoading }] = useSetEventMutation();
  const saveText = useCallback(
    (text) => updateEvent({ id, notes: text }),
    [id, updateEvent],
  );

  // Setup text editor logic
  const { text, isEdit, ref, onClick, onChange } =
    useTextEditor<HTMLDivElement>(notes, saveText, { charLimit });

  return (
    <NotesWrapperStyle divRef={ref}>
      <NotesOverlayStyle visible={!isEdit} onClick={onClick}>
        {!text && "Click to add notes"}
      </NotesOverlayStyle>

      <CharCountStyle
        visible={isEdit && charLimit - text.length < 12}
      >{`${text.length}/${charLimit}`}</CharCountStyle>

      <EditNotesButton
        onClick={onClick}
        isEdit={isEdit}
        isFetching={isLoading}
      />

      <NotesStyle onChange={onChange} disabled={!isEdit} value={text} />
    </NotesWrapperStyle>
  );
}
