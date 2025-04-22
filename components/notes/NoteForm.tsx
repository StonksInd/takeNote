import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, Pressable, ScrollView, Alert } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '@/context/AuthContext';

type Category = {
    id: number;
    name: string;
    color: string;
    is_system: boolean;
    user_id: number | null;
};

type NoteFormProps = {
    refreshNotes: () => void;
};

export default function NoteForm({ refreshNotes }: NoteFormProps) {
    const { getData } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const data = await getData('categories');
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
            Alert.alert('Erreur', 'Impossible de charger les catégories');
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        if (modalVisible) {
            fetchCategories();
        }
    }, [modalVisible]);

    const toggleCategory = (categoryId: number) => {
        if (selectedCategoryIds.includes(categoryId)) {
            setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId));
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Erreur', 'Le titre ne peut pas être vide');
            return;
        }

        setLoading(true);
        try {
            const newNote = {
                title: title.trim(),
                content: content.trim(),
                categories: selectedCategoryIds
            };

            await getData('notes', 'POST', newNote);
            Alert.alert('Succès', 'Note créée avec succès');
            setTitle('');
            setContent('');
            setSelectedCategoryIds([]);
            setModalVisible(false);
            refreshNotes();
        } catch (error) {
            console.error('Erreur lors de la création de la note:', error);
            Alert.alert('Erreur', 'Impossible de créer la note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`p-4`}>
            <Button
                title="Créer une nouvelle note"
                onPress={() => setModalVisible(true)}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                    <View style={tw`bg-white w-11/12 rounded-xl p-4 max-h-[90%]`}>
                        <ScrollView>
                            <Text style={tw`text-xl font-bold mb-4 text-center`}>Nouvelle note</Text>

                            <Text style={tw`mb-1 font-medium`}>Titre</Text>
                            <TextInput
                                style={tw`border border-gray-300 rounded px-4 py-2 mb-4 bg-white`}
                                placeholder="Titre de la note"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Text style={tw`mb-1 font-medium`}>Contenu</Text>
                            <TextInput
                                style={tw`border border-gray-300 rounded px-4 py-2 mb-4 bg-white min-h-32`}
                                placeholder="Contenu de la note"
                                value={content}
                                onChangeText={setContent}
                                multiline
                                textAlignVertical="top"
                            />

                            <Text style={tw`mb-2 font-medium`}>Catégories</Text>
                            {loadingCategories ? (
                                <Text style={tw`text-center text-gray-500 my-2`}>Chargement des catégories...</Text>
                            ) : (
                                <View style={tw`flex-row flex-wrap mb-4`}>
                                    {categories.map(category => (
                                        <Pressable
                                            key={category.id}
                                            onPress={() => toggleCategory(category.id)}
                                            style={[
                                                tw`rounded-full px-3 py-2 m-1`,
                                                {
                                                    backgroundColor: selectedCategoryIds.includes(category.id)
                                                        ? category.color
                                                        : category.color + '40'
                                                }
                                            ]}
                                        >
                                            <Text
                                                style={{
                                                    color: selectedCategoryIds.includes(category.id) ? 'white' : category.color
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
                                    onPress={() => setModalVisible(false)}
                                    color="#FF5722"
                                />
                                <Button
                                    title={loading ? 'Création...' : 'Créer la note'}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}