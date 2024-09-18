'use client';

import { useTranslation, Trans as I18nTrans } from "react-i18next";
import React from "react";

/**
 * This component is used to translate text in the UI.
 */
export default function Trans({ k, ns, values, children}: { k: string, ns?: string, values?: Record<string, unknown>, children?: React.ReactNode}) {
    const { t } = useTranslation(ns);
    // return (<>{t(props.k, props.values)}</>);
    return <I18nTrans ns={ns} i18nKey={k} values={values} t={t} >{children}</I18nTrans>;
}
