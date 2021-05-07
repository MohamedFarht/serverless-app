import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { addImage } from '../../businessLogic/ToDos'
import { cors } from 'middy/middlewares'

const logger = createLogger('generateUploadUrl')

const s3Buckut = new AWS.S3({
  signatureVersion: 'v4'
})
const nameOfBuckut = process.env.TODOS_S3_BUCKET
const urlExpire = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Event: ', event)
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const _url = generateUploadUrl(todoId)
    await addImage(todoId, jwtToken)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: _url
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
function generateUploadUrl(todoId: string) {
    return s3Buckut.getSignedUrl('putObject', {
      Bucket: nameOfBuckut,
      Key: todoId,
      Expires: urlExpire
    })
}

handler.use(
  cors({
    credentials: true
  })
)