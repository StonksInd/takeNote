// app/task.tsx
import TaskList from '@/components/tasks/TaskList';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from 'react-native';
import TaskForm from '@/components/tasks/TaskForm';

type Subtask = {
    id: number;
    description: string;
    is_completed: boolean;
};

type Note = {
    id: number;
    title: string;
};

type Task = {
    id: number;
    description: string;
    is_completed: boolean;
    user_id: number;
    note_id: number | null;
    created_at: string;
    updated_at: string;
    subtasks: Subtask[];
    note?: Note;
};

export default function Task() {
    const { userToken, getData } = useAuth();
    const [data, setData] = useState<Task[] | null>(null);

    const fetchTasks = async () => {
        try {
            const tasks = await getData("tasks", "GET");
            setData(tasks);
        } catch (error) {
            console.error("Erreur lors du chargement des tâches:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <>
            <Button
                title="Rafraîchir"
                onPress={fetchTasks}
            />

            {data && (
                <TaskList
                    tasks={data}
                    refreshTasks={fetchTasks}
                />
            )}

            <TaskForm refreshTasks={fetchTasks} />
        </>
    );
}