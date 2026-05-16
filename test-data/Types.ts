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