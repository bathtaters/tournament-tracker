import EyeIcon from '../common/icons/EyeIcon'

export const BasicPlayerNameStyle = ({ player }) => player?.name && (<>
    {player.hide && <EyeIcon isOpen={false} className="w-8 absolute left-2 opacity-80" />}
    <span className={player.hide ? "opacity-80" : ""}>{player.name}</span>
</>)

export const FullPlayerNameStyle = ({ player }) => player?.name && (<>
    <span className={player.hide ? "opacity-80" : ""}>{player.name}</span>
    {player.hide && <EyeIcon isOpen={false} className="w-8 pl-2 inline-block align-middle opacity-80" />}
</>)