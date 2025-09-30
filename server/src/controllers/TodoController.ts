import { Request, Response } from 'express';
import { TodoRepository } from '../repositories/TodoRepository';

export class TodoController {
  private repository: TodoRepository;

  constructor() {
    this.repository = new TodoRepository();
  }

  getAllTodos = (_req: Request, res: Response): void => {
    try {
      const todos = this.repository.findAll();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTodoById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const todo = this.repository.findById(id);

      if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createTodo = (req: Request, res: Response): void => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim() === '') {
        res.status(400).json({ error: 'Text is required and must be a non-empty string' });
        return;
      }

      const todo = this.repository.create({ text: text.trim() });
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateTodo = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { text, completed } = req.body;

      if (text !== undefined && (typeof text !== 'string' || text.trim() === '')) {
        res.status(400).json({ error: 'Text must be a non-empty string' });
        return;
      }

      if (completed !== undefined && typeof completed !== 'boolean') {
        res.status(400).json({ error: 'Completed must be a boolean' });
        return;
      }

      const updateData: { text?: string; completed?: boolean } = {};
      if (text !== undefined) updateData.text = text.trim();
      if (completed !== undefined) updateData.completed = completed;

      const todo = this.repository.update(id, updateData);

      if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteTodo = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const deleted = this.repository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}