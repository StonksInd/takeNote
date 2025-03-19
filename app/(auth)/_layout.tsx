import { Stack } from "expo-router";


export default function AuthLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="login" />
                <Stack.Screen
                    name="qr-scan"
                    options={{
                        title: "Scan QR Code",
                        headerShown: true,
                    }}

                />
            </Stack>

        </>

    )

}