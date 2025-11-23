import { createValidatedHandler } from '@server/route/validation/index.js';
import {
    createRemoteSchema,
    retrieveRemoteSchema,
    editRemoteSchema,
    deleteRemoteSchema,
} from '@server/route/validation/remote.js';
import {
    retrieveAllRemotes,
    createRemote,
    retrieveRemote,
    deleteRemote,
    editRemote,
} from '@server/service/remote.js';
import { Router } from 'express';

const remoteRouter = Router();

remoteRouter.get('/', async (_req, res) => {
    const allRemotes = await retrieveAllRemotes();

    res.status(200).json(allRemotes);
});

remoteRouter.post(
    '/',
    createValidatedHandler(createRemoteSchema, async (data, _req, res) => {
        const remote = await createRemote(data.body);

        res.status(201).json(remote);
    }),
);

remoteRouter.get(
    '/:remoteId',
    createValidatedHandler(retrieveRemoteSchema, async (data, _req, res) => {
        const remote = await retrieveRemote(data.params.remoteId);

        res.status(200).json(remote);
    }),
);

remoteRouter.post(
    '/:remoteId',
    createValidatedHandler(editRemoteSchema, async (data, _req, res) => {
        const remote = await editRemote(data.params.remoteId, data.body);

        res.status(200).json(remote);
    }),
);

remoteRouter.delete(
    '/:remoteId',
    createValidatedHandler(deleteRemoteSchema, async (data, _req, res) => {
        deleteRemote(data.params.remoteId);

        res.status(200).send();
    }),
);

export default remoteRouter;
