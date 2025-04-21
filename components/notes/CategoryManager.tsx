
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '@/context/AuthContext';
import ColorPicker from 'react-native-wheel-color-picker';
import { Button } from 'react-native';


type Category = {
    id: number;
    name: string;
    color: string;
    is_system: boolean;
    user_id: number | null;
};

export default function CategoryManager() {
    const { getData } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#33B5FF');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getData('categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Erreur', 'Impossible de charger les catégories');
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom de la catégorie est requis');
            return;
        }

        setLoading(true);
        try {
            const newCategory = { name, color };
            const response = await getData('categories', 'POST', newCategory);

            if (response.data) {
                setCategories([...categories, response.data]);
                resetForm();
                setModalVisible(false);
            }
        } catch (error) {
            console.error('Error creating category:', error);
            Alert.alert('Erreur', 'Impossible de créer la catégorie');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentCategory || !name.trim()) {
            Alert.alert('Erreur', 'Le nom de la catégorie est requis');
            return;
        }

        setLoading(true);
        try {
            const updatedCategory = { name, color };
            const response = await getData(`categories/${currentCategory.id}`, 'PUT', updatedCategory);

            if (response.data) {
                setCategories(categories.map(cat =>
                    cat.id === currentCategory.id ? response.data : cat
                ));
                resetForm();
                setEditModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour la catégorie');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir supprimer cette catégorie?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await getData(`categories/${id}`, 'DELETE');
                            setCategories(categories.filter(cat => cat.id !== id));
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setName('');
        setColor('#33B5FF');
        setCurrentCategory(null);
    };

    const openEditModal = (category: Category) => {
        setCurrentCategory(category);
        setName(category.name);
        setColor(category.color);
        setEditModalVisible(true);
    };

    return (
        <View style={tw`flex-1 p-4`}>
            <View style={tw`mb-4`}>
                <Button
                    title="+ Nouvelle Catégorie"
                    onPress={() => setModalVisible(true)}
                />
            </View>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[tw`p-4 mb-2 rounded-lg flex-row justify-between items-center`,
                    { backgroundColor: `${item.color}20`, borderLeftWidth: 4, borderLeftColor: item.color }]}>
                        <View>
                            <Text style={tw`font-bold`}>{item.name}</Text>
                            <Text style={tw`text-gray-500`}>{item.is_system ? 'Système' : 'Personnalisée'}</Text>
                        </View>

                        {!item.is_system && (
                            <View style={tw`flex-row`}>
                                <Pressable
                                    onPress={() => openEditModal(item)}
                                    style={tw`p-2 mr-2`}
                                >
                                    <Text style={tw`text-blue-500`}>Modifier</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleDelete(item.id)}
                                    style={tw`p-2`}
                                >
                                    <Text style={tw`text-red-500`}>Supprimer</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
            />


            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                    <View style={tw`bg-white p-6 rounded-lg w-4/5`}>
                        <Text style={tw`text-xl font-bold mb-4`}>Nouvelle Catégorie</Text>

                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
                            placeholder="Nom de la catégorie"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={tw`mb-2`}>Couleur: {color}</Text>
                        <View style={tw`h-40 mb-4`}>
                            <ColorPicker
                                color={color}
                                onColorChange={setColor}
                                thumbSize={30}
                                sliderSize={30}
                                noSnap={true}
                                row={false}
                            />
                        </View>

                        <View style={tw`flex-row justify-between`}>
                            <Pressable
                                onPress={() => {
                                    resetForm();
                                    setModalVisible(false);
                                }}
                                style={tw`bg-gray-300 p-3 rounded-lg`}
                            >
                                <Text style={tw`text-gray-800 text-center`}>Annuler</Text>
                            </Pressable>
                            <Button
                                title={loading ? 'Création...' : 'Créer'}
                                onPress={handleCreate}
                                disabled={loading}
                            />
                        </View>
                        <View style={tw`bg-blue-500 ml-2 rounded-lg`}>
                            <Button
                                title="Créer"
                                onPress={handleCreate}
                                disabled={loading}
                            />
                        </View>
                    </View>
                </View>
            </Modal>


            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                    <View style={tw`bg-white p-6 rounded-lg w-4/5`}>
                        <Text style={tw`text-xl font-bold mb-4`}>Modifier Catégorie</Text>

                        <TextInput
                            style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
                            placeholder="Nom de la catégorie"
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={tw`mb-2`}>Couleur: {color}</Text>
                        <View style={tw`h-40 mb-4`}>
                            <ColorPicker
                                color={color}
                                onColorChange={setColor}
                                thumbSize={30}
                                sliderSize={30}
                                noSnap={true}
                                row={false}
                            />
                        </View>

                        <View style={tw`flex-row justify-between`}>
                            <Pressable
                                onPress={() => {
                                    resetForm();
                                    setEditModalVisible(false);
                                }}
                                style={tw`bg-gray-300 p-3 rounded-lg`}
                            >
                                <Text style={tw`text-gray-800 text-center`}>Annuler</Text>
                            </Pressable>
                            <Button
                                title={loading ? 'Enregistrement...' : 'Enregistrer'}
                                onPress={handleUpdate}
                                disabled={loading}
                            />
                        </View>
                        <View style={tw`bg-blue-500 ml-2 rounded-lg`}>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}