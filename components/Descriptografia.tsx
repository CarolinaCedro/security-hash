import { motion } from "framer-motion";
import { KeyIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import axios from "axios";  // Para facilitar a requisição HTTP

export function Descriptografia() {
    const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
    const [currentStep, setCurrentStep] = useState(0); // Etapas: 0 = início, 1 = AES, 2 = Descriptografia, 3 = Verificação
    const [privateKey, setPrivateKey] = useState("");
    const [fileContent, setFileContent] = useState("");  // Estado para armazenar o conteúdo do arquivo descriptografado

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

        try {
            // Requisição HTTP para o endpoint
            const response = await axios.post("http://localhost:8083/desempacotar/verificar-e-descriptografar", {
                privateKey: privateKey,
            });

            // Atualizar o estado com o conteúdo do arquivo
            setFileContent(response.data);  // Supondo que a resposta seja o conteúdo do arquivo em texto

            setStatus("success");
        } catch (error) {
            console.error("Erro ao descriptografar:", error);
            setStatus("idle");
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setPrivateKey("");
        setCurrentStep(0);
        setFileContent("");  // Limpar o conteúdo do arquivo
    };

    const steps = [
        { title: "Recuperação da chave AES", description: "Usando a chave privada RSA do professor", icon: <KeyIcon className="w-8 h-8 text-yellow-500" /> },
        { title: "Descriptografia de arquivo", description: "Usando a chave AES recuperada", icon: <LockClosedIcon className="w-8 h-8 text-brown-500" /> },
        { title: "Verificação da assinatura", description: "Usando a chave pública do aluno", icon: <ShieldCheckIcon className="w-8 h-8 text-purple-500" /> },
    ];

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-md">
            {/* Título e descrição */}
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-blue-600">Processo de Descriptografia</h2>
                <p className="text-gray-600">
                    Complete o processo para descriptografar o arquivo e verificar a assinatura.
                </p>
                {/* Explicação da importância */}
                <div className="space-y-4 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <InformationCircleIcon className="w-8 h-8 text-yellow-600"/>
                        <h3 className="text-xl font-semibold text-gray-800">Por que é importante?</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Este processo garante que o arquivo recebido foi corretamente enviado e que o conteúdo não foi
                        alterado. A utilização da chave privada RSA
                        do professor para recuperar a chave simétrica AES e a verificação da assinatura digital são
                        fundamentais para a segurança e
                        autenticidade da informação.
                    </p>
                </div>

                <div className="space-y-4 bg-green-50 p-4 rounded-lg shadow-md">
                    <div className="flex items-start space-x-3">
                        <InformationCircleIcon className="w-8 h-8 text-green-600"/>
                        <h3 className="text-xl font-semibold text-gray-800">Importação Chave de Segurança Privada</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                        A chave privada desempenha um papel essencial na segurança dos dados. Ela é usada para
                        descriptografar informações que foram criptografadas com a chave pública correspondente. Ao
                        garantir a privacidade e integridade dos dados, a chave privada impede que dados sensíveis sejam
                        acessados por partes não autorizadas.
                    </p>
                    <p className="text-gray-700 text-sm">
                        O processo de descriptografar um arquivo com a chave privada envolve basicamente três etapas:
                    </p>
                    <div className="flex items-start space-x-3">
                        <LockClosedIcon className="w-6 h-6 text-green-500"/>
                        <p className="text-gray-700 text-sm">1. Obtenção do arquivo criptografado.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <KeyIcon className="w-6 h-6 text-green-500"/>
                        <p className="text-gray-700 text-sm">2. Uso da chave privada para descriptografá-lo.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <ShieldCheckIcon className="w-6 h-6 text-green-500"/>
                        <p className="text-gray-700 text-sm">3. Acesso ao conteúdo do arquivo de forma segura e
                            protegida.</p>
                    </div>
                    <p className="text-gray-700 text-sm">
                        Não é necessário fazer o upload da chave privada, pois ela foi salva com segurança em um local
                        protegido. Durante o processo de descriptografação, a chave será recuperada automaticamente,
                        garantindo a segurança e a integridade do procedimento.
                    </p>
                </div>


            </motion.div>

            {/* Campo de entrada */}
            {/*<div className="space-y-4">*/}
            {/*    <label className="block text-sm font-medium text-gray-700">Chave Privada do Professor</label>*/}
            {/*    <motion.input*/}
            {/*        type="text"*/}
            {/*        value={privateKey}*/}
            {/*        onChange={(e) => setPrivateKey(e.target.value)}*/}
            {/*        placeholder="Digite sua chave privada RSA"*/}
            {/*        className="w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-blue-300 focus:border-blue-500"*/}
            {/*    />*/}
            {/*</div>*/}

            {/* Feedback visual com animação */}
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
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
                    <div
                        className="flex flex-col items-center space-y-4 p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
                        <ShieldCheckIcon className="w-16 h-16 text-green-500 animate-bounce"/>
                        <p className="text-green-600 text-xl font-semibold">Processo concluído com sucesso!</p>
                        <p className="text-gray-600 text-lg">Conteúdo do arquivo:</p>

                        <div className="w-full overflow-x-auto bg-gray-100 p-4 rounded-md max-h-96">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">{fileContent}</pre>
                        </div>
                    </div>

                )}
            </motion.div>

            {/* Botões de controle */}
            <div className="space-y-4">
                <button
                    onClick={handleProcess}
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
