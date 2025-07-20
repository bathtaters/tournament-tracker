import FooterStyle from "./FooterStyle";
import { useSettingsQuery } from "../common/common.fetch";
import { footerText } from "../../assets/constants";

function Footer() {
  const { data } = useSettingsQuery();

  return (
    <FooterStyle>
      <div>
        <p>{footerText(data.dbversion)}</p>
      </div>
    </FooterStyle>
  );
}

export default Footer;
