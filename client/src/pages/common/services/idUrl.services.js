import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { isTempId } from "./basic.services"

// Base62 settings
const digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const zero = digits[0]
const base = BigInt(digits.length)
const minWidth = 22

// Hex settings
const hexWidth = 32

// BigInt settings
/* global BigInt */
const bigZero = BigInt(0)

// UUID <=> Hex
const uuidToHex = (uuid) =>  uuid.slice(0,8) + uuid.slice(9,13) + uuid.slice(14,18) + uuid.slice(19,23) + uuid.slice(24,36)
const hexToUuid = (hex) => `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`

// Hex <=> BigInt
const hexToBig = (hex) => BigInt(`0x${hex}`)
const bigToHex = (big) => {
  let hex = big.toString(16)
  if (hex.length < hexWidth) { hex = '0'.repeat(hexWidth - hex.length) + hex }
  return hex
}

// BigInt <=> Base62
const bigToB62 = (big) => {
  let b62 = ''
  
  while (bigZero < big) {
    b62 = digits[big % base] + b62
    big = big / base
  }
  while (b62.length < minWidth) { b62 = zero + b62 }
  return b62 || zero
}

const b62ToBig = (b62) => {
  let big = bigZero
  for (const char of b62) { big = big * base + BigInt(digits.indexOf(char)) }
  return big
}

// Main methods (UUID <=> B62)
export const idToUrl = (uuid) => uuid && !isTempId(uuid) && bigToB62(hexToBig(uuidToHex(uuid)))
export const urlToId = (url)  => url && hexToUuid(bigToHex(b62ToBig(url)))

// Hooks
export function useLinkId (uuid, urlPrefix = '') {
  const linkId = useMemo(() => idToUrl(uuid), [uuid])
  return linkId ? `/${urlPrefix}${linkId}` : ''
}

export function useParamIds (...idParamLabels) {
  const params = useParams()

  return useMemo(
    () => idParamLabels.reduce(
      (ids, label) => ({ ...ids, [label]: urlToId(params[label]) }),
      {}
    ),
    // eslint-disable-next-line
    idParamLabels.map((label) => params[label])
  )
}