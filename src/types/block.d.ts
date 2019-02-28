export interface Block {
    number: number;
    hash: string;
    parentHash: string;
    nonce: string;
    sha3Uncles: string;
    logsBloom: string;
    transactionsRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: string;
    difficulty: string;
    totalDifficulty: string;
    extraData: string;
    size: number;
    gasLimit: number;
    gasUsed: number;
    timestamp: number;
    transactions: Transaction[];
    uncles: string[];
}

export interface Transaction {
    hash: string;
    nonce: number;
    blockHash: string;
    blockNumber: number;
    transactionIndex: number;
    from: string;
    to: string;
    value: string;
    gas: number;
    gasPrice: string;
    input: string;
}