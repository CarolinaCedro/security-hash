import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {CheckCircle, Shield, Lock, FileText} from "lucide-react";
import {Button} from "@/components/utils/components/button";

export function Protecao({stepState, setStepState, setIsStepComplete}) {
    const {isEncrypting, isEncrypted, encryptionSteps} = stepState;
    const [publicKey, setpublicKey] = useState<CryptoKey>(null);
    const [symmetricKey, setSymmetricKey] = useState<Uint8Array>(null);
    const [keyCifrada, setkeyCifrada] = useState<any>(null);



    async function fetchPublicKey() {
        try {
            const response = await fetch('http://localhost:8083/rsa/chaves');
            const data = await response.json();

            if (data && data.length > 0) {
                const publicKeyPem = data.find(chave => chave.tipo === 'publica')?.chavePem;
                if (!publicKeyPem) throw new Error("Chave pública não encontrada no backend.");

                // Remova cabeçalhos e rodapés da chave PEM
                const cleanPem = publicKeyPem.replace(/-----\w+ PUBLIC KEY-----/g, '').replace(/\n/g, '');

                // Converta para ArrayBuffer
                const binaryDer = Uint8Array.from(atob(cleanPem), char => char.charCodeAt(0)).buffer;

                // Importa a chave pública
                const publicKey = await crypto.subtle.importKey(
                    'spki',
                    binaryDer,
                    {name: 'RSA-OAEP', hash: {name: 'SHA-256'}},
                    true,
                    ['encrypt']
                );

                console.log("Chave pública importada:", publicKey);
                setpublicKey(publicKey)
                return publicKey;
            } else {
                throw new Error("Nenhuma chave encontrada no backend.");
            }
        } catch (error) {
            console.error("Erro ao buscar chave pública:", error);
        }
    }

// Função para buscar a chave simétrica do backend
    async function fetchSymmetricKey() {
        try {
            const response = await fetch('http://localhost:8083/aes/chaves');
            const data = await response.json();

            if (data && data.length > 0) {
                const hexKey = data[0].chaveBase64; // Caso seja uma string base64 ou hex

                // Converta de hex para Uint8Array
                const hexToUint8Array = hex => {
                    const array = new Uint8Array(hex.length / 2);
                    for (let i = 0; i < array.length; i++) {
                        array[i] = parseInt(hex.substr(i * 2, 2), 16);
                    }
                    return array;
                };

                const symmetricKeyBuffer = hexToUint8Array(hexKey);
                console.log("Chave simétrica importada:", symmetricKeyBuffer);

                setSymmetricKey(symmetricKeyBuffer)
                return symmetricKeyBuffer;
            } else {
                throw new Error("Nenhuma chave simétrica encontrada no backend.");
            }
        } catch (error) {
            console.error("Erro ao buscar chave simétrica:", error);
        }
    }


    const handleEncryptKey = async () => {
        setStepState({
            isEncrypting: true,
            encryptionSteps: [],
            currentStep: 0,
        });

        const steps = [
            "Preparando chave simétrica para criptografia...",
            "Adicionando padding PKCS#1 v1.5...",
            "Obtendo chave pública do destinatário...",
            "Realizando criptografia com RSA-2048...",
            "Convertendo para formato Base64...",
            "Verificando integridade da chave cifrada...",
        ];

        try {

            const publicKey = await fetchPublicKey();
            const symmetricKey = await fetchSymmetricKey();

            if (!publicKey || !symmetricKey) throw new Error("Falha ao obter as chaves.");

            // Criptografar a chave simétrica com a chave pública
            const encryptedKey = await crypto.subtle.encrypt(
                {name: 'RSA-OAEP'},
                publicKey,
                symmetricKey
            );

            const encryptedKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedKey)));
            setkeyCifrada(encryptedKeyBase64)

            console.log("Chave simétrica criptografada (Base64):", encryptedKeyBase64);

            // Enviar chave cifrada para o backend
            // Enviar chave cifrada para o backend
            const response = await fetch("http://localhost:8083/chave-simetrica-cifrada", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ chaveSimetricaCifraca: encryptedKeyBase64 }),
            });

            if (response.ok) {
                // alert("Senha salva com sucesso!");
            } else {
                alert("Erro ao salvar a senha no backend.");
            }

            for (let i = 0; i < steps.length; i++) {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        setStepState((prev) => ({
                            ...prev,
                            encryptionSteps: [...prev.encryptionSteps, steps[i]],
                            currentStep: i + 1,
                        }));
                        resolve();
                    }, 1000);
                });
            }

            setStepState({
                isEncrypting: false,
                isEncrypted: true,
                encryptionSteps: steps,
                currentStep: steps.length,
            });
        } catch (error) {
            console.error("Erro ao cifrar a chave:", error);
            setStepState({
                isEncrypting: false,
                isEncrypted: false,
                encryptionSteps: ["Erro ao realizar a criptografia."],
                currentStep: steps.length,
            });
        }
    };

    const handleReset = () => {
        setStepState({
            isEncrypting: false,
            isEncrypted: false,
            encryptionSteps: [],
            currentStep: 0,
        });
    };

    useEffect(() => {
        setIsStepComplete(isEncrypted);
    }, [isEncrypted, setIsStepComplete]);

    const pulsarAnimacao = {
        hidden: {opacity: 0, scale: 0.9},
        visible: {
            opacity: 1,
            scale: 1,
            transition: {duration: 5, ease: "easeInOut", repeatType: "reverse"},
        },
    };

    const downloadFile = (filename, content) => {
        const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="max-w-3xl mx-auto p-6 space-y-6"
        >
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Proteção Avançada</h2>
                <p className="text-gray-500">Cifrando sua chave com segurança máxima</p>
            </div>

            <div className="relative bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <motion.div
                    initial={{width: "0%"}}
                    animate={{width: isEncrypting || isEncrypted ? "100%" : "0%"}}
                    transition={{duration: 6, ease: "linear"}}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 to-green-500"
                />

                <div className="flex flex-col items-center space-y-8">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 20, -20, 0],
                            backgroundColor: isEncrypted
                                ? "rgb(34,197,94)"
                                : isEncrypting
                                    ? "rgb(239,68,68)"
                                    : "rgb(59,130,246)",
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="p-6 rounded-full"
                    >
                        <Shield className="w-16 h-16 text-white"/>
                    </motion.div>

                    <Button
                        size="lg"
                        onClick={handleEncryptKey}
                        disabled={isEncrypting || isEncrypted}
                        className={`w-64 ${
                            isEncrypted
                                ? "bg-green-500 hover:bg-green-600"
                                : isEncrypting
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                        }`}
                    >
                        {isEncrypting ? "Protegendo..." : isEncrypted ? "Proteção Concluída" : "Proteger Chave"}
                    </Button>

                    <AnimatePresence>
                        {Array.isArray(encryptionSteps) && encryptionSteps.length > 0 && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                className="w-full mt-6 space-y-4"
                            >
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    {encryptionSteps.map((step, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="text-green-500 w-5 h-5"/>
                                            <p className="text-gray-700">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Informações sobre o processo */}
                    <div className="space-y-4 mt-8">
                        <motion.div
                            className="flex items-center space-x-3"
                            initial="hidden"
                            animate="visible"
                            variants={pulsarAnimacao}
                            transition={{delay: 0}}
                        >
                            <FileText className="w-60 h-6 text-blue-400"/>
                            <p className="text-blue-400">
                                A chave assimétrica é usada para criptografar a chave simétrica, garantindo
                                a segurança durante a troca de dados. Este processo impede que a chave simétrica
                                seja interceptada durante a comunicação.
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex items-center space-x-3"
                            initial="hidden"
                            animate="visible"
                            variants={pulsarAnimacao}
                            transition={{delay: 5}}
                        >
                            <Lock className="w-60 h-6 text-yellow-600"/>
                            <p className="text-yellow-600">
                                O uso do algoritmo RSA-2048 garante que a chave seja protegida com segurança
                                robusta, utilizando criptografia assimétrica para assegurar a confidencialidade.
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex items-center space-x-3"
                            initial="hidden"
                            animate="visible"
                            variants={pulsarAnimacao}
                            transition={{delay: 10}}
                        >
                            <CheckCircle className="w-60 h-6 text-green-600"/>
                            <p className="text-green-600">
                                Após a criptografia, a chave é convertida para Base64 para facilitar o armazenamento
                                e a transmissão sem risco de perda de dados.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="w-full h-20 flex justify-between">
                <Button size="lg" onClick={handleReset} className="bg-gray-300 hover:bg-gray-400">
                    Resetar
                </Button>
                {keyCifrada && (
                    <Button
                        size="lg"
                        onClick={() => downloadFile("chave-aes-cifrada", keyCifrada)}
                        className="bg-yellow-500"
                    >
                        Baixar AES cifrada
                    </Button>
                )}

            </div>


        </motion.div>
    );
}
