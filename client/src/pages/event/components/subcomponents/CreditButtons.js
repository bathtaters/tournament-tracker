import React from "react";
import { useUpdateCreditsMutation } from "../../event.fetch";
import { CreditButtonWrapper, CreditButton } from "../../styles/ButtonStyles";
import { useAccessLevel } from "../../../common/common.fetch";

function CreditButtons({ id }) {
  const { access } = useAccessLevel();
  const [updateCredits, { isLoading }] = useUpdateCreditsMutation();

  if (access < 2) return null;

  return (
    <CreditButtonWrapper>
      <CreditButton
        onClick={() => updateCredits({ id, undo: true })}
        disabled={isLoading}
      >
        –
      </CreditButton>
      Undo/Add Credits from Event
      <CreditButton
        onClick={() => updateCredits({ id, undo: false })}
        disabled={isLoading}
      >
        ＋
      </CreditButton>
    </CreditButtonWrapper>
  );
}

export default CreditButtons;
