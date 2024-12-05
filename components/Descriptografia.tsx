import { motion } from "framer-motion";
import { KeyIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function Descriptografia() {
    const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
    const [currentStep, setCurrentStep] = useState(0); // Etapas: 0 = início, 1 = AES, 2 = Descriptografia, 3 = Verificação
    const [privateKey, setPrivateKey] = useState("");

    const handleProcess = async () => {
        setStatus("processing");
        const steps = [
            { title: "Recuperação da chave AES", description: "Usando a chave privada RSA do professor", icon: <KeyIcon className="w-8 h-8 text-yellow-500" /> },
            { title: "Descriptografia de arquivo", description: "Usando a chave AES recuperada", icon: <LockClosedIcon className="w-8 h-8 text-brown-500" /> },
            { title: "Verificação da assinatura", description: "Usando a chave pública do aluno", icon: <ShieldCheckIcon className="w-8 h-8 text-purple-500" /> },
        ];

        for (let i = 0; i < steps.length; i++) {
            setCurrentStep(i);
            await new Promise((resolve) => setTimeout(resolve, i === 2 ? 5000 : 3000)); // Última etapa demora mais
        }

        setStatus("success");
    };

    const handleReset = () => {
        setStatus("idle");
        setPrivateKey("");
        setCurrentStep(0);
    };

    const steps = [
        { title: "Recuperação da chave AES", description: "Usando a chave privada RSA do professor", icon: <KeyIcon className="w-8 h-8 text-yellow-500" /> },
        { title: "Descriptografia de arquivo", description: "Usando a chave AES recuperada", icon: <LockClosedIcon className="w-8 h-8 text-brown-500" /> },
        { title: "Verificação da assinatura", description: "Usando a chave pública do aluno", icon: <ShieldCheckIcon className="w-8 h-8 text-purple-500" /> },
    ];

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-md">
            {/* Título e descrição */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-blue-600">Processo de Descriptografia</h2>
                <p className="text-gray-600">
                    Complete o processo para descriptografar o arquivo e verificar a assinatura.
                </p>
            </motion.div>

            {/* Campo de entrada */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Chave Privada do Professor</label>
                <motion.input
                    type="text"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Digite sua chave privada RSA"
                    className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500"
                />
            </div>

            {/* Feedback visual com animação */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 border rounded-lg shadow-lg transition-all text-center ${
                    status === "processing" ? "bg-yellow-50" : status === "success" ? "bg-green-50" : "bg-white"
                }`}
            >
                {status === "idle" && (
                    <p className="text-gray-600">Pronto para iniciar o processo.</p>
                )}
                {status === "processing" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                            {steps[currentStep].icon}
                            <h3 className="text-lg font-semibold text-gray-800">{steps[currentStep].title}</h3>
                        </div>
                        <p className="text-gray-600">{steps[currentStep].description}</p>
                        <p className="text-yellow-600 font-semibold animate-pulse">Processando{'.'.repeat((currentStep % 3) + 1)}</p>
                    </div>
                )}
                {status === "success" && (
                    <div className="flex flex-col items-center space-y-2">
                        <ShieldCheckIcon className="w-12 h-12 text-green-500 animate-bounce" />
                        <p className="text-green-600 font-semibold">Processo concluído com sucesso!</p>
                    </div>
                )}
            </motion.div>

            {/* Botões de controle */}
            <div className="space-y-4">
                <button
                    onClick={handleProcess}
                    disabled={status !== "idle" || !privateKey}
                    className="w-full py-3 bg-blue-500 text-white rounded-md shadow-lg hover:bg-blue-400 disabled:bg-gray-300"
                >
                    {status === "processing" ? "Processando..." : "Iniciar Processo"}
                </button>
                <button
                    onClick={handleReset}
                    className="w-full py-3 bg-red-500 text-white rounded-md shadow-lg hover:bg-red-400"
                >
                    Resetar
                </button>
            </div>
        </div>
    );
}
