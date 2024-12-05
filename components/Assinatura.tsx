import {motion} from 'framer-motion';
import {useState} from 'react';
import {FaFile, FaLock, FaSignature, FaCheckCircle} from 'react-icons/fa';

export function Assinatura({stepState, setStepState, setIsStepComplete}) {
    const {isSigningAnimating, isEncryptingAnimating, isSigned, isEncrypted} = stepState;
    const [isSuccess, setIsSuccess] = useState(false);

    const publicKeyData = {
        kty: "RSA",
        n: "sXchfDjqQWcmrXmI7K-Uk3Zn_OpIh9rj7jvThVgU8JxECcfT6fj6Ltnon9pyZjFXZGE5LQwVV3O_yOkkz9wnxfQjjklwqqdDsptD7b5ya4kHs3EqtJ_7dO6QihAlCROBBvbjpXYD0u3wQeaw3SZMjt21YtnwM9wkhPzYlgwnxR85L6O29Kjjq-cRbiwFlw4JlrxJwb2WxRU3tFgdjdFfnSQgsRj4wHDA1H48OT_JjGnWsqw8nvUy4hP5byZJfT7ROg8JdEC41uoF2EABrqgxuJyg8gGbJt1hPo6hvqjGgMCg4n9AqRmyFcWtvUQ",
        e: "AQAB"
    };


    const symmetricKeyData = 'd1210700aab38102789b9c455e915a5c7912bf551e92908a492a73133c6310e5';
    const fileHash = '17bf4b46701313ea8fbaf838c24b8647d39bff0a9d2b45f403cb72ba420bd4bd';

    const signDocument = async (document, privateKey) => {
        return await crypto.subtle.sign(
            { name: 'RSASSA-PKCS1-v1_5' },
            privateKey, // Use apenas a chave privada aqui
            document
        );
    };

    const encryptDocument = async (document, symmetricKey) => {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        return await crypto.subtle.encrypt(
            {name: 'AES-GCM', iv},
            symmetricKey,
            document
        );
    };

    const startProcess = async () => {
        try {
            // Prepare the document
            const file = new TextEncoder().encode(fileHash);

            // Generate a new key pair for signing
            const keyPair = await crypto.subtle.generateKey(
                {
                    name: "RSASSA-PKCS1-v1_5",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: { name: "SHA-256" },
                },
                true,
                ["sign", "verify"]
            );

            // Start signing animation
            setStepState({ ...stepState, isSigningAnimating: true });

            // Pass the private key for signing
            const signedDocument = await signDocument(file, keyPair.privateKey);
            setStepState({ ...stepState, isSigningAnimating: false, isSigned: true });

            // Convert and import symmetric key
            const symmetricKeyBytes = Uint8Array.from(Buffer.from(symmetricKeyData, 'hex'));
            const symmetricKey = await crypto.subtle.importKey(
                'raw',
                symmetricKeyBytes,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );

            // Start encryption animation
            setStepState({ ...stepState, isEncryptingAnimating: true });
            const encryptedDocument = await encryptDocument(signedDocument, symmetricKey);
            setStepState({ ...stepState, isEncryptingAnimating: false, isEncrypted: true });

            // Process completed successfully
            setIsSuccess(true);
            setIsStepComplete(true);
        } catch (error) {
            console.error("Erro durante o processo:", error);
        }
    };

    const getStatusText = () => {
        if (!isSigned) return 'Assine o documento para começar.';
        if (!isEncrypted) return 'Cifre o documento para finalizar.';
        return 'Documento assinado e cifrado com sucesso!';
    };

    return (
        <div
            className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 p-10 rounded-lg shadow-lg space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Processo de Assinatura e Cifragem</h2>

            <div className="relative flex items-center w-full max-w-md">
                <div className="absolute w-full h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 flex">
                    <motion.div
                        className="h-1 bg-blue-500"
                        initial={{width: 0}}
                        animate={{
                            width: isSigningAnimating || isEncryptingAnimating ? '50%' : isSigned ? '100%' : 0,
                        }}
                        transition={{duration: 1}}
                    />
                </div>
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10"
                    animate={{scale: isSigningAnimating ? 1.2 : 1}}
                >
                    <FaFile className="text-gray-500"/>
                </motion.div>
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10 ml-auto"
                    animate={{
                        scale: isEncryptingAnimating ? 1.2 : isEncrypted ? 1.5 : 1,
                        backgroundColor: isEncrypted ? '#FFD700' : '#FFFFFF',
                    }}
                >
                    {isSigned && !isEncryptingAnimating && !isEncrypted ? (
                        <FaSignature className="text-blue-500"/>
                    ) : isEncrypted ? (
                        <FaLock className="text-green-500"/>
                    ) : null}
                </motion.div>
            </div>

            <button onClick={startProcess} className="btn btn-primary">Iniciar Processo</button>
            <p>{getStatusText()}</p>
        </div>
    );
}
