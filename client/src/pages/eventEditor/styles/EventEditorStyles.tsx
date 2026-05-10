import { ModalTitleStyle } from "../../../common/General/styles/CommonStyles";
import { statusInfo } from "../../../assets/constants";

export function TitleStyle({ title }: { title: string }) {
  return <ModalTitleStyle>{title}</ModalTitleStyle>;
}

export function StatusStyle({ status }: { status: number }) {
  return (
    <h5 className="text-center mb-2">
      <span className="mr-1">Status:</span>
      <span className={"badge badge-lg " + statusInfo[status].badge}>
        {statusInfo[status].label}
      </span>
    </h5>
  );
}
