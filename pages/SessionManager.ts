import { request, APIRequestContext } from "@playwright/test";

export class SessionManager {

    private static sessionKey: string;

    private static apiContext: APIRequestContext;

    static async getSessionKey() {

        console.log("Exiting session key:", this.sessionKey);

        if (!this.sessionKey) {

            this.sessionKey =
                await this.generateSessionKey();
        }
        if (!await this.verifySessionKey(this.sessionKey)) {

            console.warn("Session key is invalid or expired. Generating a new one.");
            this.sessionKey = await this.generateSessionKey();
        }
        return this.sessionKey;
    }

    static async generateSessionKey() {

        if (!this.apiContext) {

            this.apiContext =
                await request.newContext();
        }

        const response = await this.apiContext.post(
            "https://ctmsqa.contingenttalentmanagement.com/wfportal/clearConnect/2_0/?action=getSessionKey&resultType=json",
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        "testuser_04:Therealqaengineer@99"
                    ).toString("base64")}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const session = await response.json();
        console.log("Generated session key:", session[0]?.sessionKey);
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
        console.error("Session key is invalid or expired.");
        return false;
       }
       return true;
    }
}
