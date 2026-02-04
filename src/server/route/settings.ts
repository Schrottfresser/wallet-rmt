import env from '@server/env.js';
import logger from '@server/logger.js';
import { SettingsResponse } from '@server/model/response/settings.js';
import { Router } from 'express';

const settingsRouter = Router();

settingsRouter.get('/', async (req, res) => {
    logger.info(`API - Get settings"`);

    const settings: SettingsResponse = {
        enableRegistration: env.enableRegistration,
    };

    res.status(200).json(settings);
});

export default settingsRouter;
