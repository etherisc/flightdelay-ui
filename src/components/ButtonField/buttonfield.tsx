import { Button } from "@mui/material";
import React from "react";

export interface ButtonFieldProps {
    increment: number;
}

export default function ButtonField(props: ButtonFieldProps) {
    const [ num, setNum ] = React.useState(0);

    const increment = () => {
        setNum(num + props.increment);
    }
    
    return (<>
        <div>
            <Button variant="contained" onClick={() => increment()}>Hello World</Button>
        </div>

        <div>
            <p>{num}</p>
        </div>
    </>);
}