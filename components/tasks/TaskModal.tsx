import { useState, useEffect } from "react";
import { Modal, Pressable, Text, TextInput, View, Button, Alert } from "react-native";
import tw from "twrnc";
import { useAuth } from "@/context/AuthContext";

type Subtask = {
    id?: number;
    description: string;
    is_completed: boolean;
};

type Task = {
    id: number;
    description: string;
    is_completed: boolean;
    subtasks: Subtask[];
};

export default function TaskModal({ task, visible, onClose, refreshTasks }: {
    task: Task,
    visible: boolean,
    onClose: () => void,
    refreshTasks: () => void
}) {
    const { getData } = useAuth();
    const [editedTask, setEditedTask] = useState<Task>({
        ...task,
        subtasks: task.subtasks?.map(st => ({ ...st })) || []
    });
    const [loading, setLoading] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");

    useEffect(() => {
        if (visible) {
            setEditedTask({
                ...task,
                subtasks: task.subtasks?.map(st => ({ ...st })) || []
            });
            setNewSubtask("");
        }
    }, [visible, task]);

    const handleClose = () => {
        onClose();
    };

    const handleUpdateTask = async () => {
        if (!editedTask.description.trim()) {
            Alert.alert("Erreur", "La description ne peut pas être vide");
            return;
        }

        setLoading(true);
        try {
            // Préparer les données pour l'API
            const taskToUpdate = {
                description: editedTask.description,
                is_completed: editedTask.is_completed,
                subtasks: editedTask.subtasks.map(subtask => ({
                    // Inclure l'ID uniquement si c'est un ID existant du serveur
                    ...(subtask.id && typeof subtask.id === 'number' && subtask.id < 1000000000 ? { id: subtask.id } : {}),
                    description: subtask.description,
                    is_completed: subtask.is_completed
                })),
                note_id: task.id || null
            };

            console.log("Envoi des données:", JSON.stringify(taskToUpdate, null, 2));

            const response = await getData(`tasks/${task.id}`, "PUT", taskToUpdate);
            console.log("Réponse du serveur:", response);

            if (response) {
                Alert.alert("Succès", "Tâche mise à jour avec succès");
                refreshTasks();
                handleClose();
            } else {
                throw new Error("Réponse vide du serveur");
            }
        } catch (error) {
            console.error("Erreur complète:", error);
            Alert.alert(
                "Erreur",
                `Impossible de mettre à jour la tâche: ${error.message || "Erreur inconnue"}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async () => {
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer cette tâche?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await getData(`tasks/${task.id}`, "DELETE");
                            if (response) {
                                refreshTasks();
                                handleClose();
                            }
                        } catch (error) {
                            console.error("Erreur suppression:", error);
                            Alert.alert(
                                "Erreur",
                                `Impossible de supprimer la tâche: ${error.message || "Erreur inconnue"}`
                            );
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };



    const toggleTaskStatus = async () => {
        const updatedTask = { ...editedTask, is_completed: !editedTask.is_completed };
        setEditedTask(updatedTask);

        setLoading(true);
        try {
            const response = await getData(`tasks/${task.id}/toggle`, "PATCH");
            if (response) {
                refreshTasks();
            } else {
                throw new Error("Réponse vide du serveur");
            }
        } catch (error) {
            console.error("Erreur lors du changement de statut:", error);
            Alert.alert("Erreur", "Impossible de changer le statut de la tâche");
            // Revenir à l'état précédent en cas d'erreur
            setEditedTask({ ...updatedTask, is_completed: !updatedTask.is_completed });
        } finally {
            setLoading(false);
        }
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) {
            Alert.alert("Erreur", "La description de la sous-tâche ne peut pas être vide");
            return;
        }

        const newSubtaskObj = {
            id: Date.now(), // ID temporaire (très grand nombre)
            description: newSubtask.trim(),
            is_completed: false
        };

        console.log("Ajout de sous-tâche:", newSubtaskObj);

        setEditedTask(prevTask => ({
            ...prevTask,
            subtasks: [...prevTask.subtasks, newSubtaskObj]
        }));

        setNewSubtask("");
    };

    const toggleSubtaskStatus = (index: number) => {
        const updatedSubtasks = [...editedTask.subtasks];
        updatedSubtasks[index].is_completed = !updatedSubtasks[index].is_completed;
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
            onRequestClose={handleClose}
        >
            <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                <View style={tw`bg-white w-11/12 rounded-xl p-4 max-h-[90%]`}>
                    <Text style={tw`text-lg font-bold mb-4 text-center`}>Détails de la tâche</Text>

                    <TextInput
                        style={tw`border border-gray-300 rounded px-4 py-2 mb-4 bg-white`}
                        value={editedTask.description}
                        onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
                        placeholder="Description de la tâche"
                    />

                    <View style={tw`flex-row justify-between mb-4`}>
                        <Button
                            title={editedTask.is_completed ? "Marquer non complétée" : "Marquer complétée"}
                            onPress={toggleTaskStatus}
                            color={editedTask.is_completed ? "#4CAF50" : "#FF5722"}
                            disabled={loading}
                        />
                    </View>

                    <Text style={tw`font-bold mb-2`}>Sous-tâches:</Text>
                    {editedTask.subtasks.map((subtask, index) => (
                        <View key={subtask.id || `new-${index}`} style={tw`flex-row items-center mb-2`}>
                            <Pressable
                                onPress={() => toggleSubtaskStatus(index)}
                                disabled={loading}
                            >
                                <Text style={tw`mr-2`}>{subtask.is_completed ? "✅" : "◻️"}</Text>
                            </Pressable>
                            <TextInput
                                style={tw`flex-1 border border-gray-300 rounded px-2 py-1 bg-white`}
                                value={subtask.description}
                                onChangeText={(text) => {
                                    const updatedSubtasks = [...editedTask.subtasks];
                                    updatedSubtasks[index].description = text;
                                    setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
                                }}
                                editable={!loading}
                            />
                            <Pressable
                                onPress={() => deleteSubtask(index)}
                                style={tw`ml-2 bg-red-500 px-2 py-1 rounded`}
                                disabled={loading}
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
                            editable={!loading}
                        />
                        <Button
                            title="+"
                            onPress={addSubtask}
                            disabled={loading}
                        />
                    </View>

                    <View style={tw`flex-row justify-between mt-6`}>
                        <Button
                            title="Supprimer"
                            onPress={handleDeleteTask}
                            color="#F44336"
                            disabled={loading}
                        />
                        <Button
                            title="Annuler"
                            onPress={onClose}
                            disabled={loading}
                        />
                        <Button
                            title="Enregistrer"
                            onPress={handleUpdateTask}
                            disabled={loading}
                            color="#4CAF50"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}