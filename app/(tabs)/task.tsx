import { useState } from "react";
import { View, Button } from "react-native";
import tw from "twrnc";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";

export default function TaskScreen() {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={tw`flex-1`}>
            <TaskList />

            <View style={tw`absolute bottom-4 right-4`}>
                <Button
                    title="+"
                    onPress={() => setModalVisible(true)}
                />
            </View>

            <TaskModal
                task={{
                    id: 0,
                    description: "",
                    is_completed: false,
                    note_id: null,
                    subtasks: []
                }}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                refreshTasks={() => { }}
            />
        </View>
    );
}