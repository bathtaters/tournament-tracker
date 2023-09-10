import React from "react"
import ReloadButton from "./ReloadButton"
import { DropdownStyle, MenuStyle, MenuLinkStyle, headerButtonStyle, MenuItemStyle } from "../styles/MenuStyles"
import MenuIcon from "../../common/icons/MenuIcon"
import SettingsIcon from "../../common/icons/SettingsIcon"
import { usePlanSettings } from "../../plan/services/plan.utils"


function MainMenu({ modal }) {
    const { access, settings, voter } = usePlanSettings(true)

    const planIsVisible = access > 2 || Boolean(
        settings?.planmenu && settings.planstatus && 
            (settings.planstatus === 2 ? access && voter : settings.planstatus > 2 || access === 2)
    )

    return (
        <DropdownStyle>
            <MenuIcon className={headerButtonStyle} />

            <MenuStyle>
                { planIsVisible && <MenuLinkStyle to="/plan">Plan</MenuLinkStyle> }

                <MenuLinkStyle to="/home">Schedule</MenuLinkStyle>

                <MenuLinkStyle to="/players">Players</MenuLinkStyle>

                <MenuItemStyle><ReloadButton /></MenuItemStyle>

                {access > 2 && <MenuLinkStyle onClick={() => modal.current.open()}>Settings <SettingsIcon /></MenuLinkStyle>}
            </MenuStyle>
        </DropdownStyle>
    )
}

export default MainMenu