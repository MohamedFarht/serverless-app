import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/ToDosAccess'
import { parseUserId } from '../auth/utils'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'

const s3TodoBucketName = process.env.BUCKET_NAME

const todoItemAccess = new TodoAccess()

export async function getAllTodo (jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoItemAccess.getAllTodo(userId)
}

export async function createTodo (
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  const todoItemId = uuid.v4()
  return await todoItemAccess.createTodo({
    userId: userId,
    todoId: todoItemId,
    createdAt: new Date().getTime().toString(),
    name: createTodoRequest.name,
    done: false,
    attachmentUrl: `https://${s3TodoBucketName}.s3.amazonaws.com/${todoItemId}`,
    ...createTodoRequest
  })
}

export async function updateTodo (
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string
): Promise<TodoUpdate> {
  const userId = parseUserId(jwtToken)
  return await todoItemAccess.updateTodo(updateTodoRequest,todoId , userId)
}

export function deleteTodo (
  todoId: string, 
  jwtToken: string
  ): Promise<string> {
  const userId = parseUserId(jwtToken)
  return todoItemAccess.deleteTodo(todoId, userId)
}

export function generateUploadUrl (
  todoId: string
  ): Promise<string> {
  return todoItemAccess.generateUploadUrl(todoId)
}

export async function addImage(
  todoId: string,
  jwtToken: string
): Promise<void> {
  const userId = parseUserId(jwtToken)

  return await todoItemAccess.addImage(todoId, userId)
}