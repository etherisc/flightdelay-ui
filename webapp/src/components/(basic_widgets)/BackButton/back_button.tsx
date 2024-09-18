import { faChevronLeft } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@mui/material";
import { Button } from "component-lib";
import { BLUE_LIGHT } from "../../../config/theme";
import { Trans } from 'component-lib';
import { useTheme } from '@mui/material/styles';

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
