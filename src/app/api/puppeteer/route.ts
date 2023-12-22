import CryptoJS from "crypto-js";
import { PuppeteerInfo } from "@/types/api";


export async function POST(request: Request) {
  const body: PuppeteerInfo = await request.json();
  const { username, encryptedPassword, date, month, year, startTime, endTime } = body;
  const password = CryptoJS.AES.decrypt(encryptedPassword, process.env.NEXT_PUBLIC_CRYPTO_KEY || '').toString(CryptoJS.enc.Utf8);

  const courtOrder = [
    
  ]






  console.log({ username, password, date, month, year, startTime, endTime });
  return new Response("OK");
}