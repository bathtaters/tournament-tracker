import { commonApi } from "../../../common/General/common.fetch";

export function sessionLogin({ name }, { dispatch, queryFulfilled }) {
  const update = dispatch(
    commonApi.util.updateQueryData("session", undefined, () => ({ name })),
  );
  queryFulfilled.catch(() => {
    update.undo();
  }); // rollback
}

export function sessionLogout(_, { dispatch, queryFulfilled }) {
  const update = dispatch(
    commonApi.util.updateQueryData("session", undefined, () => ({})),
  );
  queryFulfilled.catch(() => {
    update.undo();
  }); // rollback
}
