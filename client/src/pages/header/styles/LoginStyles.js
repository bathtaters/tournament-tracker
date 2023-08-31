import React from "react";
import { DropdownStyle, MenuLinkStyle, MenuItemStyle, MenuStyle, headerButtonStyle } from "../styles/HeaderStyles";
import { ReactComponent as DefaultProfilePic } from "../../../assets/images/blank-user.svg";
import { defaultPicClass } from "../../profile/styles/ProfileStyles";

export function LoginMenuButton({ src }) {
    return (
        <label tabIndex="0" className={headerButtonStyle}>
            {src ?
                <img className="bg-gray-400 h-full w-auto" src={src} alt="User menu" />
                :
                <DefaultProfilePic className={defaultPicClass} />
            }
        </label>
    );
}

const MenuLoading = () => <i className="opacity-50"><MenuLinkStyle text="Hang on..." /></i>;

export function LoginMenuStyle({ loading, onSubmit, children }) {
    return (
        <DropdownStyle isRight={true}>
            <LoginMenuButton />

            <MenuStyle onSubmit={onSubmit}>
                {loading ? <MenuLoading /> : children}
            </MenuStyle>
        </DropdownStyle>
    );
}

export function DropdownInput({ label, props }) {
    return (
        <MenuItemStyle>
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
        <MenuItemStyle>
            <button className="btn btn-primary content-center w-full h-full" type={onClick ? "button" : "submit"} onClick={onClick}>
                {children}
            </button>
        </MenuItemStyle>
    );
}

export { MenuLinkStyle };