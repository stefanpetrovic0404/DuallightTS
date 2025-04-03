import axios from "axios"
import { UserConfig } from "@unlighthouse/core";
import IReport from "../../server/types/report";

const domain = 'http://localhost:3000';

function deleteReport(id: string) {
    return axios.delete<{ id: string }>([domain + '/api/report/', id].join(''));
}

function createAudit(config: UserConfig) {
    return axios.post<UserConfig>([domain + '/api/audit'].join(''), config);
}

function getMap() {
 return  axios.get<IReport[]>([domain + '/api/map'].join(''))
}

export {deleteReport, createAudit, getMap };