import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Button, Text } from 'react-native';
import tw from 'twrnc';
const apiUrl = "https://keep.kevindupas.com/api";


export default function Task() {
    const { userToken } = useAuth();


    // const response = fetch(`${apiUrl}/notes`, {
    //     method: "GET",
    //     headers: {
    //         "Content-Type": "application/json",
    //         Accept: "application/json",
    //     },

    // }).then(response => response.json()).then(data => console.log(data));
    return (
        <>
            <Button title="Click Me" onPress={() => {
                const response = fetch(`${apiUrl}/tasks`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${userToken}`, // Replace with your actual token
                    },
                }).then(response => response.json()).then(data => console.log(data));
            }} />


            <Button title="Click Batard" onPress={() => {
                const taskData = {
                    description: "Nouvelle tâche",
                    note_id: 11,
                    is_completed: false,
                    subtasks: [
                        { description: "Première sous-tâche", is_completed: false },
                        { description: "Deuxième sous-tâche", is_completed: false }
                    ]
                };

                fetch(`${apiUrl}/tasks`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${userToken}`, // Remplace par ton vrai token
                    },
                    body: JSON.stringify(taskData),
                })
                    .then(response => response.json())
                    .then(data => console.log("Tâche créée :", data))
                    .catch(error => console.error("Erreur :", error));
            }} />



        </>

    );
}


