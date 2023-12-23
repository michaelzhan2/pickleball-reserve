export interface PuppeteerInfo {
  username: string;
  encryptedPassword: string;
  date: number;
  month: number;
  year: number;
  startTime: number;
  endTime: number;
  courtOrder: number[];
}


export interface LoginInfo {
  username: string;
  encryptedPassword: string;
}