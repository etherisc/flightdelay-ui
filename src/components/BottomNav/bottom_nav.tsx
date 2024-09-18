"use client";

import { faFileSignature, faShoppingCart } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BottomNavigation, BottomNavigationAction, Container, Typography } from '@mui/material';
import Trans from "../Trans/trans";
import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { useState } from 'react';
import { HEIGHT_BOTTOM_NAV, ZINDEX_BOTTOM_NAV } from '../../config/theme';
import { PATH_MYPOLICIES, PATH_SIGNUP } from '../../utils/paths';

export default function BottomNav() {
    const segments = useSelectedLayoutSegments();
    const initialValue = segments[0] === 'mypolicies' ? 1 : 0;
    const [value, setValue] = useState(initialValue);
    const router = useRouter();
    
    return (<Container maxWidth="sm" sx={{ p: 0, bottom: 0, zIndex: ZINDEX_BOTTOM_NAV }}>
        <BottomNavigation 
            showLabels
            value={value} 
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            sx={{
                height: HEIGHT_BOTTOM_NAV,
                borderTop: "solid 1px #e0e0e0",
                backgroundColor: '#fafafa',
                boxShadow: '0px 0px 1px rgba(0, 0, 0, 0.1)',
            }}
            >
            <BottomNavigationAction 
                onClick={() => router.push(PATH_SIGNUP)} 
                label={<Trans k="bottom_nav.buy" />} 
                icon={<Typography fontSize={20} component="span" sx={{ lineHeight: '22px', pt: '2px' }}><FontAwesomeIcon icon={faShoppingCart} /></Typography>}
                />
            <BottomNavigationAction 
                onClick={() => router.push(PATH_MYPOLICIES)} 
                label={<Trans k="bottom_nav.mypolicies" />}
                icon={<Typography fontSize={20} component="span" sx={{ lineHeight: '22px', pt: '2px' }}><FontAwesomeIcon icon={faFileSignature} /></Typography>} 
                />
        </BottomNavigation>
    </Container>);
}