export const classnames = (...names: any[]) => {
    return names.filter((v) => typeof v === 'string').join(' ')
}
