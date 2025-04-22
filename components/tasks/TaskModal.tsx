import { useState, useEffect } from 'react';
import { Modal, Pressable, Text, TextInput, View, Button, Alert, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '@/context/AuthContext';
import NoteSelector from '../notes/NoteSelector';

type Subtask = {
    id?: number;
    description: string;
    is_completed: boolean;
};

type Task = {
    id: number;
    description: string;
    is_completed: boolean;
    note_id: number | null;
    subtasks: Subtask[];
};

type TaskModalProps = {
    task: Task;
    visible: boolean;
    onClose: () => void;
    refreshTasks: () => void;
};

export default function TaskModal({ task, visible, onClose, refreshTasks }: TaskModalProps) {
    const { getData } = useAuth();
    const [editedTask, setEditedTask] = useState<Task>({ ...task });
    const [loading, setLoading] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        if (visible) {
            setEditedTask({ ...task });
            setNewSubtask('');
            fetchNotes();
        }
    }, [visible, task]);

    const fetchNotes = async () => {
        try {
            const data = await getData('notes');
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleUpdateTask = async () => {
        if (!editedTask.description.trim()) {
            Alert.alert('Erreur', 'La description ne peut pas être vide');
            return;
        }

        setLoading(true);
        try {
            const taskToUpdate = {
                description: editedTask.description,
                is_completed: editedTask.is_completed,
                note_id: editedTask.note_id,
                subtasks: editedTask.subtasks
            };

            await getData(`tasks/${task.id}`, 'PUT', taskToUpdate);
            refreshTasks();
            onClose();
        } catch (error) {
            console.error('Error updating task:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour la tâche');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async () => {
        Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir supprimer cette tâche?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await getData(`tasks/${task.id}`, 'DELETE');
                            refreshTasks();
                            onClose();
                        } catch (error) {
                            console.error('Error deleting task:', error);
                            Alert.alert('Erreur', 'Impossible de supprimer la tâche');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const toggleTaskStatus = () => {
        setEditedTask({ ...editedTask, is_completed: !editedTask.is_completed });
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;

        setEditedTask({
            ...editedTask,
            subtasks: [
                ...editedTask.subtasks,
                { description: newSubtask.trim(), is_completed: false }
            ]
        });
        setNewSubtask('');
    };

    const toggleSubtaskStatus = (index: number) => {
        const updatedSubtasks = [...editedTask.subtasks];
        updatedSubtasks[index].is_completed = !updatedSubtasks[index].is_completed;
        setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
    };

    const updateSubtask = (index: number, text: string) => {
        const updatedSubtasks = [...editedTask.subtasks];
        updatedSubtasks[index].description = text;
        setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
    };

    const deleteSubtask = (index: number) => {
        const updatedSubtasks = editedTask.subtasks.filter((_, i) => i !== index);
        setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                <View style={tw`bg-white w-11/12 rounded-xl p-4 max-h-[90%]`}>
                    <ScrollView>
                        <Text style={tw`text-lg font-bold mb-4`}>
                            {task.id ? 'Modifier la tâche' : 'Nouvelle tâche'}
                        </Text>

                        <TextInput
                            style={tw`border border-gray-300 rounded px-4 py-2 mb-4 bg-white`}
                            value={editedTask.description}
                            onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
                            placeholder="Description de la tâche"
                        />

                        <NoteSelector
                            notes={notes}
                            selectedNoteId={editedTask.note_id !== null ? editedTask.note_id.toString() : null}
                            onSelectNote={(noteId: string | null) => setEditedTask({ ...editedTask, note_id: noteId ? parseInt(noteId, 10) : null })}
                        />

                        <View style={tw`flex-row items-center mb-4`}>
                            <Pressable
                                onPress={toggleTaskStatus}
                                style={tw`mr-2`}
                            >
                                <Text>{editedTask.is_completed ? '✅' : '◻️'}</Text>
                            </Pressable>
                            <Text>
                                {editedTask.is_completed ? 'Terminée' : 'Active'}
                            </Text>
                        </View>

                        <Text style={tw`font-bold mb-2`}>Sous-tâches:</Text>
                        {editedTask.subtasks.map((subtask, index) => (
                            <View key={index} style={tw`flex-row items-center mb-2`}>
                                <Pressable
                                    onPress={() => toggleSubtaskStatus(index)}
                                    style={tw`mr-2`}
                                >
                                    <Text>{subtask.is_completed ? '✓' : '○'}</Text>
                                </Pressable>
                                <TextInput
                                    style={tw`flex-1 border border-gray-300 rounded px-2 py-1 bg-white`}
                                    value={subtask.description}
                                    onChangeText={(text) => updateSubtask(index, text)}
                                />
                                <Pressable
                                    onPress={() => deleteSubtask(index)}
                                    style={tw`ml-2 bg-red-500 px-2 py-1 rounded`}
                                >
                                    <Text style={tw`text-white`}>Supprimer</Text>
                                </Pressable>
                            </View>
                        ))}

                        <View style={tw`flex-row mt-2`}>
                            <TextInput
                                style={tw`flex-1 border border-gray-300 rounded px-2 py-1 bg-white mr-2`}
                                placeholder="Nouvelle sous-tâche"
                                value={newSubtask}
                                onChangeText={setNewSubtask}
                            />
                            <Button
                                title="+"
                                onPress={addSubtask}
                            />
                        </View>

                        <View style={tw`flex-row justify-between mt-6`}>
                            {task.id && (
                                <Button
                                    title="Supprimer"
                                    onPress={handleDeleteTask}
                                    color="#F44336"
                                />
                            )}
                            <Button
                                title="Annuler"
                                onPress={onClose}
                            />
                            <Button
                                title="Enregistrer"
                                onPress={handleUpdateTask}
                                color="#4CAF50"
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}