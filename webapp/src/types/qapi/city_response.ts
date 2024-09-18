import { ResponseBase } from "./base";
import { QApiCity } from "./city";

export interface CityResponse extends ResponseBase {
    city: QApiCity[];
}