import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createReport, getReport, deleteReport, generateScheduledTask } from './report-controller';
import { getMap } from './map-controller';
import { getConfigs } from './configs-controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log(path.join(__dirname, '../../dist/server/public'));

app.use(express.static(path.join(__dirname, '../../dist/server/public')));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, '../../dist/client')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/api/audit', createReport);

app.get('/report', getReport);

app.get('/api/map', getMap);

app.delete('/api/report/:id', deleteReport);

app.post('/api/scheduledTasks', generateScheduledTask);

app.get('/api/configs', getConfigs);
