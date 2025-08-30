import ReloadIcon from "common/icons/ReloadIcon";
import { reloadingClass } from "../styles/HeaderStyles";
import {
  useFetchingProvider,
  useForceRefetch,
} from "common/General/common.fetch";

type ReloadButtonProps = {
  force?: boolean;
  size?: number;
  weight?: number;
  hideBgd?: number;
  color?: string;
  className?: string;
};

export default function ReloadButton(props: ReloadButtonProps) {
  // Check for active queries
  const _isFetching = useFetchingProvider(); // setup isFetching global
  const isFetching = props.force ?? _isFetching;

  // Force refetch of all data
  const forceRefetch = useForceRefetch();

  return (
    <button
      type="button"
      className="flex flex-row justify-between items-center w-full"
      disabled={isFetching}
      onClick={forceRefetch}
    >
      <span>Refresh</span>
      <ReloadIcon className={isFetching ? reloadingClass : ""} />
    </button>
  );
}
