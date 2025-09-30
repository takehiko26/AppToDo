import { TodoRepository } from '../../src/repositories/TodoRepository';
import { initializeDatabase, closeDatabase, db } from '../../src/database/connection';

describe('TodoRepository', () => {
  let repository: TodoRepository;

  beforeAll(() => {
    initializeDatabase();
  });

  beforeEach(() => {
    repository = new TodoRepository();
    // Clear todos table before each test
    db.exec('DELETE FROM todos');
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('findAll', () => {
    it('should return empty array when no todos exist', () => {
      const todos = repository.findAll();
      expect(todos).toEqual([]);
    });

    it('should return all todos', () => {
      const todo1 = repository.create({ text: 'Todo 1' });
      const todo2 = repository.create({ text: 'Todo 2' });

      const todos = repository.findAll();
      expect(todos).toHaveLength(2);
      expect(todos[0].text).toBe('Todo 1');
      expect(todos[1].text).toBe('Todo 2');
    });
  });

  describe('create', () => {
    it('should create a new todo with default completed=false', () => {
      const todo = repository.create({ text: 'New Todo' });

      expect(todo.id).toBeDefined();
      expect(todo.text).toBe('New Todo');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeDefined();
    });

    it('should persist the todo to database', () => {
      const todo = repository.create({ text: 'Persistent Todo' });
      const found = repository.findById(todo.id);

      expect(found).toBeDefined();
      expect(found?.text).toBe('Persistent Todo');
    });
  });

  describe('findById', () => {
    it('should return todo when found', () => {
      const created = repository.create({ text: 'Find Me' });
      const found = repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.text).toBe('Find Me');
    });

    it('should return null when todo not found', () => {
      const found = repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update todo text', () => {
      const todo = repository.create({ text: 'Original' });
      const updated = repository.update(todo.id, { text: 'Updated' });

      expect(updated?.text).toBe('Updated');
      expect(updated?.completed).toBe(false);
    });

    it('should toggle todo completion status', () => {
      const todo = repository.create({ text: 'Test' });
      const updated = repository.update(todo.id, { completed: true });

      expect(updated?.completed).toBe(true);
      expect(updated?.text).toBe('Test');
    });

    it('should return null when todo not found', () => {
      const updated = repository.update('non-existent-id', { text: 'Updated' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing todo', () => {
      const todo = repository.create({ text: 'Delete Me' });
      const deleted = repository.delete(todo.id);

      expect(deleted).toBe(true);
      expect(repository.findById(todo.id)).toBeNull();
    });

    it('should return false when todo not found', () => {
      const deleted = repository.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});