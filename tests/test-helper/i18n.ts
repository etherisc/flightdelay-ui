export const tMock = (str: string, values: Record<string, unknown>) => {
    if (values) {
        return str + " " + JSON.stringify(values);
    }
    return str;
}
