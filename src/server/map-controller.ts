import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import IReport from "./types/report";

type IMapContent = IReport[]

function readMapContent(): IMapContent | undefined {
  const filePath = path.join(__dirname, 'map.json');

  try {
    const mapFileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(mapFileContent);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

function writeMapToFile(mapContent: IMapContent): boolean {
  const filePath = path.join(__dirname, 'map.json');

  try {
    fs.writeFileSync(filePath, JSON.stringify(mapContent, null, 2));
    return true;
  } catch {
    return false;
  }
}
  function getMap(req: Request, res: Response) {
  const mapFilePath = path.join(__dirname, 'map.json');

  try {
    const fileData = fs.readFileSync(mapFilePath, 'utf8');
    const mapContent = JSON.parse(fileData);
    res.send(mapContent);
  } catch (error) {
    res.status(404).send({ message: 'Error reading map file' });
  }
}

export {  getMap, readMapContent, writeMapToFile, IMapContent };