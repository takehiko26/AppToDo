export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface CreateTodoDto {
  text: string;
}

export interface UpdateTodoDto {
  text?: string;
  completed?: boolean;
}