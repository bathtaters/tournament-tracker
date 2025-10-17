// Builder for providesTags and invalidatesTags
// Returns function that will work as either property
import { debugLogging } from "../../assets/config";

// Constants
const DEF_KEY = "id";
export const ALL_ID = "_LIST";
export const tagTypes = [
  "Settings",
  "Schedule",
  "Event",
  "Match",
  "Player",
  "PlayerMatch",
  "Stats",
  "Clock",
  "Voter",
  "Session",
  "Setup",
] as const;

/**
 * Retrieve tags for cache validation from a response.
 * This will accept response forms:
 *  - **Array of objects** - Will generate tags for each object in the array
 *  - **Object of objects** - Will generate tags for each child object in the parent
 *  - **Single object** - Will generate tags for the single object
 * @param types - [ 'TagType', ... ] or { TagType: tagIdKey OR getTagId() }
 *  - tagIdKey = Value at this key in the response object(s) is the Cache ID for that object.
 *  - getTagId = (resObject, key, arg) => cacheID
 *      - resObject: A single object from the response (This is run for each object).
 *          - NOTE: When the response is an object of objects, the parent object will
 *              also be passed to this function and should return undefined.
 *      - key: Reference for the resObject from its parent
 *          - Parent = Object => key = object key [string]
 *          - Parent = Array => key = array index [number]
 *          - No Parent => key = null
 *      - arg: Argument passed to query/mutation from component
 *      - cacheID: ID value to use along with TagType to identify a cache entry,
            - NOTE: Returning undefined or an empty string will skip this entry
 * @param key - Value to use for tagIdKey if types is an array (Default: "id")
 * @param all - If true, invalidate the 'all' entries for any requested tag types (Default: true)
 * @param addBase - Additional cache tags to manually include
 * @param addAll - Tag types to invalidate the 'all' entries of
 * @param limit - Limit the number of objects in a response to include (0 = no limit)
 * @returns - Function that can be used as providesTags or invalidatesTags
 */
export default function getTags(
  types: TagType[] | TagDefinition,
  {
    key = DEF_KEY,
    all = true,
    addBase = [],
    addAll = [],
    limit = 0,
  }: TagsOptions = {},
) {
  //  Pre-build function w/ static data

  // Normalize 'types' input
  const typeObj = Array.isArray(types)
    ? types.reduce((obj, t) => ({ ...obj, [t]: key }), {} as TagDefinition)
    : types;

  // Build tag base
  if (all) addAll = addAll.concat(Object.keys(typeObj) as TagType[]);
  let tags = addBase.concat(addAll.map((type) => ({ type, id: ALL_ID })));

  // // Create 'getId' function
  // const getId = (type: TagType, r, a, k = null) =>
  //   typeof types[type] === "function"
  //     ? types[type](r, k, a)
  //     : getVal(r, types[type]);

  // Return callback for [provides|invalidates]Tags
  return (res: any, err?: any, arg?: any) => {
    // Handle error
    if (err && debugLogging)
      console.error(
        "Query error on " + JSON.stringify(typeObj) + ":" + JSON.stringify(arg),
        err,
      );

    // Array response
    if (Array.isArray(res)) {
      for (const type in typeObj) {
        let i = 0;
        for (const r of res) {
          if (limit && ++i > limit) break;
          const id = getVal(r, typeObj[type], arg, i);
          if (id) tags.push({ type, id } as TagObject);
        }
      }

      // JSON response
    } else if (typeof res === "object" && res) {
      for (const type in typeObj) {
        if (typeObj[type] && typeof typeObj[type] !== "function") {
          const id = getVal(res, typeObj[type], arg);
          if (id) {
            tags.push({ type, id } as TagObject);
            continue;
          }
        }
        let i = 0;
        for (const r in res) {
          if (limit && ++i > limit) break;
          const id = typeObj[type] ? getVal(res[r], typeObj[type], arg, r) : r;
          if (id) tags.push({ type, id } as TagObject);
        }
      }

      // Any other response (Or empty Array/JSON)
    } else {
      for (const type in typeObj) {
        if (typeof typeObj[type] === "function") {
          const id = getVal(res, typeObj[type], arg);
          if (id) tags.push({ type, id } as TagObject);
        }
      }
    }
    return tags;
  };
}

// Helper, gets value from key string (keyStr='propA.propB.0' would get <obj>.propA.propB[0])
function getVal(
  obj: Record<string, any>,
  keyOrGetter: string | TagIdFunc,
  origArgs?: any,
  origKey: string | number | null = null,
): string | null {
  if (typeof keyOrGetter === "function")
    return keyOrGetter(obj, origKey, origArgs);
  else if (obj)
    return keyOrGetter.split(".").reduce((ptr, key) => ptr?.[key], obj);
  return null;
}

// Tag Types

export type TagType = (typeof tagTypes)[number];

type TagObject = { type: TagType; id: string };

type TagIdFunc = (
  responsePart: any,
  key: string | number | null,
  originalArgs?: any,
) => string | undefined;

type TagDefinition = { [T in TagType]?: string | TagIdFunc };

type TagsOptions = Partial<{
  key: string;
  all: boolean;
  addBase: TagObject[];
  addAll: TagType[];
  limit: number;
}>;
