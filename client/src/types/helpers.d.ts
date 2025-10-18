import type {
  BaseQueryFn,
  TypedMutationOnQueryStarted,
  TypedUseQuery,
  TypedUseQueryHookResult,
} from "@reduxjs/toolkit/query/react";

export type MutateApi<ReqBody, Ret = any> = Parameters<
  TypedMutationOnQueryStarted<Ret, ReqBody, BaseQueryFn<ReqBody, Ret>>
>[1];

/**
 * Type for RTK queries that can return a single object or multiple objects.
 *
 * ### Type Params
 * - ***BaseObj***: Type of single object expected to be returned (ex. *Player*)
 * - ***ParentKey***: Type of index used when multiple *BaseObjs* are returned (ex. *Player["id"]*)
 * - ***Hook***: The useQuery hook you will be overriding (ex. *typeof commonApi.usePlayerQuery*)
 *
 * ### Usage
 * ```ts
 * export const usePlayerQuery: OverloadQuery<Player, Player["id"], typeof commonApi.usePlayerQuery> = commonApi.usePlayerQuery;
 * ```
 */
export interface OverloadQuery<
  BaseObj,
  ParentKey extends string | number,
  Hook extends TypedUseQuery<any, any, any>,
> {
  (
    arg: null,
    options?: Parameters<Hook>[1],
  ): VarQryRtn<Record<ParentKey, BaseObj>, null>;
  (
    arg: ParentKey,
    options?: Parameters<Hook>[1],
  ): VarQryRtn<BaseObj, ParentKey>;
  (
    arg: ParentKey | null,
    options?: Parameters<Hook>[1],
  ): VarQryRtn<BaseObj | Record<ParentKey, BaseObj>, ParentKey | null>;
}

type VarQryRtn<Data, Arg> = TypedUseQueryHookResult<
  Data,
  Arg,
  BaseQueryFn<Arg, Data>
>;
