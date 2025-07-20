import DatePicker from "react-tailwindcss-datepicker"
import PlayerEditor from "../eventEditor/components/PlayerEditor"
import EventList from "./components/EventList"
import RangeSelector from "../common/components/InputForm/RangeSelector"
import { PlanWrapperStyle, PlanTitleStyle, PlanRowStyle, InputWrapperStyle, PlanFooterStyle, PlanButton } from "./styles/PlanStyles"
import RawData from "../common/RawData"
import usePlanStartController from "./services/planStart.controller"
import { dateArrToPicker } from "./services/plan.utils"
import { useAccessLevel } from "../common/common.fetch"
import { toDateObj } from "../schedule/services/date.utils"
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
        status, handleReset,
    } = usePlanStartController()

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle title={planTitle[settings?.planstatus]} />

            {status !== 1 && <PlanFooterStyle><PlanButton onClick={setStatus(1)}>Enable Plan</PlanButton></PlanFooterStyle>}

            <PlanRowStyle>
                <InputWrapperStyle label="Date Range">
                    <DatePicker
                        value={dateArrToPicker(dates)}
                        onChange={handleDateChange}
                        minDate={toDateObj(settings.datestart)}
                        maxDate={toDateObj(settings.dateend)}
                        separator="–"
                        displayFormat="MM/DD/YY"
                        inputClassName="input input-primary w-full"
                        containerClassName="relative w-full"
                        disabled={access < 3}
                    />
                </InputWrapperStyle>

                <InputWrapperStyle label="Daily Events">
                    <RangeSelector {...slotLimits} value={slots} onChange={handleSlotChange} disabled={access < 3} />
                </InputWrapperStyle>
            </PlanRowStyle>

            <PlanRowStyle>
                <PlayerEditor type="Voter" value={players} onChange={handlePlayerChange} fillAll={true}  />

                <EventList value={events} onChange={handleEventChange} />
            </PlanRowStyle>

            {access > 2 && 
                <PlanFooterStyle>
                    <PlanButton className="btn-error" onClick={handleReset}>Clear All</PlanButton>
                    {status === 1 && <PlanButton onClick={setStatus(2)}>Start Vote</PlanButton>}
                </PlanFooterStyle>
            }

            <RawData data={{ players }} />
            <RawData data={{ events }} />
            <RawData data={{ ...settings, saved: undefined }} />
        </PlanWrapperStyle>
    )

}


export default PlanStart