const env = {
    isProd: process.env.NODE_ENV === 'production',

    serverIp: process.env.WALLET_RMT_SERVER_IP || '0.0.0.0',
    serverPort: Number(process.env.WALLET_RMT_SERVER_PORT) || 8080,
    serverBase: process.env.WALLET_RMT_SERVER_BASE || '',

    appName: process.env.WALLET_RMT_APP_NAME || 'Wallet RMT',
    protocol: process.env.WALLET_RMT_PROTOCOL || 'http',
    host: process.env.WALLET_RMT_HOST || 'localhost:8080',
    trustProxy: process.env.WALLET_RMT_TRUST_PROXY || false,

    dbIp: process.env.WALLET_RMT_DB_IP || '127.0.0.1',
    dbPort: Number(process.env.WALLET_RMT_DB_PORT) || 27017,
    dbName: process.env.WALLET_RMT_DB_NAME || 'wallet-rmt',

    dataDir: process.env.WALLET_RMT_DATA_DIR || '/var/lib/wallet-rmt',
    logDir: process.env.WALLET_RMT_LOG_DIR || '/var/log/wallet-rmt',
    walletTmpfsDir: process.env.WALLET_RMT_WALLET_TMPFS_DIR || '/run/wallet-rmt',

    bitcoinEnable: Boolean(process.env.WALLET_RMT_BITCOIN_ENABLE),
    bitcoinRpcUrl: process.env.WALLET_RMT_BITCOIN_RPC_URL || '',
    bitcoinRpcUser: process.env.WALLET_RMT_BITCOIN_RPC_USER || '',
    bitcoinRpcPassword: process.env.WALLET_RMT_BITCOIN_RPC_PASSWORD || '',

    moneroEnable: Boolean(process.env.WALLET_RMT_MONERO_ENABLE),
    moneroWalletRpcUrl: process.env.WALLET_RMT_MONERO_WALLET_RPC_URL || '',
    moneroWalletRpcUser: process.env.WALLET_RMT_MONERO_WALLET_RPC_USER || '',
    moneroWalletRpcPassword: process.env.WALLET_RMT_MONERO_WALLET_RPC_PASSWORD || '',

    sessionExpirationMins: Number(process.env.WALLET_RMT_SESSION_EXPIRATION_MINS) || 15,
    walletAuthExpirationMins: Number(process.env.WALLET_RMT_WALLET_AUTH_EXPIRATION_MINS) || 5,
};

export const APP_URL = env.host.split(':')[0];

export default env;
