import path from "path";
import { UserConfig } from "vite";
import { Request, Response } from "express";
import fs from 'fs';

interface IConfig {
  name: string;
  config: UserConfig;
}

function readConfigs(): IConfig[] | undefined {
  const filePath = path.join(__dirname, 'configs.json');

  try {
    const configs = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(configs);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

function writeConfigs(configs: IConfig[]): boolean {
  const filePath = path.join(__dirname, 'configs.json');

  try {
    fs.writeFileSync(filePath, JSON.stringify(configs, null, 2));
    return true;
  } catch {
    return false;
  }
}

  function getConfigs(req: Request, res: Response) {
  const filePath = path.join(__dirname, 'configs.json');

  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);

    res.send(data);
  } catch (error) {
    res.status(404).send({ message: 'Error reading map file' });
  }
}

export { readConfigs, writeConfigs, getConfigs };