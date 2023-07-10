import { Status } from "../enum/status.enum";

export interface Server {
  id: number;
  ipAddress: string;
  //serverName: string;
  name: string;
  memory: string;
  //serverMemory: string;
  type: string;
  imageUrl: string;
  status: Status;
}
