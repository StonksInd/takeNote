import { View, Text, Pressable } from "react-native";
import tw from "twrnc";
import { parse } from "node-html-parser";

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

export default function NoteCard({
    note,
    onPress,
    gridView = false
}: {
    note: Note,
    onPress: (note: Note) => void,
    gridView?: boolean
}) {

    const getTextContent = (html: string) => {
        try {
            const root = parse(html);
            return root.textContent.substring(0, 100) + (root.textContent.length > 100 ? "..." : "");
        } catch (error) {
            return html.substring(0, 100) + (html.length > 100 ? "..." : "");
        }
    };

    return (
        <Pressable
            onPress={() => onPress(note)}
            style={tw`bg-white rounded-lg shadow mb-4 overflow-hidden ${gridView ? "w-[48%]" : "w-full"
                }`}
        >
            <View style={tw`p-4`}>
                <Text style={tw`text-lg font-bold mb-2`}>{note.title}</Text>
                <Text style={tw`text-gray-600 mb-3`}>{getTextContent(note.content)}</Text>

                {note.categories && note.categories.length > 0 && (
                    <View style={tw`flex-row flex-wrap`}>
                        {note.categories.map((category) => (
                            <View
                                key={category.id}
                                style={[
                                    tw`rounded-full px-2 py-1 mr-1 mb-1`,
                                    { backgroundColor: category.color + "40" }
                                ]}
                            >
                                <Text style={{ color: category.color }}>{category.name}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Text style={tw`text-xs text-gray-500 mt-2`}>
                    Modifiée le {new Date(note.updated_at).toLocaleDateString()}
                </Text>
            </View>
        </Pressable>
    );
}
