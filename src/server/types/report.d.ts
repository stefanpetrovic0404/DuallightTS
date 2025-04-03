import { UserConfig } from "@unlighthouse/core";

interface IReportUrl {
    url: string;
    path: string[];
  }

interface IReport {
    id: string;
    domain: string;
    client: string;
    created_at: number;
    urls: IReportUrl[];
    config: Omit<UserConfig, 'urls'>
}

export default IReport;