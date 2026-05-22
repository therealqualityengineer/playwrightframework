import { request, APIRequestContext } from "@playwright/test";

export class SessionManager {

    private static sessionKey: string;

    private static apiContext: APIRequestContext;

    static async getSessionKey() {

        if (!this.sessionKey) {

            this.sessionKey =
                await this.generateSessionKey();
        }
        if (!await this.verifySessionKey(this.sessionKey)) {

            this.sessionKey = await this.generateSessionKey();
        }
        return this.sessionKey;
    }

    static async generateSessionKey() {

        if (!this.apiContext) {

            this.apiContext =
                await request.newContext();
        }

        const apiUsername = process.env.API_USERNAME;
        const apiPassword = process.env.API_PASSWORD;
        if (!apiUsername || !apiPassword) {
            throw new Error("API_USERNAME and API_PASSWORD must be set in the environment");
        }
        const response = await this.apiContext.post(
            "https://ctmsqa.contingenttalentmanagement.com/wfportal/clearConnect/2_0/?action=getSessionKey&resultType=json",
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${apiUsername}:${apiPassword}`).toString("base64")}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const session = await response.json();
        return session[0]?.sessionKey;
    }

    static async verifySessionKey(sessionKey: string) {
        
        if (!this.apiContext) {

            this.apiContext =
                await request.newContext();
        }

        const response = await this.apiContext.get(
            "https://ctmsqa.contingenttalentmanagement.com/wfportal/clearConnect/2_0/?action=getUsers&userIdIn=6226&resultType=json",
            {
                headers: {
                    Authorization: `Bearer ${sessionKey}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const result = await response.text();
       if(result.includes("Invalid session"))
       {
        return false;
       }
       return true;
    }
}
