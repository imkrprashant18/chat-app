import { useRef } from "react";
import QRCode from "react-qr-code";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Download } from "lucide-react"; // Make sure to install lucide-react

const MYQR = () => {
        const information = sessionStorage.getItem("myInfo");
        const myInfo = JSON.parse(information || "{}");
        const qrRef = useRef<HTMLDivElement>(null);
        // const [isCopied, setIsCopied] = useState(false);

        const handleDownload = () => {
                if (!qrRef.current) return;

                const svg = qrRef.current.querySelector("svg");
                if (!svg) return;

                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const img = new Image();
                img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);
                        const pngUrl = canvas.toDataURL("image/png");

                        const link = document.createElement("a");
                        link.href = pngUrl;
                        link.download = `${myInfo.name || "myInfo"}-qr.png`;
                        link.click();
                };

                img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
        };

        // const handleCopy = () => {
        //         if (!myInfo || !myInfo.id) return;
        //         const text = JSON.stringify({
        //                 id: myInfo.id,
        //                 name: myInfo.name,
        //                 publicEncryptionKey: myInfo.publicEncryptionKey,
        //                 publicSigningKey: myInfo.publicSigningKey,
        //         });
        //         navigator.clipboard.writeText(text);
        //         setIsCopied(true);
        //         setTimeout(() => setIsCopied(false), 2000);
        // };

        if (!myInfo || !myInfo.id) {
                return (
                        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                                <Card className="w-full max-w-md p-6 text-center">
                                        <CardHeader>
                                                <CardTitle className="text-xl font-bold text-gray-800">
                                                        No Information Found
                                                </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <p className="text-gray-600">
                                                        Please generate your keys first to view your QR code.
                                                </p>
                                        </CardContent>
                                </Card>
                        </div>
                );
        }

        const qrData = {
                id: myInfo.id,
                name: myInfo.name,
                publicEncryptionKey: myInfo.publicEncryptionKey,
                publicSigningKey: myInfo.publicSigningKey,
        };

        return (
                <div className="flex flex-col items-center justify-start  bg-gradient-to-br from-blue-50 to-indigo-50 py-10 space-y-8 px-4">
                        <Card className="w-full max-w-md shadow-xl border-none">
                                <CardHeader className="text-center">
                                        <CardTitle className="text-2xl font-bold text-gray-800 uppercase">
                                                {myInfo.name || "My Information"} QR
                                        </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center space-y-6">
                                        <div
                                                ref={qrRef}
                                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-auto"
                                        >
                                                <QRCode
                                                        value={JSON.stringify(qrData)}
                                                        size={256}
                                                        bgColor="#ffffff"
                                                        fgColor="#1e40af"
                                                />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                                                <Button
                                                        onClick={handleDownload}
                                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                                                >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download QR
                                                </Button>
                                                {/* <Button
                                                        onClick={handleCopy}
                                                        className="w-full sm:w-auto bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                >
                                                        {isCopied ? (
                                                                <>
                                                                        <Check className="mr-2 h-4 w-4" />
                                                                        Copied!
                                                                </>
                                                        ) : (
                                                                // <>
                                                                //         <Copy className="mr-2 h-4 w-4" />
                                                                //         Copy Data
                                                                // </>
                                                        )}
                                                </Button> */}
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        );
};

export default MYQR;
