import * as AWS from 'aws-sdk'
import * as AWSXRAY from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Types } from 'aws-sdk/clients/s3'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRAY.captureAWS(AWS) as any

export class TodoAccess {
  constructor (
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3Client: Types = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todoItemTable = process.env.TODO_TABLE,
    private readonly s3TodoBucketName = process.env.BUCKET_NAME
  ) {}

  async getAllTodo (userId: string): Promise<TodoItem[]> {

    const params = {
      TableName: this.todoItemTable,
      KeyConditionExpression: '_userId = :userId',
      ExpressionAttributeNames: {
        '_userId': 'userId'
      },
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await this.docClient.query(params).promise()
    console.log(result)
    const items = result.Items

    return items as TodoItem[]
  }

  async createTodo (toDosItem: TodoItem): Promise<TodoItem> {
    console.log('Creating new todo')

    const params = {
      TableName: this.todoItemTable,
      Item: toDosItem
    }

    await this.docClient.put(params).promise()
    return toDosItem as TodoItem
  }

  async updateTodo (
    todoUpdate: TodoUpdate,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {

    const params = {
      TableName: this.todoItemTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #a1 = :a1, #b2 = :b2, #c3 = :c3',
      ExpressionAttributeNames: {
        '#a1': 'name',
        '#b2': 'dueDate',
        '#c3': 'done'
      },
      ExpressionAttributeValues: {
        ':a1': todoUpdate.name,
        ':b2': todoUpdate.dueDate,
        ':c3': todoUpdate.done
      },
      ReturnValues: 'UPDATED_ALL_NEW_VALUES'
    }

    const result = await this.docClient.update(params).promise()
    return result.Attributes as TodoUpdate
  }

  async deleteTodo (todoId: string, userId: string): Promise<string> {

    const params = {
      TableName: this.todoItemTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ConditionExpression: 'userId = :userId'
    }

    await this.docClient.delete(params).promise()

    return '' as string
  }

  async generateUploadUrl (todoId: string): Promise<string> {
    console.log('Generating URL')

    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3TodoBucketName,
      Key: todoId,
      Expires: 3000
    })
    console.log(url)

    return url as string
  }
  async addImage(todoId: string, userId: string): Promise<void> {

    var params = {
      TableName: this.todoItemTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${this.s3TodoBucketName}.s3.amazonaws.com/${todoId}`,
        ':userId': userId
      },
      ConditionExpression: 'userId = :userId',
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(params).promise()

    return
  }
}