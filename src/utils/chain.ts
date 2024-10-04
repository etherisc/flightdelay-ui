import { ethers, Interface, Signer } from "ethers";

export const chainId = async (signer: Signer) =>  (await signer.provider!.getNetwork()).chainId;

export function getFieldFromLogs(logs: readonly ethers.Log[], abiInterface: Interface, eventName: string, fieldName: string): unknown | null {
    let value: unknown | null = null;
    
    logs?.forEach(log => {
        const parsedLog = abiInterface.parseLog({ data: log.data, topics: log.topics as string[] });
        // logger.debug(`parsedLog.name: ${parsedLog?.name} ${parsedLog?.args}`);
        if (parsedLog?.name === eventName) {
            // destructuring assignment to fetch the value of the field `fieldName` from the object `p.args`
            const { [fieldName]: v } = parsedLog.args;
            value = v;
            // logger.debug(`${eventName}: ${value}`);
        }
    });

    return value;
}
