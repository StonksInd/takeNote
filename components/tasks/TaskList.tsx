import { useAuth } from "@/context/AuthContext";
import { View, Text } from "react-native";
import tw from 'twrnc';

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

export default function TaskList({ tasks }: { tasks: Task[] }) {

    if (!tasks || !Array.isArray(tasks)) {
        return <Text style={tw`text-center text-red-500`}>Aucune tâche à afficher</Text>;
    }

    return (
        <View style={tw`p-4`}>
            {tasks.map((task) => (
                <View key={task.id} style={tw`mb-6 p-4 bg-white rounded-lg shadow`}>
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
                </View>
            ))}
        </View>
    );
}
