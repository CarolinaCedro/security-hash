import {useEffect} from "react";
import {motion} from "framer-motion";
import {FaInfoCircle, FaKey} from "react-icons/fa";
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

    async function handleGenerateKeysBackend() {

        setStepState({showRSALoading: true, showAESLoading: true});

        try {
            // Fazendo a requisição para gerar as chaves RSA
            const rsaResponse = await fetch('http://localhost:8083/rsa/chaves/gerarChaves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!rsaResponse.ok) {
                throw new Error('Erro ao gerar chaves RSA');
            }

            const rsaData = await rsaResponse.json();
            const {publicKey, privateKey} = rsaData.keyPar;

            // Fazendo a requisição para gerar a chave AES
            const aesResponse = await fetch('http://localhost:8083/aes/chaves/gerar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!aesResponse.ok) {
                throw new Error('Erro ao gerar chave AES');
            }

            const aesKey = await aesResponse.text(); // Pegando a chave AES como string

            // Atualizando o estado após gerar as chaves
            setTimeout(() => {
                setStepState({
                    rsaGenerated: true,
                    aesGenerated: true,
                    showRSALoading: false,
                    showAESLoading: false,
                    showRSAKeys: true,
                    showAESKey: true,
                    rsaKeys: {publicKey, privateKey}, // Chaves RSA
                    aesKey, // Chave AES
                });
            }, 2000);

            alert("Chaves Geradas com sucesso!")

        } catch (error) {
            console.error('Erro ao gerar as chaves:', error);
            alert('Erro ao gerar as chaves')
            setStepState({
                showRSALoading: false,
                showAESLoading: false,
                error: 'Erro ao gerar as chaves.',
            });
        }
    }


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
                    onClick={handleGenerateKeysBackend}
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
                        className="flex items-center gap-3 px-6 py-3 rounded-md text-gray-700 font-medium shadow-md transition-all duration-200 bg-white border-b-gray-100"
                    >
                        <FaInfoCircle className="text-xl"/>
                        Resetar
                    </Button>
                )}
            </div>
        </div>
    );
}
