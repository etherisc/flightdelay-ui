import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { features } from './utils/features';

export function middleware(request: NextRequest) {
    if (features().csp === true) {
        const nonce = nanoid();
        const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV !== 'production' ? `'unsafe-eval'` : ''};
        style-src 'self' ${process.env.NODE_ENV !== 'production' ? `'unsafe-inline'` : `'nonce-${nonce}'`};
        img-src 'self' blob: data: *.basemaps.cartocdn.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;`;


        // Replace newline characters and spaces
        const contentSecurityPolicyHeaderValue = cspHeader
            .replace(/\s{2,}/g, ' ')
            .trim()

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('X-Nonce', nonce);
        requestHeaders.set(
            'Content-Security-Policy',
            contentSecurityPolicyHeaderValue
        );

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
        response.headers.set(
            'Content-Security-Policy',
            contentSecurityPolicyHeaderValue
        )

        return response
    } else {
        return NextResponse.next();
    }
}