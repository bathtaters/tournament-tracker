import { fetchApi } from "../../../common/General/common.fetch";

export function sessionLogin({ name }, { dispatch, queryFulfilled }) {
  const update = dispatch(
    fetchApi.util.updateQueryData("session", undefined, () => ({ name }))
  );
  queryFulfilled.catch(() => {
    update.undo();
  }); // rollback
}

export function sessionLogout(_, { dispatch, queryFulfilled }) {
  const update = dispatch(
    fetchApi.util.updateQueryData("session", undefined, () => ({}))
  );
  queryFulfilled.catch(() => {
    update.undo();
  }); // rollback
}
