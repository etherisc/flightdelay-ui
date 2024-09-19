import { faHouseChimneyCrack, faWineGlass} from "@fortawesome/free-solid-svg-icons";
import { CoverageType } from "../types/coverage_type";

export const ICON_FRAGILE_SHIELD = faWineGlass;
export const ICON_HOME_GUARD = faHouseChimneyCrack;

/** 
 * Returns the icon for the given coverage type.
 */
export function getIcon(type: CoverageType) {
    switch (type) {
        case CoverageType.FragileShield:
            return ICON_FRAGILE_SHIELD;
        case CoverageType.HomeGuard:
            return ICON_HOME_GUARD;
        default:
            throw Error("Invalid coverage type");
    }
}
