import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty todos', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  it('should add a new todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Buy milk');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Buy milk');
    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.todos[0].id).toBeDefined();
    expect(result.current.todos[0].createdAt).toBeDefined();
  });

  it('should not add empty todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('should not add whitespace-only todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('   ');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('should toggle todo completion status', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Test todo');
    });

    const todoId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(todoId);
    });

    expect(result.current.todos[0].completed).toBe(true);

    act(() => {
      result.current.toggleTodo(todoId);
    });

    expect(result.current.todos[0].completed).toBe(false);
  });

  it('should not throw when toggling non-existent todo', () => {
    const { result } = renderHook(() => useTodos());

    expect(() => {
      act(() => {
        result.current.toggleTodo('non-existent-id');
      });
    }).not.toThrow();
  });

  it('should delete a todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Todo to delete');
      result.current.addTodo('Todo to keep');
    });

    const todoIdToDelete = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(todoIdToDelete);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Todo to keep');
  });

  it('should not throw when deleting non-existent todo', () => {
    const { result } = renderHook(() => useTodos());

    expect(() => {
      act(() => {
        result.current.deleteTodo('non-existent-id');
      });
    }).not.toThrow();
  });

  it('should persist todos to localStorage', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Persistent todo');
    });

    const stored = localStorage.getItem('todos');
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe('Persistent todo');
  });

  it('should load todos from localStorage on initialization', () => {
    const initialTodos = [
      {
        id: '1',
        text: 'Loaded todo',
        completed: false,
        createdAt: Date.now(),
      },
    ];
    localStorage.setItem('todos', JSON.stringify(initialTodos));

    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Loaded todo');
  });

  it('should update localStorage when todo is toggled', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Toggle test');
    });

    const todoId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(todoId);
    });

    const stored = localStorage.getItem('todos');
    const parsed = JSON.parse(stored!);
    expect(parsed[0].completed).toBe(true);
  });

  it('should update localStorage when todo is deleted', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Delete test');
    });

    const todoId = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(todoId);
    });

    const stored = localStorage.getItem('todos');
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(0);
  });
});