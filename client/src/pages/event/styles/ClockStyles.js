import React, { Fragment } from "react"
import ClockIcon from "../../common/icons/ClockIcon"
import ReloadIcon from "../../common/icons/ReloadIcon"
import { PauseIcon, PlayIcon } from "../../common/icons/PausePlayIcons"

export const buttonIcons = {
    run: <PlayIcon className="fill-primary-content" />,
    pause: <PauseIcon className="fill-primary-content" />,
    reset: <ReloadIcon className="fill-primary-content" />,
}

export const ClockWrapper = ({ isRed, children }) => (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-center ${
        isRed ? 'bg-error text-error-content' : 'bg-secondary text-secondary-content'
    } rounded-box p-2 text-xs md:text-base`}>
      <ClockIcon className="w-5 fill-current" />
      {children}
    </div>
)

export const ButtonsWrapper = ({ children }) => (
    <div className="grid grid-cols-2 gap-2 m-2">{children}</div>
)

export const ClockStyle = ({ timer, paused }) => (
    <span className={`countdown font-mono text-2xl md:text-4xl ${paused ? 'animate-pulse-pause' : 'opacity-80'}`}>
        { timer.map((value, idx) => (<Fragment key={`${idx}num`}>
            {idx !== 0 && ":"}
            <span style={{"--value":value}} />
        </Fragment>)) }
    </span>
)

export const ButtonStyle = ({ icon, ...props }) => (
    <button type="button" className="btn btn-square btn-sm md:btn-md btn-primary" {...props}>
        {icon}
    </button>
)
