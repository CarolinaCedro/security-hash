import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/utils/components/button";

export function Protecao({ stepState, setStepState, setIsStepComplete }) {
    const {
        isEncrypting,
        isEncrypted,
        encryptionSteps,
        currentStep,
        recipientName = "Professor João",
        originalKeySize = 32, // Tamanho da chave AES (256 bits = 32 bytes)
    } = stepState;

    // Função para converter Hex em Uint8Array
    function hexToUint8Array(hex: string): Uint8Array {
        const bytes: number[] = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return new Uint8Array(bytes);
    }

    // Defina a chave pública diretamente no código
    const publicKeyData = {
        kty: "RSA",
        n: "sXchfDjqQWcmrXmI7K-Uk3Zn_OpIh9rj7jvThVgU8JxECcfT6fj6Ltnon9pyZjFXZGE5LQwVV3O_yOkkz9wnxfQjjklwqqdDsptD7b5ya4kHs3EqtJ_7dO6QihAlCROBBvbjpXYD0u3wQeaw3SZMjt21YtnwM9wkhPzYlgwnxR85L6O29Kjjq-cRbiwFlw4JlrxJwb2WxRU3tFgdjdFfnSQgsRj4wHDA1H48OT_JjGnWsqw8nvUy4hP5byZJfT7ROg8JdEC41uoF2EABrqgxuJyg8gGbJt1hPo6hvqjGgMCg4n9AqRmyFcWtvUQ",
        e: "AQAB"
    };

    const symmetricKeyData = 'd1210700aab38102789b9c455e915a5c7912bf551e92908a492a73133c6310e5';
    const symmetricKeyBuffer: Uint8Array = hexToUint8Array(symmetricKeyData);

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
            console.log("Iniciando a importação da chave pública...");
            const importedPublicKey = await crypto.subtle.importKey(
                "jwk",
                publicKeyData,
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                true,
                ["encrypt"]
            );
            console.log("Chave pública importada com sucesso.",importedPublicKey);

            // Certifique-se de que a chave simétrica é um Uint8Array
            if (!(symmetricKeyBuffer instanceof Uint8Array)) {
                throw new Error("A chave simétrica não está no formato correto (Uint8Array).");
            }

            console.log("Iniciando a criptografia da chave simétrica...");
            const encryptedKey = await crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
                },
                importedPublicKey,
                symmetricKeyBuffer // Passa o Uint8Array como argumento
            );
            console.log("Chave simétrica criptografada com sucesso.");

            // Passo 3: Converter para Base64
            const encryptedKeyBase64 = btoa(
                String.fromCharCode(...new Uint8Array(encryptedKey))
            );
            console.log("Chave criptografada convertida para Base64.");

            // Salvar no localStorage
            localStorage.setItem("encryptedSymmetricKey", encryptedKeyBase64);
            console.log("Chave criptografada salva no localStorage.");

            // Atualizar o estado após cada passo
            for (let i = 0; i < steps.length; i++) {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        setStepState((prev) => ({
                            ...prev,
                            encryptionSteps: [...prev.encryptionSteps, steps[i]],
                            currentStep: i + 1,
                        }));
                        resolve(null);
                    }, 1000);
                });
            }
            console.log("Passos de criptografia concluídos.");

            setStepState({
                isEncrypting: false,
                isEncrypted: true,
            });
            console.log("Estado final da criptografia: concluído com sucesso.");
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto p-6 space-y-6"
        >
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Proteção Avançada</h2>
                <p className="text-gray-500">Cifrando sua chave com segurança máxima</p>
            </div>

            <div className="relative bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                {/* Linha animada de uma ponta a outra */}
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: isEncrypting || isEncrypted ? "100%" : "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 to-green-500"
                />

                <div className="flex flex-col items-center space-y-8">
                    {/* Ícone animado */}
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
                        <Shield
                            className="w-16 h-16 text-white"
                            style={{
                                color: isEncrypted
                                    ? "rgb(255,255,255)"
                                    : isEncrypting
                                        ? "rgb(255,255,255)"
                                        : "rgb(255,255,255)",
                            }}
                        />
                    </motion.div>

                    {/* Botão de ação */}
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
                        {isEncrypting ? (
                            "Protegendo..."
                        ) : isEncrypted ? (
                            "Proteção Concluída"
                        ) : (
                            "Proteger Chave"
                        )}
                    </Button>

                    {/* Detalhes do progresso */}
                    <AnimatePresence>
                        {encryptionSteps > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full mt-6 space-y-4"
                            >
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    {encryptionSteps.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center space-x-2"
                                        >
                                            <CheckCircle className="text-green-500" />
                                            <span className="text-gray-600">{step}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="text-center mt-6">
                <Button
                    onClick={handleReset}
                    className="bg-gray-300 hover:bg-gray-400"
                >
                    Reiniciar
                </Button>
            </div>
        </motion.div>
    );
}
