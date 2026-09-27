import type { MouseEventHandler } from "react";

type EditRoundProps = {
  roundNum: number;
  isEditing: boolean;
  showEdit: boolean;
  setEditing: (isEditing: boolean) => void;
  deleteRound?: MouseEventHandler<HTMLSpanElement>;
};

export default function EditRound({
  roundNum,
  isEditing,
  showEdit,
  setEditing,
  deleteRound,
}: EditRoundProps) {
  // Editing Round
  if (isEditing)
    return (
      <>
        <span
          className="link link-hover link-secondary"
          onClick={() => setEditing(false)}
        >
          Back
        </span>

        {showEdit && deleteRound && (
          <>
            <span className="mx-1">/</span>
            <span
              className="link link-hover link-secondary"
              onClick={deleteRound}
            >
              Delete
            </span>
          </>
        )}
      </>
    );

  // Edit Round Button
  if (showEdit)
    return (
      <span
        className="link link-hover link-secondary"
        onClick={() => setEditing(true)}
      >
        {"Edit Round " + (roundNum + 1)}
      </span>
    );

  // Neither
  return null;
}
