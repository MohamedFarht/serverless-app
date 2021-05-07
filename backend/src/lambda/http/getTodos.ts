import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getAllTodo } from '../../businessLogic/ToDos'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('getTodoItem')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Event: ', event)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const getTodoItem = await getAllTodo(jwtToken)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: getTodoItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
