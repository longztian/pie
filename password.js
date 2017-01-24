import md5 from './lib/strings/md5'

export const hash = password => md5(`Alex${password}Tian`)
export const random = () => 'generate ramdom password'
