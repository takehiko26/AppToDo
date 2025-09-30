import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const todosCollection = db.collection('todos');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Get all todos
app.get('/api/todos', async (_req, res) => {
  try {
    const snapshot = await todosCollection.orderBy('createdAt', 'desc').get();
    const todos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get todo by ID
app.get('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await todosCollection.doc(id).get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create todo
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({ error: 'Text is required and must be a non-empty string' });
      return;
    }

    const newTodo = {
      text: text.trim(),
      completed: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await todosCollection.add(newTodo);
    const doc = await docRef.get();

    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update todo
app.put('/api/todos/:id', async (req, res) => {
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

    const updateData: Record<string, unknown> = {};
    if (text !== undefined) updateData.text = text.trim();
    if (completed !== undefined) updateData.completed = completed;

    const docRef = todosCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    await docRef.update(updateData);
    const updated = await docRef.get();

    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = todosCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    await docRef.delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the Express app as a Firebase Cloud Function
export const api = functions.https.onRequest(app);