import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@mui/material";
import { BLUE_LIGHT } from "../../../config/theme";
import Trans from "../../../components/Trans/trans";
import { useTheme } from '@mui/material/styles';
import Button from "../../Button/button";

interface BackButtonProps {
    onClick?: () => void;
}

export default function BackButton(props: BackButtonProps) {
    const theme = useTheme();

    return (
        <Button color={BLUE_LIGHT} onClick={props.onClick}>
            <Typography color={theme.palette.primary.main} fontWeight={600}>
                <FontAwesomeIcon icon={faChevronLeft} fontSize="14px" style={{ paddingRight: 8 }}/> 
                <Trans k="action.back" />
            </Typography>
        </Button>
    );
}
