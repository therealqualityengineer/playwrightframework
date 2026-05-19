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
  paySchedule?: string;
  TempType?: string;
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

type TempData = {
  firstname?: string;
  lastname?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  status?: string;
  homeRegion?: string;
  contract_or_ee?: string;
  certification?: string;
  speciality?: string;
};

type TempUpdateData = {
  EligibleForDailyPay?: string;
  DailyPayAdvancePercentage?: string;
};