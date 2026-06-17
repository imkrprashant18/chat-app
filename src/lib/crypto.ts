
const enc = new TextEncoder();
const dec = new TextDecoder();


export function arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode(...chunk);
        }
        return btoa(binary);
}

export function base64ToArrayBuffer(b64: string): ArrayBuffer {
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
}


export async function generateEncryptionKeyPair() {
        return crypto.subtle.generateKey(
                { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
                true,
                ["encrypt", "decrypt"]
        );
}

export async function generateSigningKeyPair() {
        return crypto.subtle.generateKey(
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["sign", "verify"]
        );
}

export async function exportPublicKey(key: CryptoKey) {
        return arrayBufferToBase64(await crypto.subtle.exportKey("spki", key));
}

export async function exportPrivateKey(key: CryptoKey) {
        return arrayBufferToBase64(await crypto.subtle.exportKey("pkcs8", key));
}

export async function importEncryptionPublicKey(base64: string) {
        return crypto.subtle.importKey(
                "spki",
                base64ToArrayBuffer(base64),
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
        );
}

export async function importEncryptionPrivateKey(base64: string) {
        return crypto.subtle.importKey(
                "pkcs8",
                base64ToArrayBuffer(base64),
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["decrypt"]
        );
}

export async function importSigningPublicKey(base64: string) {
        return crypto.subtle.importKey(
                "spki",
                base64ToArrayBuffer(base64),
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["verify"]
        );
}

export async function importSigningPrivateKey(base64: string) {
        return crypto.subtle.importKey(
                "pkcs8",
                base64ToArrayBuffer(base64),
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["sign"]
        );
}


export async function encryptAndSign(
        plaintext: string,
        receiverPublicKey: CryptoKey,
        senderSigningPrivateKey: CryptoKey
) {
        const ciphertextBuffer = await crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                receiverPublicKey,
                enc.encode(plaintext)
        );

        const signatureBuffer = await crypto.subtle.sign(
                { name: "ECDSA", hash: "SHA-256" },
                senderSigningPrivateKey,
                ciphertextBuffer
        );

        return {
                ciphertext: arrayBufferToBase64(ciphertextBuffer),
                signature: arrayBufferToBase64(signatureBuffer)
        };
}

export async function verifyAndDecrypt(
        payload: { ciphertext: string; signature: string },
        senderSigningPublicKey: CryptoKey,
        receiverPrivateKey: CryptoKey
) {
        const ciphertextBuffer = base64ToArrayBuffer(payload.ciphertext);
        const signatureBuffer = base64ToArrayBuffer(payload.signature);

        const valid = await crypto.subtle.verify(
                { name: "ECDSA", hash: "SHA-256" },
                senderSigningPublicKey,
                signatureBuffer,
                ciphertextBuffer
        );

        if (!valid) throw new Error("Invalid signature");

        const plaintextBuffer = await crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                receiverPrivateKey,
                ciphertextBuffer
        );

        return dec.decode(plaintextBuffer);
}
