import type { MouseEventHandler, ReactNode } from "react";
import EditIcon from "../../../common/icons/EditIcon";
import { Modal } from "../../../common/Modal/Modal";

export type ModalBackend = {
  isOpen: boolean;
  isLocked: boolean;
  close: (overrideLock?: boolean) => void;
  closeWithMsg: () => void;
};

export const TeamCreatorModalStyle = ({
  backend,
  children,
}: {
  backend: ModalBackend;
  children?: ReactNode;
}) => (
  <Modal backend={backend} className="min-h-5/6 flex">
    <div className="w-full h-auto flex flex-col">{children}</div>
  </Modal>
);

export const TeamEditorContainer = ({
  title,
  counter,
  children,
}: {
  title?: string;
  counter?: number;
  children?: ReactNode;
}) => (
  <div className="w-full flex flex-col">
    <div className="label font-light mb-2">
      {title && `${title}${typeof counter !== "number" ? "" : ` (${counter})`}`}
    </div>
    {children}
  </div>
);

export const TeamListWrapper = ({ children }: { children?: ReactNode }) => (
  <div className="flex flex-col grow">{children}</div>
);

export const TeamListRowContainer = ({
  disable,
  onClick,
  children,
}: {
  disable?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <EditTeamButton disable={disable} onClick={onClick} />
    <div className="flex flex-col">{children}</div>
  </div>
);

export const TeamRowTitleStyle = ({ children }: { children?: ReactNode }) => (
  <h4 className="text-primary-content">{children}</h4>
);
export const TeamRowSubtitleStyle = ({
  children,
}: {
  children?: ReactNode;
}) => (
  <span className="text-sm text-base-content/80 font-light -mt-1">
    {children}
  </span>
);

export const AddTeamButton = ({
  children,
  onClick,
}: {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) =>
  onClick && (
    <button
      type="button"
      className="btn btn-success block m-2"
      onClick={onClick}
    >
      {children}
    </button>
  );

export const EditTeamButton = ({
  disable,
  onClick,
}: {
  disable?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) =>
  disable ? (
    <span className="mx-1 py-2 text-[1.5em] align-middle">⏺</span>
  ) : (
    <button
      type="button"
      className="btn btn-xs sm:btn-sm btn-square btn-error m-1"
      onClick={onClick}
      disabled={!onClick}
    >
      <EditIcon className="h-3 sm:h-4 w-auto stroke-current fill-current" />
    </button>
  );
