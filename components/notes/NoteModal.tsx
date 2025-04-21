import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Modal, Pressable, ScrollView, Alert } from "react-native";
import tw from "twrnc";
import { useAuth } from "@/context/AuthContext";

type Category = {
    id: number;
    name: string;
    color: string;
    is_system: boolean;
    user_id: number | null;
    pivot?: {
        note_id: number;
        category_id: number;
    };
};

type Note = {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    categories: Category[];
};

export default function NoteModal({
    note,
    visible,
    onClose,
    refreshNotes
}: {
    note: Note,
    visible: boolean,
    onClose: () => void,
    refreshNotes: () => void
}) {

    const { getData } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
        note.categories.map(cat => cat.id)
    );
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        if (visible && editMode) {
            fetchCategories();
        }
    }, [visible, editMode]);

    // Réinitialiser les états lorsque la note change
    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        setSelectedCategoryIds(note.categories.map(cat => cat.id));
        setEditMode(false);
    }, [note]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const data = await getData("categories");
            setAllCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des catégories:", error);
            Alert.alert("Erreur", "Impossible de charger les catégories");
        } finally {
            setLoadingCategories(false);
        }
    };

    const toggleCategory = (categoryId: number) => {
        if (selectedCategoryIds.includes(categoryId)) {
            setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId));
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
        }
    };

    const handleUpdate = async () => {
        if (!title.trim()) {
            Alert.alert("Erreur", "Le titre ne peut pas être vide");
            return;
        }

        setLoading(true);
        try {
            const updatedNote = {
                title: title.trim(),
                content: content.trim(),
                categories: selectedCategoryIds
            };

            await getData(`notes/${note.id}`, "PUT", updatedNote);
            Alert.alert("Succès", "Note mise à jour avec succès");
            setEditMode(false);
            refreshNotes();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la note:", error);
            Alert.alert("Erreur", "Impossible de mettre à jour la note");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer cette note ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await getData(`notes/${note.id}`, "DELETE");
                            Alert.alert("Succès", "Note supprimée avec succès");
                            onClose();
                            refreshNotes();
                        } catch (error) {
                            console.error("Erreur lors de la suppression de la note:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la note");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderViewMode = () => (
        <ScrollView>
            <Text style={tw`text-xl font-bold mb-1`}>{note.title}</Text>
            <Text style={tw`text-sm text-gray-500 mb-4`}>
                Créée le {new Date(note.created_at).toLocaleDateString()} |
                Modifiée le {new Date(note.updated_at).toLocaleDateString()}
            </Text>

            {note.categories && note.categories.length > 0 && (
                <View style={tw`flex-row flex-wrap mb-4`}>
                    {note.categories.map((category) => (
                        <View
                            key={category.id}
                            style={[
                                tw`rounded-full px-3 py-1 mr-2 mb-2`,
                                { backgroundColor: category.color + "40" }
                            ]}
                        >
                            <Text style={{ color: category.color }}>{category.name}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={tw`p-2 rounded min-h-40 mb-4`}>
                <Text style={tw`text-base`}>{content}</Text>
            </View>

            <View style={tw`flex-row justify-between mt-4`}>
                <Button
                    title="Supprimer"
                    onPress={handleDelete}
                    color="#FF5722"
                    disabled={loading}
                />
                <Button
                    title="Modifier"
                    onPress={() => setEditMode(true)}
                    disabled={loading}
                />
            </View>
        </ScrollView>
    );

    const renderEditMode = () => (
        <ScrollView>
            <Text style={tw`text-xl font-bold mb-4 text-center`}>Modifier la note</Text>

            <Text style={tw`mb-1 font-medium`}>Titre</Text>
            <TextInput
                style={tw`border border-gray-300 rounded px-4 py-2 mb-4 bg-white`}
                placeholder="Titre de la note"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
            />

            <Text style={tw`mb-1 font-medium`}>Contenu</Text>
            <TextInput
                style={tw`border border-gray-300 rounded px-4 py-2 mb-4 bg-white min-h-32`}
                placeholder="Contenu de la note"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                editable={!loading}
            />

            <Text style={tw`mb-2 font-medium`}>Catégories</Text>
            {loadingCategories ? (
                <Text style={tw`text-center text-gray-500 my-2`}>Chargement des catégories...</Text>
            ) : (
                <View style={tw`flex-row flex-wrap mb-4`}>
                    {allCategories.map(category => (
                        <Pressable
                            key={category.id}
                            onPress={() => toggleCategory(category.id)}
                            style={[
                                tw`rounded-full px-3 py-2 m-1`,
                                {
                                    backgroundColor: selectedCategoryIds.includes(category.id)
                                        ? category.color
                                        : category.color + "40"
                                }
                            ]}
                            disabled={loading}
                        >
                            <Text
                                style={{
                                    color: selectedCategoryIds.includes(category.id) ? "white" : category.color
                                }}
                            >
                                {category.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            <View style={tw`flex-row justify-between mt-4`}>
                <Button
                    title="Annuler"
                    onPress={() => setEditMode(false)}
                    color="#FF5722"
                    disabled={loading}
                />
                <Button
                    title={loading ? "Enregistrement..." : "Enregistrer"}
                    onPress={handleUpdate}
                    disabled={loading}
                />
            </View>
        </ScrollView>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                <View style={tw`bg-white w-11/12 rounded-xl p-4 max-h-[90%]`}>
                    {editMode ? renderEditMode() : renderViewMode()}

                    {!editMode && (
                        <Pressable
                            style={tw`mt-4 py-2`}
                            onPress={onClose}
                        >
                            <Text style={tw`text-blue-500 text-center`}>Fermer</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Modal>
    );
}