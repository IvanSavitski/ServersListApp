import { Server } from '../interface/server';

export interface CustomResponse {
  timeStamp: Date;
  statusCode: number;
  status: string;
  reason: string;
  message: string;
  developmentMessage: string;
  data: {servers?: Server[], server?: Server }; //? means optional
}
