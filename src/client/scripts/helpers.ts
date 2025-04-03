import IReport from "../../server/types/report";

function formatDate(tmstp: number) {
    const timestamp = tmstp;
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const customFormattedDate = `${day}/${month}/${year}  ${hours}:${minutes}`;
    return customFormattedDate;
}

function formatDomain(domain: string) {
    const removeProtocol = domain.replace(/https?:\/\//, '');
    const removeWww = removeProtocol.replace(/^www\./, '');
    return removeWww.split('.')[0].toUpperCase();
}

function sortByDate(array: IReport[]) {
    return array.sort((a, b) => new Date(b.created_at) as any - (new Date(a.created_at) as any))
}

function sortByClient(array: IReport[]) {
    return array.sort((a: any, b: any) => a.client.localeCompare(b.client));
}

export { formatDate, formatDomain, sortByDate, sortByClient }