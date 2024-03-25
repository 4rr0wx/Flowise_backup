import { omit } from 'lodash'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { Credential } from '../../database/entities/Credential'
import { transformToCredentialEntity, decryptCredentialData } from '../../utils'
import { ICredentialReturnResponse } from '../../Interface'

const createCredential = async (requestBody: any) => {
    try {
        const flowXpresApp = getRunningExpressApp()
        const newCredential = await transformToCredentialEntity(requestBody)
        const credential = await flowXpresApp.AppDataSource.getRepository(Credential).create(newCredential)
        const dbResponse = await flowXpresApp.AppDataSource.getRepository(Credential).save(credential)
        return dbResponse
    } catch (error) {
        throw new Error(`Error: credentialsService.createCredential - ${error}`)
    }
}

const getAllCredentials = async (paramCredentialName: any) => {
    try {
        const flowXpresApp = getRunningExpressApp()
        let dbResponse = []
        if (paramCredentialName) {
            if (Array.isArray(paramCredentialName)) {
                for (let i = 0; i < paramCredentialName.length; i += 1) {
                    const name = paramCredentialName[i] as string
                    const credentials = await flowXpresApp.AppDataSource.getRepository(Credential).findBy({
                        credentialName: name
                    })
                    dbResponse.push(...credentials)
                }
            } else {
                const credentials = await flowXpresApp.AppDataSource.getRepository(Credential).findBy({
                    credentialName: paramCredentialName as string
                })
                dbResponse = [...credentials]
            }
        } else {
            const credentials = await flowXpresApp.AppDataSource.getRepository(Credential).find()
            for (const credential of credentials) {
                dbResponse.push(omit(credential, ['encryptedData']))
            }
        }
        return dbResponse
    } catch (error) {
        throw new Error(`Error: credentialsService.getAllCredentials - ${error}`)
    }
}

const getCredentialById = async (credentialId: string): Promise<any> => {
    try {
        const flowXpresApp = getRunningExpressApp()
        const credential = await flowXpresApp.AppDataSource.getRepository(Credential).findOneBy({
            id: credentialId
        })
        if (!credential) {
            return {
                executionError: true,
                status: 404,
                msg: `Credential ${credentialId} not found`
            }
        }
        // Decrpyt credentialData
        const decryptedCredentialData = await decryptCredentialData(
            credential.encryptedData,
            credential.credentialName,
            flowXpresApp.nodesPool.componentCredentials
        )
        const returnCredential: ICredentialReturnResponse = {
            ...credential,
            plainDataObj: decryptedCredentialData
        }
        const dbResponse = omit(returnCredential, ['encryptedData'])
        return dbResponse
    } catch (error) {
        throw new Error(`Error: credentialsService.createCredential - ${error}`)
    }
}

const updateCredential = async (credentialId: string, requestBody: any): Promise<any> => {
    try {
        const flowXpresApp = getRunningExpressApp()
        const credential = await flowXpresApp.AppDataSource.getRepository(Credential).findOneBy({
            id: credentialId
        })
        if (!credential) {
            return {
                executionError: true,
                status: 404,
                msg: `Credential ${credentialId} not found`
            }
        }
        const updateCredential = await transformToCredentialEntity(requestBody)
        await flowXpresApp.AppDataSource.getRepository(Credential).merge(credential, updateCredential)
        const dbResponse = await flowXpresApp.AppDataSource.getRepository(Credential).save(credential)
        return dbResponse
    } catch (error) {
        throw new Error(`Error: credentialsService.updateCredential - ${error}`)
    }
}

export default {
    createCredential,
    getAllCredentials,
    getCredentialById,
    updateCredential
}
