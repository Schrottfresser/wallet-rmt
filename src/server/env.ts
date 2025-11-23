const env = {
    isProd: process.env.NODE_ENV === 'production',

    serverIp: process.env.SERVER_IP || '0.0.0.0',
    serverPort: Number(process.env.SERVER_PORT) || 8080,
    serverBase: process.env.SERVER_BASE || '',

    dbIp: process.env.DB_IP || '127.0.0.1',
    dbPort: process.env.DB_PORT || '27017',
    dbName: process.env.DB_NAME || 'wallet-rmt',
};

export default env;
