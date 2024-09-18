import { Button as MuiButton, SxProps, Theme } from '@mui/material';
import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    color?: string;
    fullwidth?: boolean;
    sx?: SxProps<Theme>;
    type?: "submit" | "reset" | "button" | undefined;
    disabled?: boolean;
    variant?: "text" | "outlined" | "contained" | undefined;
}

export default function Button(props: ButtonProps) {
    return (<MuiButton 
        type={props.type}
        variant={ props.variant ?? 'contained' }
        sx={{ 
            ...props.sx,
            borderRadius: '20px', 
            backgroundColor: props.color,
            boxShadow: 'none',
        }} 
        fullWidth={props.fullwidth}
        disabled={props.disabled}
        onClick={props.onClick}
        >
        {props.children}
    </MuiButton>);
}
