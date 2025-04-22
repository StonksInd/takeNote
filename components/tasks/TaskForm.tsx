import { useState } from 'react';
import { TextInput, Button, View, Text, Modal, Pressable } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '@/context/AuthContext';

interface TaskFormProps {
    refreshTasks: () => void;
}

export default function TaskForm({ refreshTasks }: TaskFormProps) {
    const { getData } = useAuth();
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [subtasks, setSubtasks] = useState<Array<{ description: string; is_completed: boolean }>>([]);
    const [subDescription, setSubDescription] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            setMessage('Merci de renseigner une description.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const newTask = {
                description,
                is_completed: false,
                subtasks,
            };

            await getData('tasks', 'POST', newTask);
            setMessage('✅ Tâche créée !');
            setDescription('');
            setSubtasks([]);
            setModalVisible(false);
            refreshTasks();
        } catch (error) {
            setMessage('❌ Erreur lors de la création.');
        } finally {
            setLoading(false);
        }
    };

    const addSubTask = () => {
        if (!subDescription.trim()) {
            setMessage('Merci de renseigner une description.');
            return;
        }

        const newSubTask = {
            description: subDescription,
            is_completed: false,
        };

        setSubtasks([...subtasks, newSubTask]);
        setSubDescription('');
        setMessage('');
    };

    return (
        <View style={tw`p-4`}>
            <Button title="Ajouter une tâche" onPress={() => setModalVisible(true)} />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                    <View style={tw`bg-white w-11/12 rounded-xl p-4`}>
                        <Text style={tw`text-lg font-bold mb-2`}>Nouvelle tâche</Text>

                        <TextInput
                            style={tw`border border-gray-300 rounded px-4 py-2 mb-2 bg-white`}
                            placeholder="Description de la tâche"
                            value={description}
                            onChangeText={setDescription}
                        />
                        <Button
                            title={loading ? 'Création...' : 'Créer la tâche'}
                            onPress={handleSubmit}
                            disabled={loading}
                        />

                        <TextInput
                            style={tw`border border-gray-300 rounded px-4 py-2 mb-2 mt-4 bg-white`}
                            placeholder="Description de la sous-tâche"
                            value={subDescription}
                            onChangeText={setSubDescription}
                        />
                        <Button
                            title="Ajouter une sous-tâche"
                            onPress={addSubTask}
                            disabled={loading}
                        />

                        {subtasks.length > 0 && (
                            <View style={tw`mt-4`}>
                                <Text style={tw`font-bold mb-2`}>Sous-tâches :</Text>
                                {subtasks.map((subtask, index) => (
                                    <Text key={index} style={tw`ml-2`}>• {subtask.description}</Text>
                                ))}
                            </View>
                        )}

                        {message !== '' && (
                            <Text style={tw`mt-4 text-center ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </Text>
                        )}

                        <Pressable onPress={() => setModalVisible(false)} style={tw`mt-4`}>
                            <Text style={tw`text-blue-500 text-center`}>Fermer</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}