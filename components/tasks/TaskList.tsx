// components/tasks/TaskList.tsx
import { useAuth } from "@/context/AuthContext";
import { View, Text, ScrollView, SafeAreaView, Pressable } from "react-native";
import tw from 'twrnc';
import { useState } from "react";
import TaskModal from "./TaskModal"; // Nous allons créer ce composant

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

export default function TaskList({ tasks, refreshTasks }: { tasks: Task[], refreshTasks: () => void }) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    if (!tasks || !Array.isArray(tasks)) {
        return <Text style={tw`text-center text-red-500`}>Aucune tâche à afficher</Text>;
    }

    const handleTaskPress = (task: Task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={tw`flex-1`}>
            <ScrollView contentContainerStyle={tw`p-4`}>
                {tasks.map((task) => (
                    <Pressable
                        key={task.id}
                        onPress={() => handleTaskPress(task)}
                        style={tw`mb-6 p-4 bg-white rounded-lg shadow`}
                    >
                        <Text style={tw`text-xl font-bold text-center`}>
                            {task.description}
                        </Text>

                        <Text style={tw`text-sm text-center text-gray-600`}>
                            Créée le {new Date(task.created_at).toLocaleDateString()}
                        </Text>

                        {task.note && (
                            <Text style={tw`mt-2 text-center text-blue-600`}>
                                📝 Note liée : {task.note.title}
                            </Text>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                            <View style={tw`mt-3`}>
                                <Text style={tw`text-base font-semibold`}>Sous-tâches :</Text>
                                {task.subtasks.map((subtask) => (
                                    <Text key={subtask.id} style={tw`ml-2`}>
                                        • {subtask.description} {subtask.is_completed ? "✅" : "❌"}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </Pressable>
                ))}
            </ScrollView>

            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    refreshTasks={refreshTasks}
                />
            )}
        </SafeAreaView>
    );
}