import React from "react";
import { DropdownStyle, MenuLinkStyle, MenuItemStyle, MenuStyle, headerButtonStyle } from "../styles/HeaderStyles";
import { ReactComponent as DefaultProfilePic } from "../../../assets/images/blank-user.svg";
import { defaultPicClass } from "../../profile/styles/ProfileStyles";

export function LoginMenuButton({ initial, src }) {
    return (
        <label tabIndex="0" className={`relative ${headerButtonStyle}`}>
            {src ?
                <img className="bg-gray-400 h-full w-auto" src={src} alt="User menu" />
                :
                <>
                    <DefaultProfilePic className={defaultPicClass} />
                    <div className="absolute font-thin text-sm top-[0.45rem]">{initial}</div>
                </>
            }
        </label>
    );
}

const MenuLoading = () => <MenuItemStyle disabled={true}>Hang on...</MenuItemStyle>;

export function LoginMenuStyle({ loading, onSubmit, initial, children }) {
    return (
        <DropdownStyle isRight={true}>
            <LoginMenuButton initial={initial} />

            <MenuStyle onSubmit={onSubmit}>
                {loading ? <MenuLoading /> : children}
            </MenuStyle>
        </DropdownStyle>
    );
}

export function DropdownInput({ label, props }) {
    return (
        <MenuItemStyle lessPadding={true}>
            <input
                className="input w-full"
                placeholder={label}
                type={label === "Password" ? "password" : "text"}
                {...props}
            />
        </MenuItemStyle>
    );
}

export function DropdownButton({ children, onClick }) {
    return (
        <MenuItemStyle lessPadding={true}>
            <button className="btn btn-primary content-center w-full h-full" type={onClick ? "button" : "submit"} onClick={onClick}>
                {children}
            </button>
        </MenuItemStyle>
    );
}

export { MenuLinkStyle };