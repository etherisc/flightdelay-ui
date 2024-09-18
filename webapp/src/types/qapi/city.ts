export interface QApiCity {
    id: number,
    name: QApiI18nString,
    lat: number,
    lon: number,
    active: boolean,
    selling: boolean,
}

export interface QApiI18nString {
    en: string,
    local: string,
}