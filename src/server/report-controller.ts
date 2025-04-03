import path from "path";
import { rm } from 'fs/promises';
import fs from "fs";
import { Request, Response } from "express";
import {IMapContent, readMapContent, writeMapToFile} from "./map-controller";
import IReport from "./types/report";
import { UnlighthouseContext, UserConfig } from "@unlighthouse/core";
import cron from "node-cron";
import { readConfigs, writeConfigs } from "./configs-controller";

interface IScheduledTask {
  task: cron.ScheduledTask,
  time: string
} 

let isAuditInProgress = false;
const scheduledTasks: IScheduledTask[] = [];

function clearUnlighthouseCache() {
  delete require.cache[require.resolve('@unlighthouse/core')];
}

function getReport(req: Request, res: Response){

    const {domain, id, routeIndex} =  req.query;
    
      const filePath = path.join(__dirname, 'map.json');
      let jsonData;
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        jsonData = JSON.parse(data); 
      }
      catch (err) {
        jsonData = undefined;
      }
    
      const pathURL = jsonData.find((item: IReport) => {
        return  item.id === id
      }).urls[routeIndex as string];
    
      const route = ['public', 'reports', removeProtocol(domain as string),  id, 'reports', ...pathURL.path ]
    
      const htmlPath = path.join(__dirname, ...route ,'lighthouse.html');
     
      res.sendFile(htmlPath);
   }

   async function createReport({ body }: Request, res: Response) {

    const {config: userConfig, saveConfig, configName} = body;

    if (isAuditInProgress){
      res.status(500).send("Audit in progress");
      return;
    }

    clearUnlighthouseCache();

    const { createUnlighthouse } = await import('@unlighthouse/core');

     const config = generateConfig(userConfig);

     isAuditInProgress = true;

     let unlighthouseInstance: UnlighthouseContext;
     let results: UnlighthouseContext;

     try {
      unlighthouseInstance = await createUnlighthouse(config, {});
      results = await unlighthouseInstance.start();

      unlighthouseInstance.hooks.hook('worker-finished', () => {


        if (saveConfig){
          const configs = readConfigs() || [];

          writeConfigs([...configs, {config: userConfig, name: configName}]);
        }

        const mapContent = readMapContent() || [];

        const report = generateReport(results, config);
    
        if (!report) {
          console.error('Could not generate report');
          isAuditInProgress = false;
          res.status(500).send("Could not generate report");
          return;
        }
    
        const newMapContent = generateNewContent(report, mapContent);
        console.log('Generated new map content:', newMapContent);
    
        const isMapUpdated = writeMapToFile(newMapContent);
    
        if (!isMapUpdated) {
          console.error('Error writing map to file');
          isAuditInProgress = false;
          res.status(500).send('Error');
          return;
        }

        isAuditInProgress = false;
        res.status(200).send('OK');
      });
     }
     catch(err){
      isAuditInProgress = false;
      res.status(500).send(err);
      return;
     }
  }

  function generateNewContent(auditItem: IReport, mapContent: IMapContent){
    return [...mapContent, auditItem]
  }

function generateReport(results: UnlighthouseContext, config: Omit<UserConfig, 'urls'>): IReport | undefined {
    const {runtimeSettings, routes} = results;

    const {configCacheKey: id} = runtimeSettings;

    if (!id || !routes) {
      return;
    }

    const domain = runtimeSettings.siteUrl.origin;
    const created_at = new Date().getTime();
    const client = formatdomain(domain).toLowerCase();
    const urls = routes.map((item) => {
      return {
        url: item.url,
        path: item.path.split('/').slice(1)
      }
    });
    
    return {id, domain, client, created_at, urls, config};
  }
    function generateConfig(customConfig: UserConfig): UserConfig{

        return {
            ...customConfig,
            outputPath: path.join(__dirname, 'public', 'reports'),
        };
    };

    function formatdomain(domain: string) {
      const removeProtocol = domain.replace(/https?:\/\//, '');
      const removeWww = removeProtocol.replace(/^www\./, '');
      return removeWww.split('.')[0].toUpperCase();
    }

    function removeProtocol(url: string) {
      return url.replace(/^https?:\/\//, '');
  }

  async function deleteReport(req: Request, res: Response) {
    const { id } = req.params;
  
    const mapData = readMapContent();
  
    if (!mapData) {
      res.status(404).send('Failed to load map!');
      return;
    }
  
    const mapIndex = mapData.findIndex((map) => map.id === id);
  
    if (mapIndex === -1) {
      res.status(404).send('Map not found!');
      return;
    }

    await deleteFolder(path.join(__dirname, 'public', 'reports', removeProtocol(mapData[mapIndex].domain as string),  id));
  
    mapData.splice(mapIndex, 1);
  
    const isMapUpdated = writeMapToFile(mapData);
  
    if (!isMapUpdated) {
      res.status(500).send('Error');
      return;
    }
    
    res.status(200).send('OK');
  }
  
  async function deleteFolder(path: string) {
    try {
      await rm(path, { recursive: true, force: true });
      console.log(`Deleted folder: ${path}`);
    } catch (error) {
      console.error(`Error deleting folder: ${error}`);
    }
  }

  function generateScheduledTask(req: Request, res: Response){
    const { body } = req;
    const { options } = body;
    const { minutes = '*', hours = '*', dayOfMonth = '*', month = '*', dayOfWeek = '*' } = options;

    const time = `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;

    if (isAuditInProgress){
      res.status(500).send("Audit in progress");
      return;
    }

    let task: cron.ScheduledTask | undefined = cron.schedule(time, () => {
      createAutomaticReport(req, res);
      task?.stop();
      task = undefined;
    });

    scheduledTasks.push({
      task,
      time
    });

    res.status(200).send(time);
  }

  async function createAutomaticReport({ body }: Request, res: Response) {

    const {config: UserConfig} = body;

    clearUnlighthouseCache();

    const { createUnlighthouse } = await import('@unlighthouse/core');

     const config = generateConfig(UserConfig);

     isAuditInProgress = true;

     let unlighthouseInstance: UnlighthouseContext;
     let results: UnlighthouseContext;

     try {
      unlighthouseInstance = await createUnlighthouse(config, {});
      results = await unlighthouseInstance.start();

      unlighthouseInstance.hooks.hook('worker-finished', () => {

        const mapContent = readMapContent() || [];

        const report = generateReport(results, config);
    
        if (!report) {
          console.error('Could not generate report');
          isAuditInProgress = false;
          return;
        }
    
        const newMapContent = generateNewContent(report, mapContent);
        console.log('Generated new map content:', newMapContent);
    
        const isMapUpdated = writeMapToFile(newMapContent);
    
        if (!isMapUpdated) {
          console.error('Error writing map to file');
          isAuditInProgress = false;
          return;
        }

        isAuditInProgress = false;
      });
     }
     catch(err){
      isAuditInProgress = false;
      return;
     }
  }

  export { getReport, createReport, deleteReport, generateScheduledTask };