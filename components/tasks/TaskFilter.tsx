import { View, TextInput, Button, Text } from "react-native";
import tw from "twrnc";
import { useState } from "react";

interface Filter {
    search: string;
    is_completed: number | null;
    note_id: number | null;
}

export default function TaskFilter({
    filter,
    setFilter,
    refreshTasks,
}: {
    filter: Filter;
    setFilter: (filter: Filter) => void;
    refreshTasks: () => void;
}) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <View style={tw`p-2 bg-gray-100`}>
            <View style={tw`flex-row`}>
                <TextInput
                    style={tw`flex-1 border border-gray-300 rounded px-4 py-2 bg-white`}
                    placeholder="Rechercher..."
                    value={filter.search}
                    onChangeText={(text) => setFilter({ ...filter, search: text })}
                />
                <Button
                    title="Filtres"
                    onPress={() => setShowFilters(!showFilters)}
                />
            </View>

            {showFilters && (
                <View style={tw`mt-2`}>
                    <View style={tw`flex-row justify-between mb-2`}>
                        <Button
                            title="Toutes"
                            onPress={() => setFilter({ ...filter, is_completed: null })}
                            color={filter.is_completed === null ? "#3B82F6" : "#9CA3AF"}
                        />
                        <Button
                            title="Actives"
                            onPress={() => setFilter({ ...filter, is_completed: 0 })}
                            color={filter.is_completed === 0 ? "#3B82F6" : "#9CA3AF"}
                        />
                        <Button
                            title="Terminées"
                            onPress={() => setFilter({ ...filter, is_completed: 1 })}
                            color={filter.is_completed === 1 ? "#3B82F6" : "#9CA3AF"}
                        />
                    </View>

                    <Button
                        title="Réinitialiser"
                        onPress={() => {
                            setFilter({ is_completed: null, note_id: null, search: '' });
                            refreshTasks();
                        }}
                        color="#EF4444"
                    />
                </View>
            )}
        </View>
    );
}