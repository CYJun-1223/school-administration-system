import Express from 'express';
import DataImportController from './controllers/DataImportController';
import ClassController from './controllers/ClassController';
import HealthcheckController from './controllers/HealthcheckController';

const router = Express.Router();

router.use('/', DataImportController);
router.use('/', ClassController);
router.use('/', HealthcheckController);

export default router;
