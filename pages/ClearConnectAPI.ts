import { APIRequestContext, expect } from "@playwright/test";
import { RandomUtil } from "../utils/RandomUtil";
import { sharedData } from "../test-data/sharedData";

type insertOrderPayload = {
  customerID?: string;
  status?: string;
  userId?: string;
  nursetype?: string;
  specialty?: string;
  jobDateStart?: string;
  jobDateEnd?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  shiftType?: string;
  shiftNum?: string;
  filledBy?: string;
  resultType?: string;
};

type insertTempRecordsPayload = {
  firstName?: string;
  lastName?: string;
  homeRegion?: string;
  Status?: string;
  Certification?: string;
  Specialty?: string;
  Address?: string;
  City?: string;
  State?: string;
  Zip?: string;
  resultType?: string;
};

type insertClientsPayload = {
  clientName?: string;
  Address?: string;
  City?: string;
  State?: string;
  Zip?: string;
  Status?: string;
  regionId?: string;
  resultType?: string;
};

export class ClearConnectAPI {
  constructor(private request: APIRequestContext) {}

  private authHeader() {
    return {
      Authorization: `Basic ${Buffer.from("testuser_04:Therealqaengineer@99").toString("base64")}`,
    };
  }

  private headers() {
    return {
      ...this.authHeader(),
      "Content-Type": "application/json",
    };
  }

  private BASE_URL =
    "https://ctmsqa.contingenttalentmanagement.com/wfportal/clearConnect/2_0/";

  async getTemps(tempIdIn: string) {
    const response = await this.request.get(
      `${this.BASE_URL}?action=getTemps&tempIdIn=${tempIdIn}&resultType=json`,
      {
        headers: {
          ...this.headers(),
        },
      },
    );
    expect(response.status()).toBe(200);
    return await response.json();
  }

  async getClients(clientIdIn: string) {
    const response = await this.request.get(
      `${this.BASE_URL}?action=getClients&clientIdIn=${clientIdIn}&resultType=json`,
      {
        headers: {
          ...this.headers(),
        },
      },
    );
    expect(response.status()).toBe(200);
    return await response.json();
  }

  async getOrders(OrderId: string) {
    const response = await this.request.get(
      `${this.BASE_URL}?action=getOrders&OrderId=${OrderId}&resultType=json`,
      {
        headers: {
          ...this.headers(),
        },
      },
    );
    expect(response.status()).toBe(200);
    return await response.json();
  }

  async insertOrder(insertOrderData: insertOrderPayload) {
    const response = await this.request.post(this.BASE_URL, {
      headers: {
        ...this.headers(),
      },
      params: {
        action: "insertOrder",
        customerID: insertOrderData.customerID ?? "null",
        status: insertOrderData.status ?? "Open",
        userId: insertOrderData.userId ?? "1",
        nursetype: insertOrderData.nursetype ?? "RN",
        specialty: insertOrderData.specialty ?? "ER",
        jobDateStart: insertOrderData.jobDateStart ?? RandomUtil.getDate(0),
        jobDateEnd: insertOrderData.jobDateEnd ?? RandomUtil.getDate(0),
        shiftStartTime: insertOrderData.shiftStartTime ?? "07:00",
        shiftEndTime: insertOrderData.shiftEndTime ?? "15:00",
        shiftType: insertOrderData.shiftType ?? "Regular",
        shiftNum: insertOrderData.shiftNum ?? "1",
        filledBy: insertOrderData.filledBy ?? "",
        resultType: insertOrderData.resultType ?? "json",
      },
    });
    expect(response.status()).toBe(200);
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (error) {
      const bodyText = await response.text();
      throw new Error(
        `insertOrder response was not valid JSON: ${String(error)}\n${bodyText}`,
      );
    }
    sharedData.orderId = responseBody[0]?.orderId;
    console.log("Created Order ID from API:", sharedData.orderId);
    return responseBody;
  }

  async insertTempRecords(insertTempData: insertTempRecordsPayload) {
    const tempRecordsXml = `
      <tempRecords>
        <tempRecord>
          <firstName>${insertTempData.firstName ?? RandomUtil.generateRandomString(7)}</firstName>
          <lastName>${insertTempData.lastName ?? RandomUtil.generateRandomString(5)}</lastName>
          <address>${insertTempData.Address ?? "16801 Addison Road"}</address>
          <city>${insertTempData.City ?? "Addison"}</city>
          <state>${insertTempData.State ?? "TX"}</state>
          <zip>${insertTempData.Zip ?? "75001"}</zip>
          <homeRegion>${insertTempData.homeRegion ?? "1"}</homeRegion>
          <status>${insertTempData.Status ?? "Active"}</status>
          <certification>${insertTempData.Certification ?? "RN"}</certification>
          <specialty>${insertTempData.Specialty ?? "ER"}</specialty>
        </tempRecord>
      </tempRecords>
    `;

    const response = await this.request.post(this.BASE_URL, {
      headers: {
        ...this.headers(),
      },
      params: {
        action: "insertTempRecords",
        tempRecords: tempRecordsXml,
        resultType: insertTempData.resultType ?? "json",
      },
    });
    expect(response.status()).toBe(200);
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (error) {
      const bodyText = await response.text();
      throw new Error(
        `insertTempRecords response was not valid JSON: ${String(error)}\n${bodyText}`,
      );
    }
    sharedData.tempId = responseBody[0]?.tempId;
    console.log("Created Temp ID from API:", sharedData.tempId);
    return responseBody;
  }

  async insertClients(insertClientData: insertClientsPayload) {
    const clientRecordsXml = `
      <clientRecords>
        <record>
          <clientName>${insertClientData.clientName ?? RandomUtil.generateRandomString(10)}</clientName>
          <Address>${insertClientData.Address ?? "16801 Addison Road"}</Address>
          <City>${insertClientData.City ?? "Addison"}</City>
          <State>${insertClientData.State ?? "TX"}</State>
          <Zip>${insertClientData.Zip ?? "75001"}</Zip>
          <Status>${insertClientData.Status ?? "Active"}</Status>
          <regionId>${insertClientData.regionId ?? "1"}</regionId>
        </record>
      </clientRecords>
    `;

    const response = await this.request.post(this.BASE_URL, {
      headers: {
        ...this.headers(),
      },
      params: {
        action: "insertClients",
        clientRecords: clientRecordsXml,
        resultType: insertClientData.resultType ?? "json",
      },
    });
    expect(response.status()).toBe(200);
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (error) {
      const bodyText = await response.text();
      throw new Error(
        `insertClients response was not valid JSON: ${String(error)}\n${bodyText}`,
      );
    }
    sharedData.clientId = responseBody[0]?.clientId;
    sharedData.clientName =
      insertClientData.clientName ??
      responseBody[0]?.clientname ??
      sharedData.clientName;
    console.log("Created Client ID from API:", sharedData.clientId);
    console.log("Client name used for API insert:", sharedData.clientName);
    return responseBody;
  }
}
