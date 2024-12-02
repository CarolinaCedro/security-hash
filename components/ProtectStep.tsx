import {useEffect} from "react";
import {Button} from "@/components/utils/button";
import {AnimatePresence, motion} from "framer-motion";
import {CheckCircle, Shield} from "lucide-react";

export function ProtectStep({stepState, setStepState, setIsStepComplete}) {
    const {
        isEncrypting,
        isEncrypted,
        encryptionSteps,
        currentStep,
        recipientName = "Professor João",
        originalKeySize = 32, // Tamanho da chave AES (256 bits = 32 bytes)
    } = stepState;

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

        setTimeout(() => {
            setStepState({
                isEncrypting: false,
                isEncrypted: true,
            });
        }, 1000);
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
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="max-w-3xl mx-auto p-6 space-y-6"
        >
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Proteção Avançada</h2>
                <p className="text-gray-500">Cifrando sua chave com segurança máxima</p>
            </div>

            <div className="relative bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                {/* Linha animada de uma ponta a outra */}
                <motion.div
                    initial={{width: "0%"}}
                    animate={{width: isEncrypting || isEncrypted ? "100%" : "0%"}}
                    transition={{duration: 6, ease: "linear"}}
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
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                className="w-full mt-6 space-y-4"
                            >
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    {encryptionSteps.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{opacity: 0, x: -20}}
                                            animate={{opacity: 1, x: 0}}
                                            className="flex items-center space-x-2"
                                        >
                                            <CheckCircle className="w-4 h-4 text-green-500"/>
                                            <span className="text-sm text-gray-600">{step}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {isEncrypted && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    className="flex justify-center pt-4"
                >
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="hover:bg-gray-50"
                    >
                        Repetir
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}
