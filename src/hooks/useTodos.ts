import { useState, useEffect } from 'react';
import type { Todo } from '../types/todo';
import { todoApi } from '../api/todoApi';
import { toast } from '../utils/toast';

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApi.fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // Create temporary todo with temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempTodo: Todo = {
      id: tempId,
      text: trimmedText,
      completed: false,
      createdAt: Date.now(),
    };

    // Optimistically add to UI immediately
    setTodos((prev) => [tempTodo, ...prev]);
    setError(null);

    try {
      // Make API call in background
      const newTodo = await todoApi.createTodo({ text: trimmedText });

      // Replace temporary todo with actual todo from server
      setTodos((prev) => prev.map((t) => (t.id === tempId ? newTodo : t)));
    } catch (err) {
      // Rollback: remove the temporary todo
      setTodos((prev) => prev.filter((t) => t.id !== tempId));

      const errorMessage = err instanceof Error ? err.message : 'Failed to add todo';
      setError(errorMessage);
      toast.error('追加に失敗しました');
      throw err;
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // Store original state for rollback
    const originalCompleted = todo.completed;

    // Optimistically update UI immediately
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    setError(null);

    try {
      // Make API call in background
      const updated = await todoApi.updateTodo(id, { completed: !originalCompleted });
      // Update with actual server response
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      // Rollback: restore original completed state
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: originalCompleted } : t))
      );

      const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
      setError(errorMessage);
      toast.error('更新に失敗しました');
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    // Find the todo to be deleted (for rollback if needed)
    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    // Optimistically remove from UI immediately
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setError(null);

    try {
      // Make API call in background
      await todoApi.deleteTodo(id);
    } catch (err) {
      // Rollback: restore the deleted todo
      setTodos((prev) => {
        // Insert back at original position
        const newTodos = [...prev];
        const originalIndex = todos.findIndex((t) => t.id === id);
        newTodos.splice(originalIndex, 0, todoToDelete);
        return newTodos;
      });

      const errorMessage = err instanceof Error ? err.message : 'Failed to delete todo';
      setError(errorMessage);
      toast.error('削除に失敗しました');
      throw err;
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}