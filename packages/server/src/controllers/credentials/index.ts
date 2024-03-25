import { Request, Response, NextFunction } from 'express'
import credentialsService from '../../services/credentials'

const createCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined' || req.body === '') {
            throw new Error(`Error: credentialsController.createCredential - body not provided!`)
        }
        const apiResponse = await credentialsService.createCredential(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getAllCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await credentialsService.getAllCredentials(req.query.credentialName)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getCredentialById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.id === 'undefined' || req.params.id === '') {
            throw new Error(`Error: credentialsController.getCredentialById - id not provided!`)
        }
        const apiResponse = await credentialsService.getCredentialById(req.params.id)
        if (typeof apiResponse.executionError !== 'undefined') {
            return res.status(apiResponse.status).send(apiResponse.msg)
        }
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.id === 'undefined' || req.params.id === '') {
            throw new Error(`Error: credentialsController.updateCredential - id not provided!`)
        }
        if (typeof req.body === 'undefined' || req.body === '') {
            throw new Error(`Error: credentialsController.updateCredential - body not provided!`)
        }
        const apiResponse = await credentialsService.updateCredential(req.params.id, req.body)
        if (typeof apiResponse.executionError !== 'undefined') {
            return res.status(apiResponse.status).send(apiResponse.msg)
        }
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    createCredential,
    getAllCredentials,
    getCredentialById,
    updateCredential
}
