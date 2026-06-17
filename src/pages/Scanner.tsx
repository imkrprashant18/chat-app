

import type React from "react"

import { useState, useRef, useCallback } from "react"

import jsQR from "jsqr"
import { CheckCircle2, Upload, AlertCircle } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"


interface ScannedFriendData {
        id: string
        name: string
        publicEncryptionKey: string
        publicSigningKey: string
}

// interface Props {
//         handleCancel?: () => void
// }
interface Props {
        onSuccess?: () => void
}
export default function Scanner({ onSuccess }: Props) {
        const [friendName, setFriendName] = useState("")
        const [scannedData, setScannedData] = useState<ScannedFriendData | null>(null)
        const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
                type: null,
                message: "",
        })
        const fileInputRef = useRef<HTMLInputElement>(null)

        const parseQRText = useCallback((text: string) => {
                try {
                        const parsed = JSON.parse(text)

                        if (parsed.id && parsed.publicEncryptionKey && parsed.publicSigningKey) {
                                setScannedData(parsed)
                                setStatus({ type: "success", message: "QR scanned successfully" })
                        } else {
                                throw new Error("Invalid QR structure")
                        }
                } catch (error) {
                        setStatus({ type: "error", message: "Invalid QR code data" })
                        console.log(error)
                }
        }, [])

        const handleImageUpload = useCallback(
                async (e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        const img = new window.Image()
                        img.crossOrigin = "anonymous"
                        img.src = URL.createObjectURL(file)

                        img.onload = () => {
                                const canvas = document.createElement("canvas")
                                const ctx = canvas.getContext("2d")
                                if (!ctx) return

                                canvas.width = img.width
                                canvas.height = img.height
                                ctx.drawImage(img, 0, 0)

                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                                const code = jsQR(imageData.data, imageData.width, imageData.height)

                                if (code?.data) {
                                        parseQRText(code.data)
                                } else {
                                        setStatus({ type: "error", message: "No QR code found in image" })
                                }

                                URL.revokeObjectURL(img.src)
                        }

                        img.onerror = () => {
                                setStatus({ type: "error", message: "Failed to load image" })
                                URL.revokeObjectURL(img.src)
                        }
                },
                [parseQRText],
        )

        const handleSave = useCallback(() => {
                if (!friendName.trim()) {
                        setStatus({ type: "error", message: "Please enter a friend name" })
                        return
                }

                if (!scannedData) {
                        setStatus({ type: "error", message: "No QR code scanned yet" })
                        return
                }

                const existingFriends = JSON.parse(sessionStorage.getItem("friends") || "{}")
                existingFriends[friendName.trim()] = {
                        ...scannedData,
                        addedAt: new Date().toISOString(),
                }

                sessionStorage.setItem("friends", JSON.stringify(existingFriends))
                onSuccess?.()
                setStatus({ type: "success", message: `Saved ${friendName} successfully` })
                setFriendName("")
                setScannedData(null)

        }, [friendName, scannedData, onSuccess])

        return (
                <div className="min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 overflow-auto">

                        <div className="w-full max-w-2xl space-y-6">


                                {/* Main Card */}
                                <Card className="border-0 shadow-2xl backdrop-blur-sm bg-card/80">
                                        <CardContent className="p-8 space-y-6">
                                                {/* Scanner Section */}
                                                <Separator className="my-6" />
                                                {/* Image Upload Section */}
                                                <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                                <Upload className="w-5 h-5 text-primary" />
                                                                <h2 className="font-semibold text-lg text-foreground">Or Upload Image</h2>
                                                        </div>
                                                        <div
                                                                className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30"
                                                                onClick={() => fileInputRef.current?.click()}
                                                        >
                                                                <Input
                                                                        ref={fileInputRef}
                                                                        type="file"
                                                                        accept="image/png, image/jpeg, image/webp"
                                                                        onChange={handleImageUpload}
                                                                        className="hidden"
                                                                />
                                                                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or WebP</p>
                                                        </div>
                                                </div>

                                                <Separator className="my-6" />

                                                {/* Scanned Data Preview */}
                                                {scannedData && (
                                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                                <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                                <h3 className="font-semibold text-foreground">Friend Verified</h3>
                                                                        </div>
                                                                        <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/30">
                                                                                Valid QR
                                                                        </Badge>
                                                                </div>

                                                                {/* <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border/50">
                                                                        <InfoRow label="Friend ID" value={scannedData.id} />
                                                                        <Separator className="my-2" />
                                                                        <InfoRow label="Encryption Key" value={scannedData.publicEncryptionKey} />
                                                                        <Separator className="my-2" />
                                                                        <InfoRow label="Signing Key" value={scannedData.publicSigningKey} />
                                                                </div> */}
                                                        </div>
                                                )}

                                                {/* Friend Name Input */}
                                                <div className="space-y-3">
                                                        <label htmlFor="friendName" className="text-sm font-medium text-foreground">
                                                                Friend's Name
                                                        </label>
                                                        <Input
                                                                id="friendName"
                                                                placeholder="Enter friend's name"
                                                                value={friendName}
                                                                onChange={(e) => setFriendName(e.target.value)}
                                                                onKeyPress={(e) => e.key === "Enter" && handleSave()}
                                                                className="h-12 rounded-lg bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                                                        />
                                                </div>

                                                {/* Status Messages */}
                                                {status.message && (
                                                        <div
                                                                className={`flex items-center gap-2 p-4 rounded-lg animate-in fade-in duration-300 ${status.type === "success"
                                                                        ? "bg-green-500/10 text-green-700 border border-green-500/30"
                                                                        : "bg-red-500/10 text-red-700 border border-red-500/30"
                                                                        }`}
                                                        >
                                                                {status.type === "success" ? (
                                                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                                ) : (
                                                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                                )}
                                                                <p className="text-sm font-medium">{status.message}</p>
                                                        </div>
                                                )}

                                                {/* Save Button */}
                                                <Button
                                                        onClick={handleSave}
                                                        disabled={!scannedData}
                                                        size="lg"
                                                        className="w-full h-12  bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all duration-200"
                                                >
                                                        Continue Chat with {friendName || scannedData?.name}
                                                </Button>
                                        </CardContent>
                                </Card>

                                {/* Info Footer */}
                                <p className="text-center text-sm text-muted-foreground">
                                        Your QR code data is encrypted and stored securely in your session
                                </p>
                        </div>
                </div >
        )
}

// interface InfoRowProps {
//         label: string
//         value: string
// }

// function InfoRow({ label, value }: InfoRowProps) {
//         const [copied, setCopied] = useState(false)

//         const handleCopy = () => {
//                 navigator.clipboard.writeText(value)
//                 setCopied(true)
//                 setTimeout(() => setCopied(false), 2000)
//         }

//         return (
//                 <div className="space-y-2">
//                         <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
//                         <div
//                                 onClick={handleCopy}
//                                 className="cursor-pointer group bg-background/50 hover:bg-background rounded-md p-3 text-xs font-mono text-foreground break-all transition-all hover:shadow-md"
//                         >
//                                 <span className="line-clamp-2">{value}</span>
//                                 <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
//                                         {copied ? "Copied!" : "Click to copy"}
//                                 </p>
//                         </div>
//                 </div>
//         )
// }
