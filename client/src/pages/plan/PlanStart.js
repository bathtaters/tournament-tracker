import React from "react"
import DatePicker from "react-tailwindcss-datepicker"
import PlayerEditor from "../eventEditor/components/PlayerEditor"
import EventList from "./components/EventList"
import { PlanWrapperStyle, PlanTitleStyle, PlanRowStyle, InputWrapperStyle, PlanFooterStyle, PlanButton } from "./styles/PlanStyles"
import { RangeInputStyle } from "./styles/PlanStartStyles"
import usePlanStart from "./services/planStart.service"
import { dateArrToPicker } from "./services/dates.services"
import { useAccessLevel } from "../common/common.fetch"
import { planTitle } from "../../assets/constants"

import { getLimit } from "../../core/services/validation.services"
const slotLimits = getLimit('settings', 'planslots')
if (!slotLimits.min) slotLimits.min = 1


function PlanStart() {
    const { access } = useAccessLevel()
    const {
        settings, setStatus,
        dates, handleDateChange,
        slots, handleSlotChange,
        players, handlePlayerChange,
        events, handleEventChange,
    } = usePlanStart()

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle title={planTitle[settings?.planstatus]} />
            
            <PlanRowStyle>
                <InputWrapperStyle label="Date Range">
                    <DatePicker
                        value={dateArrToPicker(dates)}
                        onChange={handleDateChange}
                        minDate={settings?.datestart}
                        maxDate={settings?.dateend}
                        separator="–"
                        displayFormat="MM/DD/YY"
                        inputClassName="input input-primary w-full"
                        containerClassName="relative w-full"
                    />
                </InputWrapperStyle>

                <InputWrapperStyle label="Daily Events" subLabel={slots}>
                    <RangeInputStyle {...slotLimits} value={slots} onChange={handleSlotChange} />
                </InputWrapperStyle>
            </PlanRowStyle>

            <PlanRowStyle>
                <PlayerEditor type="Voter" value={players.sort()} onChange={handlePlayerChange} fillAll={true}  />

                <EventList value={events.sort()} onChange={handleEventChange} />
            </PlanRowStyle>

            {access > 2 && 
                <PlanFooterStyle>
                    <PlanButton onClick={setStatus(2)}>Start Vote</PlanButton>
                </PlanFooterStyle>
            }
        </PlanWrapperStyle>
    )

}


export default PlanStart