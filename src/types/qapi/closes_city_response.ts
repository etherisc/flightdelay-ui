import { ResponseBase } from "./base";
import { QApiCity } from "./city";

export interface ClosestCityResponse extends ResponseBase {
    cities: QApiCity[];
}