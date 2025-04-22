import { View, Text, Pressable } from 'react-native';
import tw from 'twrnc';

interface Note {
    id: string;
    title: string;
}

interface NoteSelectorProps {
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (id: string | null) => void;
}

export default function NoteSelector({ notes, selectedNoteId, onSelectNote }: NoteSelectorProps) {
    return (
        <View style={tw`mb-4`}>
            <Text style={tw`font-bold mb-2`}>Note associée:</Text>
            <View style={tw`flex-row flex-wrap`}>
                <Pressable
                    onPress={() => onSelectNote(null)}
                    style={[
                        tw`px-3 py-1 rounded-full mr-2 mb-2`,
                        !selectedNoteId ? tw`bg-blue-500` : tw`bg-gray-200`
                    ]}
                >
                    <Text style={!selectedNoteId ? tw`text-white` : tw`text-gray-800`}>
                        Aucune
                    </Text>
                </Pressable>

                {notes.map(note => (
                    <Pressable
                        key={note.id}
                        onPress={() => onSelectNote(note.id)}
                        style={[
                            tw`px-3 py-1 rounded-full mr-2 mb-2`,
                            selectedNoteId === note.id ? tw`bg-blue-500` : tw`bg-gray-200`
                        ]}
                    >
                        <Text style={selectedNoteId === note.id ? tw`text-white` : tw`text-gray-800`}>
                            {note.title}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}