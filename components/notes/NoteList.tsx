import { useState, useEffect } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, Dimensions, TextInput, Pressable, ScrollView } from "react-native";
import tw from "twrnc";
import { useAuth } from "@/context/AuthContext";
import NoteCard from "./NoteCard";
import NoteModal from "./NoteModal";

type Category = {
    id: number;
    name: string;
    color: string;
};

type Note = {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    categories: Category[];
};

export default function NoteList({
    gridView = false
}: {
    gridView?: boolean
}) {
    const { getData } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const screenWidth = Dimensions.get("window").width;
    const numColumns = gridView ? 2 : 1;

    const fetchNotesAndCategories = async () => {
        setLoading(true);
        setError(null);
        try {

            const [notesData, categoriesData] = await Promise.all([
                getData("notes"),
                getData("categories")
            ]);

            setNotes(Array.isArray(notesData) ? notesData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (err) {
            console.error("Erreur lors du chargement:", err);
            setError("Impossible de charger les données. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        let result = notes;


        if (selectedCategory) {
            result = result.filter(note =>
                note.categories.some(cat => cat.id === selectedCategory)
            );
        }


        if (searchText.trim() !== "") {
            result = result.filter(note =>
                note.title.toLowerCase().includes(searchText.toLowerCase()) ||
                note.content.toLowerCase().includes(searchText.toLowerCase()) ||
                note.categories.some(cat =>
                    cat.name.toLowerCase().includes(searchText.toLowerCase())
                )
            );
        }

        setFilteredNotes(result);
    }, [searchText, selectedCategory, notes]);

    useEffect(() => {
        fetchNotesAndCategories();
    }, []);

    const handleNotePress = (note: Note) => {
        setSelectedNote(note);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedNote(null);
    };

    const toggleCategoryFilter = (categoryId: number) => {
        setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    };

    const clearAllFilters = () => {
        setSearchText("");
        setSelectedCategory(null);
    };

    if (loading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={tw`mt-2 text-gray-600`}>Chargement...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={tw`flex-1 justify-center items-center p-4`}>
                <Text style={tw`text-red-500 text-center mb-4`}>{error}</Text>
                <Text
                    style={tw`text-blue-500 font-semibold`}
                    onPress={fetchNotesAndCategories}
                >
                    Réessayer
                </Text>
            </View>
        );
    }

    if (notes.length === 0) {
        return (
            <View style={tw`flex-1 justify-center items-center p-4`}>
                <Text style={tw`text-gray-600 text-center`}>
                    Aucune note trouvée. Créez votre première note !
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={tw`flex-1`}>

            <View style={tw`px-4 py-2 bg-white`}>
                <TextInput
                    style={tw`border border-gray-300 rounded-lg px-4 py-2 bg-white mb-2`}
                    placeholder="Rechercher dans les notes..."
                    value={searchText}
                    onChangeText={setSearchText}
                    clearButtonMode="while-editing"
                />


                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={tw`mb-2`}
                >
                    <View style={tw`flex-row`}>
                        {categories.map(category => (
                            <Pressable
                                key={category.id}
                                onPress={() => toggleCategoryFilter(category.id)}
                                style={[
                                    tw`mr-2 px-3 py-1 rounded-full border`,
                                    {
                                        backgroundColor: selectedCategory === category.id
                                            ? category.color
                                            : 'transparent',
                                        borderColor: category.color
                                    }
                                ]}
                            >
                                <Text style={{
                                    color: selectedCategory === category.id
                                        ? 'white'
                                        : category.color
                                }}>
                                    {category.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>

                {(searchText || selectedCategory) && (
                    <Pressable
                        onPress={clearAllFilters}
                        style={tw`self-end px-3 py-1 bg-gray-200 rounded-lg`}
                    >
                        <Text>Effacer tous les filtres</Text>
                    </Pressable>
                )}
            </View>

            {filteredNotes.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <Text style={tw`text-gray-500`}>
                        Aucune note ne correspond à vos critères
                    </Text>
                    <Pressable
                        onPress={clearAllFilters}
                        style={tw`mt-2 px-4 py-2 bg-blue-500 rounded-lg`}
                    >
                        <Text style={tw`text-white`}>Réinitialiser les filtres</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={filteredNotes}
                    renderItem={({ item }) => (
                        <NoteCard
                            note={item}
                            onPress={handleNotePress}
                            gridView={gridView}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={tw`p-2`}
                    numColumns={numColumns}
                    key={gridView ? "grid" : "list"}
                    columnWrapperStyle={gridView ? tw`justify-between` : undefined}
                />
            )}

            {selectedNote && (
                <NoteModal
                    note={selectedNote}
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    refreshNotes={fetchNotesAndCategories}
                />
            )}
        </SafeAreaView>
    );
}