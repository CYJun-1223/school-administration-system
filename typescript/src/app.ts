import Express from 'express';
import compression from 'compression';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import requestLogger from './middlewares/requestLogger';
import requestContext from './middlewares/requestContext';
import requestId from './middlewares/requestId';
import router from './router';
import globalErrorHandler from './config/globalErrorHandler';

const App = Express();

App.use(requestId);
App.use(compression());
App.use(cors());
App.use(json());
App.use(urlencoded({ extended: true }));
App.use(requestContext);
App.use(requestLogger);
App.use('/api', router);
App.use(globalErrorHandler);

export default App;
