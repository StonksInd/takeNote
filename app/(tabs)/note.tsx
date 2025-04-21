import { useState } from "react";
import { View, Text, Button, SafeAreaView, Switch } from "react-native";
import tw from "twrnc";
import NoteList from "@/components/notes/NoteList";
import NoteForm from "@/components/notes/NoteForm";
import CategoryManager from '@/components/notes/CategoryManager';
import { Modal } from "react-native";

export default function NotesScreen() {
    const [gridView, setGridView] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showCategories, setShowCategories] = useState(false);

    const refreshNotes = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            <View style={tw`p-4 border-b border-gray-200 bg-white`}>
                <Text style={tw`text-2xl font-bold text-center mb-2`}>Mes Notes</Text>

                <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text>Vue en grille</Text>
                    <Switch
                        value={gridView}
                        onValueChange={setGridView}
                    />
                </View>

                <NoteForm refreshNotes={refreshNotes} />
            </View>

            <NoteList key={refreshKey} gridView={gridView} />
            <Button
                title="Gérer les catégories"
                onPress={() => setShowCategories(true)}
            />

            <Modal
                visible={showCategories}
                animationType="slide"
                onRequestClose={() => setShowCategories(false)}
            >
                <CategoryManager />
                <View style={tw`mt-4`}>
                    <Button
                        title="Fermer"
                        onPress={() => setShowCategories(false)}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
}