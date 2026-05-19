import { APIRequestContext, expect } from "@playwright/test";
import { RandomUtil } from "../utils/RandomUtil";
import type { TestState } from "../fixtures/testFixture";
import { SessionManager } from "./SessionManager";
import { paySchedule } from "../test-data/AllverificationData";

export class ClearConnectAPI {
  constructor(
    private request: APIRequestContext,
    private testState: TestState,
  ) {}

  private async authHeader() {
    return {
      Authorization: `Bearer ${await SessionManager.getSessionKey()}`,
    };
  }

  private async headers() {
    return {
      ...await this.authHeader(),
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
          ...await  this.headers(),
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
          ...await this.headers(),
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
          ...await this.headers(),
        },
      },
    );
    expect(response.status()).toBe(200);
    return await response.json();
  }

  async insertOrder(insertOrderData: insertOrderPayload) {
    const response = await this.request.post(this.BASE_URL, {
      headers: {
        ...await this.headers(),
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
    this.testState.orderId = responseBody[0]?.orderId;
    console.log("Created Order ID from API:", this.testState.orderId);
    return responseBody;
  }

  async insertTempRecords(insertTempData: insertTempRecordsPayload) {
    let payScheduleValue = null;
    switch (insertTempData.paySchedule) {
      case "Daily":
        payScheduleValue = paySchedule.Daily;
        break;
      case "Weekly":
        payScheduleValue = paySchedule.Weekly;
        break;
      case "Biweekly":
        payScheduleValue = paySchedule.Biweekly;
        break;
      case "Monthly":
        payScheduleValue = paySchedule.Monthly;
        break;
    }
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
          <paySchedule>${payScheduleValue ?? paySchedule.Daily}</paySchedule>
          <TempType>${insertTempData.TempType ?? "NewTest_001"}</TempType>
        </tempRecord>
      </tempRecords>
    `;

    const response = await this.request.post(this.BASE_URL, {
      headers: {
        ...await this.headers(),
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
    this.testState.tempId = responseBody[0]?.tempId;
    this.testState.temp_firstName = responseBody[0]?.firstName ?? this.testState.temp_firstName;
    this.testState.temp_lastName = responseBody[0]?.lastName ?? this.testState.temp_lastName;
    console.log("Created Temp ID from API:", this.testState.tempId);
    return responseBody;
  }

  async insertClients(insertClientData: insertClientsPayload) {
    const clientRecordsXml = `
      <clientRecords>
        <record>
          <clientName>${insertClientData.clientName ?? RandomUtil.generateRandomString(10)}</clientName>
          <Address>${insertClientData.Address ?? "16801 Addison Road"}</Address>
          <City>${insertClientData.City ?? "Addison"}</City>
          <Zip>${insertClientData.Zip ?? "75001"}</Zip>
          <Status>${insertClientData.Status ?? "Active"}</Status>
          <regionId>${insertClientData.regionId ?? "1"}</regionId>
        </record>
      </clientRecords>
    `;

    const response = await this.request.post(this.BASE_URL, {
      headers: {
        ...await this.headers(),
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
    this.testState.clientId = responseBody[0]?.clientId;
    this.testState.clientName =
      insertClientData.clientName ??
      responseBody[0]?.clientname;
    console.log("Created Client ID from API:", this.testState.clientId);
    return responseBody;
  }
}
