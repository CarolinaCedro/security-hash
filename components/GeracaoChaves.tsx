import {useEffect} from "react";
import {motion} from "framer-motion";
import {FaInfoCircle, FaKey} from "react-icons/fa";
import NodeRSA from "node-rsa";
import CryptoJS from "crypto-js";
import axios from "axios";
import {Informativos} from "@/components/Informativos";
import {Button} from "@/components/utils/components/button";

export function GeracaoChaves({stepState, setStepState, setIsStepComplete}) {
    const {
        rsaGenerated,
        aesGenerated,
        showRSALoading,
        showAESLoading,
        showRSAKeys,
        showAESKey,
        rsaKeys,
        aesKey,
    } = stepState;

    const handleGenerateKeys = () => {
        setStepState({showRSALoading: true, showAESLoading: true});

        setTimeout(() => {
            // Gerar chave RSA
            const rsa = new NodeRSA({b: 2048});
            const publicKey = rsa.exportKey("public");
            const privateKey = rsa.exportKey("private");

            // Gerar chave AES
            const aesKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);


            setStepState({
                rsaGenerated: true,
                aesGenerated: true,
                showRSALoading: false,
                showAESLoading: false,
                showRSAKeys: true,
                showAESKey: true,
                rsaKeys: {publicKey, privateKey},
                aesKey,
            });

            // Enviar chaves para o backend
            saveKeysToBackend(publicKey, privateKey, aesKey);
        }, 2000);
    };

    const formatKeyForBackend = (key) => {
        // Remove cabeçalhos, rodapés e quebras de linha do PEM
        return key
            .replace(/-----BEGIN [\w\s]+-----/g, "") // Remove o cabeçalho
            .replace(/-----END [\w\s]+-----/g, "") // Remove o rodapé
            .replace(/\n/g, ""); // Remove quebras de linha
    };

    const saveKeysToBackend = async (publicKey, privateKey, aesKey) => {

        console.log("as chaves sendo passadas para ser salvas", publicKey, privateKey, aesKey)

        try {
            // Formatar as chaves para o formato esperado pelo backend
            const formattedPublicKey = formatKeyForBackend(publicKey);
            const formattedPrivateKey = formatKeyForBackend(privateKey);

            // Salvar chave pública
            const publicKeyResponse = await axios.post("http://localhost:8083/rsa/chaves", {
                tipo: "publica",
                chavePem: formattedPublicKey,
            });

            // Salvar chave privada
            const privateKeyResponse = await axios.post("http://localhost:8083/rsa/chaves", {
                tipo: "privada",
                chavePem: formattedPrivateKey,
            });

            // Salvar chave AES (não precisa de formatação, supondo que já está no formato adequado)
            const aesKeyResponse = await axios.post("http://localhost:8083/aes/chaves", {
                chaveBase64: aesKey,
            });

            // Exibir mensagem de sucesso
            console.log("Todas as chaves foram salvas com sucesso!");
            alert("Dados salvos com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar chaves no backend", error);
            alert("Erro ao salvar dados. Verifique o console para mais detalhes.");
        }
    };


    const handleReset = () => {
        setTimeout(() => {
            setStepState({
                rsaGenerated: false,
                aesGenerated: false,
                showRSALoading: false,
                showAESLoading: false,
                showRSAKeys: false,
                showAESKey: false,
                rsaKeys: null,
                aesKey: null,
            });
        }, 2000);
    };

    const downloadFile = (filename, content) => {
        const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    useEffect(() => {
        setIsStepComplete(rsaGenerated && aesGenerated);
    }, [rsaGenerated, aesGenerated, setIsStepComplete]);

    return (
        <div className="space-y-8 h-full flex flex-col">
            <h2 className="text-xl font-bold text-center">Geração de Chaves</h2>

            <div className="flex flex-col items-center gap-6">
                <Button
                    onClick={handleGenerateKeys}
                    className={`flex items-center gap-3 px-6 py-3 rounded-md text-white font-medium shadow-md transition-all duration-200 ${
                        rsaGenerated && aesGenerated ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500"
                    }`}
                    disabled={rsaGenerated && aesGenerated}
                    style={{backgroundColor: "#F5CF3D"}}
                >
                    <FaKey className="text-xl"/>
                    {rsaGenerated && aesGenerated ? "Chaves Geradas" : "Gerar chave RSA/AES"}
                </Button>

                {(showRSALoading || showAESLoading) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{scale: 0.8, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0.8, opacity: 0}}
                            transition={{duration: 0.3}}
                            className="bg-white p-8 rounded-lg shadow-lg w-[600px]"
                        >
                            <div className="space-y-4 flex flex-col items-center justify-center">
                                <motion.div
                                    initial={{rotate: 0}}
                                    animate={{rotate: 360}}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "linear",
                                    }}
                                    className="text-yellow-500"
                                >
                                    <FaKey className="text-5xl"/>
                                </motion.div>
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{duration: 1, repeat: Infinity, repeatType: "reverse"}}
                                    className="text-center text-lg font-medium text-gray-700"
                                >
                                    Gerando chaves...
                                </motion.div>
                                <motion.div
                                    initial={{width: "0%"}}
                                    animate={{width: "100%"}}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "loop",
                                    }}
                                    className="w-full bg-gray-200 h-2 rounded-full overflow-hidden"
                                >
                                    <motion.div
                                        initial={{x: "-100%"}}
                                        animate={{x: "100%"}}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className="h-full bg-yellow-500"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {(showRSAKeys || showAESKey) && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.5}}
                        className="flex flex-col gap-6 w-full max-w-4xl"
                    >
                        <h3 className="text-2xl font-semibold text-gray-700 text-center">Chaves Geradas</h3>
                        <div className="flex flex-col gap-6 w-full">
                            {showRSAKeys && (
                                <>
                                    <Informativos
                                        title="Chave Pública RSA"
                                        content={rsaKeys.publicKey}
                                        bgColor="#e3f8f3"
                                        textColor="#05668d"
                                    />
                                    <Informativos
                                        title="Chave Privada RSA"
                                        content={rsaKeys.privateKey}
                                        bgColor="#e3f8f3"
                                        textColor="#05668d"
                                    />
                                    <Button
                                        style={{
                                            backgroundColor: "#F5CF3D",
                                            textAlign: 'center',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onClick={() => downloadFile("publicKey.pem", rsaKeys.publicKey)}
                                    >
                                        Baixar Chave Pública
                                    </Button>

                                    <Button
                                        style={{
                                            backgroundColor: "#F5CF3D",
                                            textAlign: 'center',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        onClick={() => downloadFile("privateKey.pem", rsaKeys.privateKey)}
                                    >
                                        Baixar Chave Privada
                                    </Button>
                                </>
                            )}

                            {showAESKey && (
                                <Informativos
                                    title="Chave AES"
                                    content={aesKey}
                                    bgColor="#fdecef"
                                    textColor="#7f1d1d"
                                />
                            )}
                            {showAESKey && (
                                <Button
                                    style={{
                                        backgroundColor: "#F5CF3D",
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onClick={() => downloadFile("aesKey.txt", aesKey)}
                                >
                                    Baixar Chave AES
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}

                {rsaGenerated && aesGenerated && (
                    <Button
                        onClick={handleReset}
                        className="flex items-center gap-3 px-6 py-3 rounded-md text-gray-700 font-medium shadow-md transition-all duration-200 bg-red-500 hover:bg-red-600"
                    >
                        <FaInfoCircle className="text-xl"/>
                        Resetar
                    </Button>
                )}
            </div>
        </div>
    );
}
