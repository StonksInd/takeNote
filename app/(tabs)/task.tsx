import { useState } from 'react';
import { Text } from 'react-native';
import tw from 'twrnc';
const apiUrl = "https://keep.kevindupas.com/api";

export default function Task() {

    const response = fetch(`${apiUrl}/notes`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },

    }).then(response => response.json()).then(data => console.log(data));
    return (
        <Text style={tw`text-white`}></Text>

    );
}


