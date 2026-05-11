import { APIRequestContext, expect } from '@playwright/test';
import { RandomUtil } from '../utils/RandomUtil';

type insertOrderPayload = 
    {
        customerID? : string;   
        status? : string;
        userId? : string;
        nursetype? : string;
        specialty? : string;
        jobDateStart? : string;
        jobDateEnd? : string;
        shiftStartTime? : string;
        shiftEndTime? : string; 
        shiftType? : string;
        shiftNum? : string;
        filledBy? : string;
        resultType? : string;
    };

export class ClearConnectAPI
{
    constructor(private request: APIRequestContext) {}
    
    private authHeader() {

        return {Authorization: `Basic ${Buffer.from('testuser_04:Therealqaengineer@99').toString('base64')}`};
    }

    private headers()
    {
        return {
            ...this.authHeader(),
            'Content-Type': 'application/json',
        };
    }

    private BASE_URL = 'https://ctmsqa.contingenttalentmanagement.com/wfportal/clearConnect/2_0/';

    async getTemps(tempIdIn: string)
    {
        const response = await this.request.get(
            `${this.BASE_URL}?action=getTemps&tempIdIn=${tempIdIn}&resultType=json`, 
        {
        headers: { 
            ...this.headers(),
        },
        });
        expect(response.status()).toBe(200);
        return await response.json();
    }

    async insertOrder(insertOrderData : insertOrderPayload)
    {
        const response = await this.request.get(
            this.BASE_URL,
        {
            headers: {
                ...this.headers(),
            },
            params: {
                action: 'insertOrder',
                customerID: insertOrderData.customerID ?? 'null',
                status: insertOrderData.status ?? 'Open',
                userId: insertOrderData.userId ?? '1',
                nursetype: insertOrderData.nursetype ?? 'RN',
                specialty: insertOrderData.specialty ?? 'ER',
                jobDateStart: insertOrderData.jobDateStart ?? RandomUtil.getDate(0),
                jobDateEnd: insertOrderData.jobDateEnd ?? RandomUtil.getDate(0),
                shiftStartTime: insertOrderData.shiftStartTime ?? '07:00',
                shiftEndTime: insertOrderData.shiftEndTime ?? '15:00',
                shiftType: insertOrderData.shiftType ?? 'Regular',
                shiftNum: insertOrderData.shiftNum ?? '1',
                filledBy: insertOrderData.filledBy ?? '',
                resultType: insertOrderData.resultType ?? 'json'
            }
        });
        expect(response.status()).toBe(200);
        try {
            return await response.json();
        } catch (error) {
            const bodyText = await response.text();
            throw new Error(`insertOrder response was not valid JSON: ${String(error)}\n${bodyText}`);
        }
    }
}