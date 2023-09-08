import React from "react"
import Day from "./Day"
import Loading from "../../common/Loading"
import RawData from "../../common/RawData"
import { DaysContainerStyle } from "../styles/ScheduleStyles"
import { useScheduleQuery, useSettingsQuery, useEventQuery } from "../schedule.fetch"
import { useAccessLevel } from "../../common/common.fetch"

function DaysContainer({ isEditing, openEventModal, isPlan }) {
    // Global state
    const { data: settings,  isLoading: settingsLoad, error: settingsErr } = useSettingsQuery()
    const { data: schedule,  isLoading: schedLoad,    error: schedErr    } = useScheduleQuery(isPlan)
    const { data: eventData, isLoading: eventsLoad,   error: eventsErr   } = useEventQuery()
    const { access } = useAccessLevel()

    // Calculated
    const isLoading = schedLoad || settingsLoad || eventsLoad,
        error       = schedErr  || settingsErr  || eventsErr,
        noData      = isLoading || error || !schedule || !settings || !eventData

    // Render
    return (<>
        <DaysContainerStyle>
            { noData ?
                <Loading loading={isLoading} error={error} altMsg="Unable to reach server"  tagName="h4" />
                
                : schedule.map(({ day, events }) => 
                    <Day
                        key={day}
                        day={day}
                        events={events}
                        eventData={eventData}
                        isEditing={access > 1 && isEditing}
                        isSlotted={Boolean(isPlan ? settings.planslots : settings.dayslots)}
                        setEventModal={openEventModal}
                    />
                )}
        </DaysContainerStyle>

        <RawData data={schedule} />
        <RawData className="text-xs" data={eventData} />
    </>
    )
}

export default DaysContainer
