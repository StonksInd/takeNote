import TaskList from '@/components/tasks/TaskList';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Button, Text } from 'react-native';
import TaskForm from '@/components/tasks/TaskForm';

import tw from 'twrnc';



const apiUrl = "https://keep.kevindupas.com/api";
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
    const { userToken } = useAuth();
    const [data, setData] = useState<Task[] | null>(null);
    const { getData } = useAuth();







    return (
        <>
            <Button title="Rafraîchir" onPress={() => {
                async function fetchTasks() {
                    const tasks = await getData("tasks", "GET");
                    setData(tasks);
                }

                fetchTasks();
            }} />


            {data && <TaskList tasks={data} />}


            {/* <Button title="Click Batard" onPress={() => {
                const taskData = {
                    description: "Nouvelle tâche",
                    is_completed: false,
                    subtasks: [
                        { description: "Première sous-tâche", is_completed: false },
                        { description: "Deuxième sous-tâche", is_completed: false }
                    ]
                };
                async function newTasks() {
                    const tasks = await getData("tasks", "POST", taskData);
                    setData(tasks);
                }

                newTasks();
            }} /> */}
            <TaskForm />




        </>

    );
}


