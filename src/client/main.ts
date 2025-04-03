import './style.css';

import { UserConfig } from "@unlighthouse/core";
import { ReportComponent } from "./components/ReportComponent";
import { createAudit, getMap } from "./scripts/requsts";
import { sortByDate, sortByClient } from "./scripts/helpers";
import IReport from "../server/types/report";
import { setFilterChangeListener } from './scripts/filter';

const config1: UserConfig = {
  urls: ['https://www.lobbet.me/ibet-web-client/'],
  lighthouseOptions: {
    onlyCategories: ['seo'],
  },
  scanner: {
    device: 'mobile',
    throttle: false,
  },
};

let sort = 'sortByDate';
let reports: IReport[] | undefined;

async function initReports() {

  try {
    const { data } = await getMap();
    reports = data;
  } catch (error) {
    console.error(error);
  }

  if (!reports) return;

  const sortedReports = sort === 'sortByDate' ? sortByDate(reports) : sortByClient(reports);
  reports = sortedReports;
  return displayMapList(sortedReports);
}

function displayMapList(maps: IReport[]) {
  const reportsElement = document.getElementById('reports');

  if (!reportsElement) {
    return;
  }

  reportsElement.innerHTML = '';

  const row = document.createElement('div');
  row.classList.add('row', 'row-cols-1', 'row-cols-sm-2', 'row-cols-md-3', 'row-cols-lg-5');

  maps.forEach((item) => {
    const reportElement = new ReportComponent(item).create();
    if (!reportElement) { return; }
    return row.appendChild(reportElement);
  });

  reportsElement.appendChild(row);
}

function setAuditButtonEventListeners() {
  const auditBtn = document.getElementById('auditBtn');

  if (!auditBtn) return;

  auditBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const loading = document.getElementById('loading');

    try {
      const config = createConfig();
      if (!config) {
        alert('Minimum jedan url, minimum jedna kategorija');
        return;
      }

      if (loading) {
        loading.style.display = 'flex';
      }
      const dialog = document.querySelector('#auditFormDialog') as any;
      if (dialog) {
        const inputs = document.querySelectorAll('.input-wrapper');
        inputs.forEach((input) => input.remove());
        dialog.close();
      }
      await createAudit(config);
      document.dispatchEvent(new CustomEvent('updateReports'));
      loading!.style.display = 'none';
    } catch (error) {
      loading!.style.display = 'none';
    }
  });
}

function setReportsUpdateListeners() {
  document.addEventListener('updateReports', async () => {
    initReports();
  });
  document.addEventListener('filterChange', async (e: any) => {
    if (!e || !e.detail) return;

    sort = e.detail.sort;

    if (!reports) return;

    const sortedReports = sort === 'sortByDate' ? sortByDate(reports) : sortByClient(reports);
    reports = sortedReports;
    return displayMapList(sortedReports);
  });
}

function createConfig() {
  const checkboxes = document.querySelectorAll('input[name="onlyCategories"]:checked');
  const onlyCategories = Array.from(checkboxes).map((cb: any) => cb?.value);

  const urlsElement = document.querySelectorAll('.form-control-url');
  const urls = Array.from(urlsElement).map((urlInput: any) => urlInput?.value);

  const device = (document.querySelector('select[name="device"]') as any)?.value;

  if (checkboxes.length === 0 || urls.length === 0 || !urls[0]) {
    return;

  }
  const config = {
    urls,
    lighthouseOptions: {
      onlyCategories
    },
    scanner: {
      device,
      throttle: false,
    },
  };

  return config;
}

function setDialogListeners() {
  const auditModalBtn = document.querySelector("#auditModalBtn");
  const closeAuditBtn = document.querySelector('#closeAuditBtn');
  const dialog = document.querySelector('dialog');

  auditModalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!dialog) {
      return;
    }

    dialog.showModal();
  });

  closeAuditBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!dialog) {
      return;
    }

    const inputs = document.querySelectorAll('.input-wrapper');
    inputs.forEach((input) => input.remove());

    dialog.close();
  });
}

function addUrlEventListener() {
  const addUrl = document.querySelector('#addUrl');

  addUrl?.addEventListener('click', e => {
    e.preventDefault();

    const inputContainer = document.querySelector('#inputContainer');

    if (!inputContainer) {
      return;
    }

    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('input-wrapper', 'w-100', 'd-flex', 'mb-3');

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Enter URL';
    urlInput.classList.add('form-control-url', 'me-3');
    inputWrapper.appendChild(urlInput);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-between', 'url-button-wrap');
    inputWrapper.appendChild(buttonContainer);

    const removeInputBtn = document.createElement('button');
    removeInputBtn.textContent = 'Remove URL';
    removeInputBtn.classList.add('btn', 'btn-danger', 'w-100');
    buttonContainer.appendChild(removeInputBtn);

    inputContainer.appendChild(inputWrapper);

    removeInputBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputs = inputContainer.querySelectorAll('.input-wrapper');
      if (inputs.length > 1) {
        inputs[inputs.length - 1].remove();
      }
    });
  })
}

document.addEventListener('DOMContentLoaded', () => {
  setFilterChangeListener();
  setDialogListeners();
  initReports();
  addUrlEventListener();
  setReportsUpdateListeners();
  setAuditButtonEventListeners();
});