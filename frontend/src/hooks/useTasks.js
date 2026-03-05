import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, statsData] = await Promise.all([
        api.getTasks(filters),
        api.getStats(),
      ]);
      setTasks(tasksData.tasks);
      setStats(statsData.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    const data = await api.createTask(taskData);
    await fetchTasks();
    return data;
  };

  const updateTask = async (id, taskData) => {
    const data = await api.updateTask(id, taskData);
    await fetchTasks();
    return data;
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    await fetchTasks();
  };

  return { tasks, stats, loading, error, createTask, updateTask, deleteTask, refetch: fetchTasks };
}
