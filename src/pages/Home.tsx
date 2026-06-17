import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle, } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import {
        generateEncryptionKeyPair,
        generateSigningKeyPair,
        exportPublicKey,
        exportPrivateKey,
} from "../lib/crypto";
import { useNavigate } from "react-router-dom";

const Home = () => {
        const [name, setName] = useState("");
        const [loading, setLoading] = useState(false);
        const [status, setStatus] = useState({ message: "", isError: false });
        const navigate = useNavigate();

        const handleGenerate = async () => {
                if (!name.trim()) {
                        setStatus({ message: "Please enter your name", isError: true });
                        return;
                }

                setLoading(true);
                setStatus({ message: "Generating your secure key pairs...", isError: false });

                try {
                        const encryptionKeys = await generateEncryptionKeyPair();
                        const signingKeys = await generateSigningKeyPair();

                        const publicEncryptionKey = await exportPublicKey(encryptionKeys.publicKey);
                        const privateEncryptionKey = await exportPrivateKey(encryptionKeys.privateKey);
                        const publicSigningKey = await exportPublicKey(signingKeys.publicKey);
                        const privateSigningKey = await exportPrivateKey(signingKeys.privateKey);

                        const userInfo = {
                                id: uuidv4(),
                                name: name.trim(),
                                publicEncryptionKey,
                                privateEncryptionKey,
                                publicSigningKey,
                                privateSigningKey,
                        };

                        sessionStorage.setItem("myInfo", JSON.stringify(userInfo));
                        setStatus({ message: "Key pairs generated and stored successfully!", isError: false });
                        setTimeout(() => navigate("/chats"), 1000); // Smooth transition
                } catch (error) {
                        console.error(error);
                        setStatus({ message: "Error generating key pairs. Please try again.", isError: true });
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4">
                        <Card className="w-full max-w-md shadow-xl border-none">
                                <CardHeader className="space-y-1 text-center">
                                        <CardTitle className="text-2xl font-bold"></CardTitle>
                                        {/* <CardDescription className="text-gray-600">
                                                Enter your name to create your unique encryption and signing keys.
                                        </CardDescription> */}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium">
                                                        Your Name
                                                </Label>
                                                <Input
                                                        id="name"
                                                        placeholder="John Doe"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="h-10 focus-visible:ring-2 focus-visible:ring-blue-500"
                                                />
                                        </div>
                                        <Button
                                                onClick={handleGenerate}
                                                disabled={loading || !name.trim()}
                                                className="w-full h-10 bg-blue-600 hover:bg-blue-700 transition-colors"
                                        >
                                                {loading ? (
                                                        <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Continue...
                                                        </>
                                                ) : (
                                                        "Continue"
                                                )}
                                        </Button>
                                        {status.message && (
                                                <p
                                                        className={`text-sm text-center ${status.isError ? "text-red-500" : "text-green-600"
                                                                }`}
                                                >
                                                        {status.message}
                                                </p>
                                        )}
                                </CardContent>
                        </Card>
                </div>
        );
};

export default Home;
