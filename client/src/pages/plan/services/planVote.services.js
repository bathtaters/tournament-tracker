import { useCallback } from "react";
import { boxIDs, dragType } from "../../../assets/constants";
import { arrInsert, arrRemove, arrSwap } from "./plan.utils";
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
    return [
        ranked,

        useCallback(
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
        ),
    ]

}
