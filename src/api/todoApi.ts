import type { Todo } from '../types/todo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface CreateTodoRequest {
  text: string;
}

interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
}

export class TodoApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetchTodos(): Promise<Todo[]> {
    const response = await fetch(`${this.baseUrl}/api/todos`);

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }

    return response.json();
  }

  async createTodo(data: CreateTodoRequest): Promise<Todo> {
    const response = await fetch(`${this.baseUrl}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create todo: ${response.statusText}`);
    }

    return response.json();
  }

  async updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
    const response = await fetch(`${this.baseUrl}/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update todo: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete todo: ${response.statusText}`);
    }
  }
}

export const todoApi = new TodoApi();