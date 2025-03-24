import React, { useRef, useState } from "react";
import useAuth from "../_layout";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";

function QrScanScreen() {
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const auth = useAuth();
    const signIn = auth?.signIn;
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const handleBarCodeScanned = async ({
        type,
        data,
    }: {
        type: string;
        data: string;
    }) => {
        if (scanned || loading) {
            return;
        }
        setScanned(true);
        setLoading(true);
        setDebug("Démarre le scan...");

        if (!data.includes("/auth/qr-login")) {
            setDebug("Code QR invalide");
            Alert.alert("Erreur", "Code QR invalide");
            setLoading(false);
            setScanned(false);
            return;
        }

        try {
            setDebug(
                (prev) => prev + `Tentative de connexion avec le code: ${data}\n`
            );

            const response = await fetch(data, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });

            setDebug((prev) => prev + `Réponse brute: ${response.status}\n`);

            const rawText = await response.text();
            setDebug(
                (prev) => prev + `Réponse brute: ${rawText.substring(0, 50)}...\n`
            );

            let responseData;
            try {
                responseData = JSON.parse(rawText);
                setDebug((prev) => prev + `Réponse parsé avec succès\n`);
            } catch (error) {
                setDebug((prev) => prev + `Erreur: ${(error as Error).message}`);
                throw new Error("Erreur de parsing");
            }

            if (!response.ok) {
                responseData.message || "Erreur de l'authentification";
                setDebug((prev) => prev + `Erreur: ${responseData.message}`);
                throw new Error(responseData.message);
            }

            setDebug((prev) => prev + `Connexion réussie\n`);

            await signIn(responseData.access_token, responseData.user);
        } catch (error) {
            setDebug((prev) => prev + `Erreur: ${(error as Error).message}`);
            Alert.alert("Erreur", (error as Error).message);
            setScanned(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setScanned(false);
    };

    if (!permission) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text style={tw`text-lg`}>Permission de la caméra refusée</Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    style={tw`bg-blue-500 p-2 mt-4 rounded`}
                >
                    <Text style={tw`text-white`}>Demander la permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text style={tw`text-lg`}>Permission de la caméra refusée</Text>
                <TouchableOpacity
                    onPress={handleRetry}
                    style={tw`bg-blue-500 p-2 mt-4 rounded`}
                >
                    <Text style={tw`text-white`}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={tw`flex-1 bg-white justify-center p-5`}>
            <StatusBar style="auto" />
            (!scanned && (
            <View style={tw`flex-1 overflow-hidden`}>
                <CameraView
                    ref={cameraRef}
                    style={tw`flex-1`}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                    <View style={tw`flex-1 justify-center items-center`}>
                        <View
                            style={tw`w-64 h-64 border-2 border-white rounded-2xl bg-transparent`}
                        />
                    </View>
                    <View style={tw`absolute bottom-20 left-0 right-0 items-center px-5`}>
                        <Text style={tw`text-white text-xl font-bold`}>
                            Scannez un QR Code
                        </Text>
                    </View>
                </CameraView>
            </View>
            ))
        </View>
    );
}

export default QrScanScreen;