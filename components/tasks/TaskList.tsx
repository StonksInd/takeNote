import { useAuth } from '@/context/AuthContext';
import { View, Text, FlatList, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { useState, useEffect } from 'react';
import TaskModal from './TaskModal';
import TaskFilter from './TaskFilter';

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

export default function TaskList() {
    const { getData } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    type Filter = {
        is_completed: number | null;
        note_id: number | null;
        search: string;
    };

    const [filter, setFilter] = useState<Filter>({
        is_completed: null,
        note_id: null,
        search: ''
    });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            let endpoint = 'tasks?';
            const params = [];

            if (filter.is_completed !== null) {
                params.push(`is_completed=${filter.is_completed === 1}`);
            }
            if (filter.note_id) {
                params.push(`note_id=${filter.note_id}`);
            }

            endpoint += params.join('&');

            const data = await getData(endpoint);
            setTasks(data);
            applySearchFilter(data, filter.search);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const applySearchFilter = (tasksToFilter: Task[], searchText: string) => {
        if (!searchText) {
            setFilteredTasks(tasksToFilter);
            return;
        }

        const filtered = tasksToFilter.filter(task =>
            task.description.toLowerCase().includes(searchText.toLowerCase()) ||
            (task.note && task.note.title.toLowerCase().includes(searchText.toLowerCase())) ||
            task.subtasks.some(st => st.description.toLowerCase().includes(searchText.toLowerCase()))
        );
        setFilteredTasks(filtered);
    };

    useEffect(() => {
        fetchTasks();
    }, [filter.is_completed, filter.note_id]);

    useEffect(() => {
        applySearchFilter(tasks, filter.search);
    }, [filter.search, tasks]);

    const handleTaskPress = (task: Task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    const toggleTaskStatus = async (taskId: number) => {
        try {
            await getData(`tasks/${taskId}/toggle`, 'PATCH');
            fetchTasks();
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    if (loading && tasks.length === 0) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={tw`flex-1`}>
            <TaskFilter
                filter={filter}
                setFilter={setFilter}
                refreshTasks={fetchTasks}
            />

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => handleTaskPress(item)}
                        onLongPress={() => toggleTaskStatus(item.id)}
                        style={tw`p-4 m-2 bg-white rounded-lg shadow`}
                    >
                        <View style={tw`flex-row items-center`}>
                            <Pressable
                                onPress={() => toggleTaskStatus(item.id)}
                                style={tw`mr-2`}
                            >
                                <Text>{item.is_completed ? '✅' : '◻️'}</Text>
                            </Pressable>
                            <Text style={tw`flex-1 font-bold ${item.is_completed ? 'line-through text-gray-400' : ''}`}>
                                {item.description}
                            </Text>
                        </View>

                        {item.note && (
                            <Text style={tw`text-blue-500 text-sm mt-1`}>
                                {`Note: ${item.note.title}`}
                            </Text>
                        )}

                        {item.subtasks.length > 0 && (
                            <View style={tw`mt-2`}>
                                {item.subtasks.map((subtask) => (
                                    <View key={subtask.id} style={tw`flex-row items-center ml-4`}>
                                        <Text>{subtask.is_completed ? '✓' : '○'}</Text>
                                        <Text
                                            style={tw`ml-2 text-sm ${subtask.is_completed ? 'line-through text-gray-400' : ''}`}
                                        >
                                            {subtask.description}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={tw`p-4 items-center`}>
                        <Text style={tw`text-gray-500`}>
                            {filter.is_completed !== null || filter.note_id || filter.search
                                ? 'Aucune tâche ne correspond aux filtres'
                                : 'Aucune tâche disponible'}
                        </Text>
                    </View>
                }
            />

            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    refreshTasks={fetchTasks}
                />
            )}
        </SafeAreaView>
    );
}