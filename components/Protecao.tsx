import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {CheckCircle, FileText, Lock, Shield} from "lucide-react";
import {Button} from "@/components/utils/components/button";

export function Protecao({stepState, setStepState, setIsStepComplete}) {
    const {isEncrypting, isEncrypted, encryptionSteps} = stepState;
    const [publicKey, setpublicKey] = useState<CryptoKey>(null);
    const [symmetricKey, setSymmetricKey] = useState(null);
    const [symmetricOriginalKey, setSymmetricOriginalKey] = useState(null);
    const [keyCifrada, setkeyCifrada] = useState<any>(null);


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


            const protecao = await fetch('http://localhost:8083/aes/chaves/cifrar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
            });

            if (!protecao.ok) throw new Error('Erro ao cifrar chave simetrica.');

            const protecaoChaveSimetrica = await protecao.json();
            setSymmetricKey(protecaoChaveSimetrica?.chaveSimetricaCifraca)
            console.log('Chave Simetrica Cifrada:', protecaoChaveSimetrica);


            const chaveSimetrica = await fetch('http://localhost:8083/aes/chaves', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            });

            if (!chaveSimetrica.ok) throw new Error('Erro ao recuperar chave simétrica.');

            const chavesSimetricasRecuperadas = await chaveSimetrica.json();


            if (!Array.isArray(chavesSimetricasRecuperadas) || chavesSimetricasRecuperadas.length === 0) {
                throw new Error('Nenhuma chave simétrica encontrada.');
            }


            const ultimaChave = chavesSimetricasRecuperadas[chavesSimetricasRecuperadas.length - 1];


            setSymmetricOriginalKey(ultimaChave?.chaveBase64);

            console.log('Última Chave Simétrica Recuperada:', ultimaChave);


            setStepState({
                isEncrypting: false,
                isEncrypted: true,
                encryptionSteps: steps,
                currentStep: steps.length,
            });

            // alert("Chave Simetrica Cifrada Com Sucesso !!")
        } catch (error) {
            console.error("Erro ao cifrar a chave:", error);
            setStepState({
                isEncrypting: false,
                isEncrypted: false,
                encryptionSteps: ["Erro ao realizar a cifragem da chave simetrica."],
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

    // Formatar a chave simétrica em várias linhas
    const formatKey = (key) => {
        const chunkSize = 64;
        const chunks = key.match(new RegExp('.{1,' + chunkSize + '}', 'g')); // Quebra a chave em pedaços
        return chunks ? chunks.join('\n') : key; // Junta as linhas quebradas
    };

    const getKeySizeInBytes = (key) => {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(key);
        return encoded.length; // Retorna o tamanho da chave em bytes
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


                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-900">
                                        Chave Simétrica Original:
                                    </p>
                                    {symmetricOriginalKey ? (
                                        <div>
                                            <code
                                                className="text-sm text-blue-600 break-words block whitespace-pre-line">
                                                {formatKey(symmetricOriginalKey)}
                                            </code>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p>
                                                    <strong>Tamanho:</strong> {getKeySizeInBytes(symmetricOriginalKey)} bytes
                                                </p>
                                                <p>
                                                    <strong>Algoritmo:</strong> AES
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Aguardando retorno do backend...
                                        </p>
                                    )}
                                </div>


                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-900">
                                        Chave Simétrica Cifrada:
                                    </p>
                                    {symmetricKey ? (
                                        <div>
                                            <code
                                                className="text-sm text-blue-600 break-words block whitespace-pre-line">
                                                {formatKey(symmetricKey)}
                                            </code>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p>
                                                    <strong>Tamanho:</strong> {getKeySizeInBytes(symmetricKey)} bytes
                                                </p>
                                                <p>
                                                    <strong>Algoritmo:</strong> AES
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Aguardando retorno do backend...
                                        </p>
                                    )}
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
