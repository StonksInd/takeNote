import { useState } from "react";
import { TextInput, Button, View, Text } from "react-native";
import tw from "twrnc";
import { useAuth } from "@/context/AuthContext";

export default function TaskForm() {
    const { getData } = useAuth();
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!description.trim()) {
            setMessage("Merci de renseigner une description.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const newTask = {
                description,
                is_completed: false,
                subtasks: [] // tu peux aussi en ajouter ici si tu veux
            };

            const response = await getData("tasks", "POST", newTask);
            setMessage("✅ Tâche créée !");
            setDescription(""); // reset
        } catch (error) {
            setMessage("❌ Erreur lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`p-4`}>
            <TextInput
                style={tw`border border-gray-300 rounded px-4 py-2 mb-2`}
                placeholder="Description de la tâche"
                value={description}
                onChangeText={setDescription}
            />
            <Button title={loading ? "Création..." : "Créer la tâche"} onPress={handleSubmit} />

            {message !== "" && (
                <Text style={tw`mt-2 text-center ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </Text>
            )}
        </View>
    );
}
