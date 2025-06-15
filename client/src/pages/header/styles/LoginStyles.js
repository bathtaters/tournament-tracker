import React from "react";
import { DropdownStyle, MenuStyle, MenuLinkStyle, MenuItemStyle, headerButtonStyle } from "./MenuStyles";
import { defaultPicClass } from "../../profile/styles/ProfileStyles";
import { ReactComponent as DefaultProfilePic } from "../../../assets/images/blank-user.svg";

export function LoginMenuButton({ initial, src }) {
    return (
        <label tabIndex="0" className={`relative ${headerButtonStyle}`}>
            {src ?
                <img className="bg-gray-400 h-full w-auto" src={src} alt="User menu" />
                :
                <>
                    <DefaultProfilePic className={defaultPicClass} />
                    <div className="absolute font-thin text-sm w-full top-[10%]">{initial}</div>
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

export function MenuCreditsStyle({ value }) {
    return (
      <MenuItemStyle lessPadding={true}>
        <div className="text-base px-3 cursor-auto">
          <span className="mr-2">Credits:</span>
          <span className="font-light">{typeof value === 'number' ? value : '-'}</span>
        </div>
      </MenuItemStyle>
    );
  }

export function DropdownInput({ label, props }) {
    return (
        <MenuItemStyle lessPadding={true}>
            <input
                className="input input-ghost bg-base-200"
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