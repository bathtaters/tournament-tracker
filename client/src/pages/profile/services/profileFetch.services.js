import { fetchApi } from "../../../common/General/common.fetch";
import { idToUrl } from "../../../common/General/services/idUrl.services";

export { playerUpdate } from "../../players/services/playerFetch.services";

export const LOADING = "LOADING";

export async function resetUpdate(id, { dispatch, queryFulfilled }) {
  // Set reset link to 'loading'
  const updateAll = dispatch(
    fetchApi.util.updateQueryData("player", undefined, (draft) => {
      Object.assign(draft[id], { resetlink: LOADING });
    }),
  );

  const updateOne = dispatch(
    fetchApi.util.updateQueryData("player", id, (draft) => {
      Object.assign(draft, { resetlink: LOADING });
    }),
  );

  // Set reset link to result
  try {
    const { data } = await queryFulfilled;
    const resetlink = data.session ? idToUrl(data.session) : null;

    dispatch(
      fetchApi.util.updateQueryData("player", undefined, (draft) => {
        Object.assign(draft[id], { resetlink });
      }),
    );

    dispatch(
      fetchApi.util.updateQueryData("player", id, (draft) => {
        Object.assign(draft, { resetlink });
      }),
    );

    // Rollback on error
  } catch {
    updateAll.undo();
    updateOne.undo();
  }
}
