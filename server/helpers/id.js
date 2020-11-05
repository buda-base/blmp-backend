import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 8)

export function shortIdGenerator(prefix) {
  return `${prefix}${nanoid()}`
}

export function titleCase(str) {
  const newStr = str.toLowerCase().split(' ')
  for (let i = 0; i < newStr.length; i += 1) {
    newStr[i] = newStr[i].charAt(0).toUpperCase() + newStr[i].slice(1)
  }
  return newStr.join(' ')
}
