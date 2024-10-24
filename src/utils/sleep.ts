export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function randomSleep(maxMs: number) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * maxMs)));
}
