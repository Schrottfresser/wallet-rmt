export default class RPC {
    private url: string;
    private version: string;
    private id: string;
    private authHeader?: string;

    constructor(
        url: string,
        version: string,
        id: string,
        username?: string,
        password?: string
    ) {
        this.url = url;
        this.version = version;
        this.id = id;

        if (username && password) {
            this.authHeader = this.generateAuthHeaderUsernamePassword(
                username,
                password
            );
        }
    }

    protected async request<T>(
        path: string,
        method: string,
        params?: string[]
    ) {
        const requestUrl = `${this.url}/${path}`;
        const response = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.authHeader ? this.authHeader : "",
            },

            body: JSON.stringify({
                jsonrpc: this.version,
                id: this.id,
                method,
                params,
            }),
        });

        if (!response.ok) {
            throw new Error(`JSON RPC request error : ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.error) {
            throw new Error(
                `JSON RPC request error: ${
                    response.status
                } ${responseJson.error.toString()}`
            );
        }

        return responseJson.result;
    }

    private generateAuthHeaderUsernamePassword(
        username: string,
        password: string
    ) {
        const combined = `${username}:${password}`;
        const combinedEncoded = Buffer.from(combined, "utf-8").toString(
            "base64"
        );

        const authHeader = `Basic ${combinedEncoded}`;
        return authHeader;
    }
}
