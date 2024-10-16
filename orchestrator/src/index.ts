import express from 'express';
import router from './routes/transactionRoutes';

const app = express();
app.use(express.json());
app.use('/api', router);

const PORT = 4004;
app.listen(PORT, () => {
  console.log(`Orchestrator running on port ${PORT}`);
});
