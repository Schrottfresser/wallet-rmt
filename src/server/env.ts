const env = {
    isProd: process.env.NODE_ENV === 'production',

    serverIp: process.env.SERVER_IP || '0.0.0.0',
    serverPort: Number(process.env.SERVER_PORT) || 8080,
    serverBase: process.env.SERVER_BASE || '',

    appName: process.env.APP_NAME || 'Wallet RMT',
    protocol: process.env.PROTOCOL || 'http',
    host: process.env.HOST || 'localhost:8080',
    trustProxy: process.env.TRUST_PROXY || false,

    dbIp: process.env.DB_IP || '127.0.0.1',
    dbPort: process.env.DB_PORT || '27017',
    dbName: process.env.DB_NAME || 'wallet-rmt',

    bitcoinRpcUrl: process.env.BITCOIN_RPC_URL || 'http://localhost:18332',
    bitcoinRpcUser: process.env.BITCOIN_RPC_USER || 'bitcoin',
    bitcoinRpcPassword: process.env.BITCOIN_RPC_PASSWORD || 'pass1234',

    moneroWalletRpcUrl: process.env.MONERO_WALLET_RPC_URL || 'http://localhost:18088',
    moneroWalletRpcUser: process.env.MONERO_WALLET_RPC_USER || 'monero',
    moneroWalletRpcPassword: process.env.MONERO_WALLET_RPC_PASSWORD || 'pass1234',

    walletAuthExpirationMins: process.env.WALLET_AUTH_EXPIRATION_MINS || '5',
};

export const appUrl = env.host.split(':')[0];

export default env;
