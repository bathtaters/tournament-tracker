import { useCallback } from "react";
import { boxIDs, dragType } from "../../../assets/constants";
import { arrInsert, arrRemove, arrShift, arrSwap, trimFalsy } from "./plan.utils";
import { useServerListValue } from "../../common/common.hooks";
import { plan as config } from "../../../assets/config"

// Constants
export const dataType = dragType.vote


// Drag & Drop tester
export const canDrop = (type, a, b) => type === dataType && a.id !== b.id && (a.boxId !== boxIDs.UNRANKED || a.boxId !== b.boxId)


// Drag controller
export function useRankState(voter, updateVoter) {

    const [ ranked, setRanked ] = useServerListValue(
        voter?.events,
        (events) => updateVoter({ id: voter?.id, events }),
        { throttleDelay: config.updateDelay }
    )

    // from/to form: {id, boxId, slot}
    const handleDrop = useCallback(
        (from, to) => {
            if (from.boxId === to.boxId) {
                to.boxId === boxIDs.RANKED && setRanked((ranked) => arrSwap(ranked, [from.slot, to.slot]))
                return;
            }
            
            setRanked((ranked) => to.boxId === boxIDs.RANKED ?
                arrInsert(ranked, to.slot, from.id) :
                arrRemove(ranked, from.slot)
            )
        },
        [setRanked]
    )
    
    // idx of -1 means unranked, shift of 0 means move to unranked (otherwise expect +1/-1)
    const handleClick = useCallback(
        (ev, id, idx, shift = 0) => {
            ev.stopPropagation()
            if (idx === -1) return setRanked((ranked) => ranked.concat(id))
            if (shift === 0) return setRanked((ranked) => trimFalsy(ranked.filter((event) => event !== id)))
            setRanked((ranked) => arrShift(ranked, idx, shift < 0))
        },
        [setRanked]
    )

    return {
        ranked,
        handleDrop,
        handleClick,
    }

}
