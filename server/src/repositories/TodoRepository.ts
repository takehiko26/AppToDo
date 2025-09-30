import { db } from '../database/connection';
import type { Todo, CreateTodoDto, UpdateTodoDto } from '../models/Todo';
import { randomUUID } from 'crypto';

export class TodoRepository {
  findAll(): Todo[] {
    const stmt = db.prepare('SELECT * FROM todos ORDER BY createdAt DESC');
    const rows = stmt.all() as Array<{
      id: string;
      text: string;
      completed: number;
      createdAt: number;
    }>;

    return rows.map(row => ({
      ...row,
      completed: row.completed === 1,
    }));
  }

  findById(id: string): Todo | null {
    const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
    const row = stmt.get(id) as {
      id: string;
      text: string;
      completed: number;
      createdAt: number;
    } | undefined;

    if (!row) return null;

    return {
      ...row,
      completed: row.completed === 1,
    };
  }

  create(dto: CreateTodoDto): Todo {
    const todo: Todo = {
      id: randomUUID(),
      text: dto.text,
      completed: false,
      createdAt: Date.now(),
    };

    const stmt = db.prepare(
      'INSERT INTO todos (id, text, completed, createdAt) VALUES (?, ?, ?, ?)'
    );
    stmt.run(todo.id, todo.text, todo.completed ? 1 : 0, todo.createdAt);

    return todo;
  }

  update(id: string, dto: UpdateTodoDto): Todo | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: Todo = {
      ...existing,
      ...dto,
    };

    const stmt = db.prepare(
      'UPDATE todos SET text = ?, completed = ? WHERE id = ?'
    );
    stmt.run(updated.text, updated.completed ? 1 : 0, id);

    return updated;
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}