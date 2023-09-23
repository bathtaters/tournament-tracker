import { playerExists, randomArray } from "./playerEditor.utils"
import { usePlayerQuery, useSettingsQuery, useCreatePlayerMutation } from "../eventEditor.fetch"
import { useOpenAlert, useLockScreen } from "../../common/common.hooks"
import { createLockCaption } from "../../../assets/constants"
import { createItemAlert, duplicateItemAlert, itemCreateError } from "../../../assets/alerts"


export default function usePlayerEditorController(type, onChange, fillAll) {
    
    // Load DB
    const { data: settings } = useSettingsQuery()
    const query = usePlayerQuery()
    const [ createPlayerMutation, { isLoading: isAddingPlayer } ] = useCreatePlayerMutation()

    // Init globals
    const openAlert = useOpenAlert()
    useLockScreen(isAddingPlayer, createLockCaption(type))
    
    // Add new player to DB
    const createPlayer = async (name) => {
        // Check for errors
        if (!name.trim()) return false
        if (playerExists(name, query.data)) return openAlert(duplicateItemAlert(type, name))

        // Confirm create
        const answer = await openAlert(createItemAlert(type, name),0)
        if (!answer) return false

        // Create & Push player
        const playerData = { name }
        const result = await createPlayerMutation(playerData)
        if (result?.error || !result?.data?.id) throw itemCreateError(type, result, playerData)
        return result.data
    }
    
    return {
        query,

        autofill: {
            label: fillAll ?
                `Fill ${query.data ? Object.keys(query.data).length : 'All'}` :
                `Random ${settings?.autofillsize || ''}`,

            onClick: fillAll ? 
                () => onChange(Object.keys(query.data))
                : settings?.autofillsize && (() => {
                    onChange(randomArray(Object.keys(query.data), settings?.autofillsize))
                }),
        },

        create: {
            label: 'Add player...',
            mutation: createPlayer,
            hideOnEmpty: true,
        }
    }
}
