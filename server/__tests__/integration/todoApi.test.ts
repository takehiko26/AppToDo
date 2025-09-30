import request from 'supertest';
import { createApp } from '../../src/app';
import { initializeDatabase, closeDatabase, db } from '../../src/database/connection';

const app = createApp();

describe('Todo API', () => {
  beforeAll(() => {
    initializeDatabase();
  });

  beforeEach(() => {
    db.exec('DELETE FROM todos');
  });

  afterAll(() => {
    closeDatabase();
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos exist', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all todos', async () => {
      await request(app).post('/api/todos').send({ text: 'Todo 1' });
      await request(app).post('/api/todos').send({ text: 'Todo 2' });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ text: 'New Todo' });

      expect(response.status).toBe(201);
      expect(response.body.text).toBe('New Todo');
      expect(response.body.completed).toBe(false);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 400 when text is empty', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ text: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when text is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return todo by id', async () => {
      const created = await request(app)
        .post('/api/todos')
        .send({ text: 'Find Me' });

      const response = await request(app).get(`/api/todos/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(created.body.id);
      expect(response.body.text).toBe('Find Me');
    });

    it('should return 404 when todo not found', async () => {
      const response = await request(app).get('/api/todos/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo text', async () => {
      const created = await request(app)
        .post('/api/todos')
        .send({ text: 'Original' });

      const response = await request(app)
        .put(`/api/todos/${created.body.id}`)
        .send({ text: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.text).toBe('Updated');
    });

    it('should toggle todo completion', async () => {
      const created = await request(app)
        .post('/api/todos')
        .send({ text: 'Test' });

      const response = await request(app)
        .put(`/api/todos/${created.body.id}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    it('should return 404 when todo not found', async () => {
      const response = await request(app)
        .put('/api/todos/non-existent-id')
        .send({ text: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when text is empty', async () => {
      const created = await request(app)
        .post('/api/todos')
        .send({ text: 'Test' });

      const response = await request(app)
        .put(`/api/todos/${created.body.id}`)
        .send({ text: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete todo', async () => {
      const created = await request(app)
        .post('/api/todos')
        .send({ text: 'Delete Me' });

      const response = await request(app).delete(`/api/todos/${created.body.id}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/api/todos/${created.body.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when todo not found', async () => {
      const response = await request(app).delete('/api/todos/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });
});