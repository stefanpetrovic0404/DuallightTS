import IReport from "../../server/types/report";
import { formatDomain, formatDate } from "../scripts/helpers";
import { deleteReport } from "../scripts/requsts";

export class ReportComponent {
    report: IReport;
    constructor(report: IReport) {
        this.report = report;
    }

    generateUrlsHTML() {
        const { id, domain, urls } = this.report;

        return urls.map((url: any, index: number) => `
        <div class=" flex-column align-items-stretch w-100 gap-2 pb-1 border-top-0">
        <a target="_blank" href="report/?id=${id}&domain=${domain}&routeIndex=${index}"
        class="w-100 btn report-btn"
        id="${id}"
        data-route-index="${index}">
        ${url.path[url.path.length - 1]}
        </a>
        </div>`
        ).join('')
    }

    generateCategoryTags() {
        const { config } = this.report;
        if (!config || !config.lighthouseOptions || !config.lighthouseOptions.onlyCategories) {
            return ``;
        }

        return config.lighthouseOptions.onlyCategories.map((category) => `<div class="audit-tag">${category}</div>`).join('')
    }

    create() {
        const { id, domain, created_at } = this.report;

        const formattedDomain = formatDomain(domain);

        const template = `        
        <div class="mb-4 card-wrapper " data-map-id="${id}">
        <div class="card card-body " >
          <div class="d-flex justify-content-between pb-3">
          <h4 class="my-0 fw-normal">${formattedDomain}</h4>
            <div data-bs-theme="dark" class="nowrap d-flex align-items-center justify-content-between ">
          </div>
            <button type="button" class="btn-close" data-map-id="${id}" aria-label="Close"></button>
          </div>
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 p-2">
            ${this.generateCategoryTags()}
          </div>
          <small class="card-text text-end">${formatDate(created_at)}</small>
        </div>
      </div>`

        const col = document.createElement('div');

        col.classList.add('card-wrap');
        col.innerHTML = template;

        const clonedCol = col.cloneNode(true);

        const reportElement = (clonedCol as Element).querySelector(`[data-map-id="${id}"]`);

        if (!reportElement) {
            return;
        }

        const closeButton = reportElement.querySelector('.btn-close');

        if (!closeButton) {
            return;
        }

        closeButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await deleteReport(id);
            document.dispatchEvent(new CustomEvent('updateReports'));
        });

        const collapseBtn = reportElement.querySelector('.card-body');

        if (!collapseBtn) {
            return;
        }

        let closeReportEventListener: any;

        collapseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const collapse = reportElement.querySelector('.collapse');
            const dialog = document.getElementById('reportModal') as HTMLDialogElement;
            const dialogBody = dialog.querySelector('.modal-body');
            const dialogTitle = dialog.querySelector('.modal-title');
            if (!dialogBody || !dialogTitle) {
                return;
            }
            dialogTitle.innerHTML = [formattedDomain, formatDate(created_at)].join('&nbsp;');
            dialogBody.innerHTML = this.generateUrlsHTML();
            dialog?.showModal();
            collapse?.classList.toggle('show');

            if (closeReportEventListener) {
                return;
            }

            const closeReportModal = document.getElementById('closeReportModal');

            closeReportEventListener = closeReportModal?.addEventListener('click', (e) => {
                e.preventDefault();
                dialog?.close();
            })
        });

        return clonedCol;
    }
}