export type Erc20PermitSignature = {
    owner: string,
    spender: string,
    value: bigint,
    nonce: bigint,
    deadline: number,
    v: number,
    r: string,
    s: string
}