import { useCallback, useEffect, useState } from "react";
import { boxIDs, dragType } from "../../../assets/constants";
import { arrayPad, insert, swap } from "./plan.utils";

// Constants
export const dataType = dragType.vote


// Drag & Drop tester
export const canDrop = (type, a, b) => type === dataType && a.id !== b.id && (a.boxId !== boxIDs.UNRANKED || a.boxId !== b.boxId)


// Drag controller
export function useRankState(eventList) {

    const [ ranked, setRanked ] = useState([])

    useEffect(() => { setRanked((ranked) => arrayPad(ranked, eventList.length)) }, [eventList.length, setRanked])

    // from/to form: {id, boxId, slot}
    return [
        ranked,

        useCallback(
            (from, to) => {
                if (from.boxId === to.boxId) {
                    to.boxId === boxIDs.RANKED && setRanked((ranked) => swap(ranked, [from.slot, to.slot]))
                    return;
                }
                
                setRanked((ranked) => to.boxId === boxIDs.RANKED ?
                    insert(ranked, to.slot, from.id) :
                    insert(ranked, from.slot, null)
                )
            },
            [setRanked]
        ),
    ]

}
