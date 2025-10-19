import type { Player } from "types/models";
import EyeIcon from "../../common/icons/EyeIcon";

type NameProps = Partial<Pick<Player, "name" | "hide">>;

export const BasicPlayerNameStyle = ({ data }: { data: NameProps }) =>
  data?.name && (
    <>
      {data.hide && (
        <EyeIcon isOpen={false} className="w-8 absolute left-2 opacity-80" />
      )}
      <span className={data.hide ? "opacity-80" : ""}>{data.name}</span>
    </>
  );

export const FullPlayerNameStyle = ({ data }: { data: NameProps }) =>
  data?.name && (
    <>
      <span className={data.hide ? "opacity-80" : ""}>{data.name}</span>
      {data.hide && (
        <EyeIcon
          isOpen={false}
          className="w-8 pl-2 inline-block align-middle opacity-80"
        />
      )}
    </>
  );
