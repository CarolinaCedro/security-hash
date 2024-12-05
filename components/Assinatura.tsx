import {motion} from 'framer-motion';
import {useState} from 'react';
import {FaFile, FaLock, FaSignature, FaCheckCircle, FaKey, FaFileSignature} from 'react-icons/fa';
import {Button} from "@/components/utils/components/button";

export function Assinatura({stepState, setStepState, setIsStepComplete}) {
    const {isSigningAnimating, isEncryptingAnimating, isSigned, isEncrypted} = stepState;
    const [isSuccess, setIsSuccess] = useState(false);




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

            {/* Barra de progresso e animação */}
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

            {/* Instruções explicativas sobre o processo */}
            <div className="space-y-6 w-full max-w-md">
                <div className="flex items-start space-x-4">
                    <div className="w-1/3 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                        <FaFileSignature className="text-blue-500"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Assinatura Digital</h3>
                        <p className="text-sm text-gray-600">
                            A assinatura digital garante a autenticidade e a integridade do arquivo. Ela utiliza um par
                            de chaves criptográficas (privada e pública) para garantir que o arquivo não foi alterado e
                            que a identidade do remetente é verificada.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="w-1/3 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <FaLock className="text-yellow-500"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Cifragem do Arquivo</h3>
                        <p className="text-sm text-gray-600">
                            A cifragem protege o conteúdo do arquivo contra acesso não autorizado. Com a cifragem,
                            apenas a pessoa que possui a chave de descriptografia poderá acessar o conteúdo do arquivo,
                            garantindo a privacidade das informações.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="w-1/3 h-10 bg-green-200 rounded-full flex items-center justify-center">
                        <FaKey className="text-green-500"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Proteção de Acesso</h3>
                        <p className="text-sm text-gray-600">
                            O processo de cifragem utiliza chaves simétricas e assimétricas para garantir que o arquivo
                            seja acessado apenas por destinatários autorizados. A chave simétrica, por exemplo, é usada
                            para cifrar e decifrar os dados, tornando o processo seguro e eficiente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Botão para iniciar o processo */}
            <Button
                style={{backgroundColor: "#F5CF3D"}}
                onClick={startProcess} className="btn btn-primary">
                Iniciar Processo
            </Button>

            {/* Status do processo */}
            <p className={`text-center text-lg font-semibold p-4 rounded-md ${
                isSigningAnimating || isEncryptingAnimating
                    ? 'bg-blue-100 text-blue-800'
                    : isSigned
                        ? 'bg-green-100 text-green-800'
                        : isEncrypted
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
            } transition-all duration-300 ease-in-out`}>
                {getStatusText()}
            </p>

        </div>

    );
}
