import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaKey, FaInfoCircle } from "react-icons/fa";
import { Button } from "@/components/utils/button";
import { KeyGenerationLoading } from "@/components/KeyGenerationLoading";
import { KeyDisplay } from "@/components/KeyDisplay";

export function ConfigStep({ stepState, setStepState, setIsStepComplete }) {
    const { rsaGenerated, aesGenerated, showRSALoading, showAESLoading, showRSAKeys, showAESKey } = stepState;

    const handleGenerateKeys = () => {
        setStepState({ showRSALoading: true, showAESLoading: true });
        setTimeout(() => {
            setStepState({
                rsaGenerated: true,
                aesGenerated: true,
                showRSALoading: false,
                showAESLoading: false,
                showRSAKeys: true,
                showAESKey: true,
            });
        }, 2000);
    };

    const handleReset = () => {
        setStepState({
            rsaGenerated: false,
            aesGenerated: false,
            showRSALoading: false,
            showAESLoading: false,
            showRSAKeys: false,
            showAESKey: false,
        });
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
                    style={{ backgroundColor: "#F5CF3D" }}
                >
                    <FaKey className="text-xl" />
                    {rsaGenerated && aesGenerated ? "Chaves Geradas" : "Gerar chave RSA/AES"}
                </Button>

                {(showRSALoading || showAESLoading) && (
                    <div className="flex flex-col items-center gap-4">
                        {showRSALoading && <KeyGenerationLoading type="RSA" />}
                        {showAESLoading && <KeyGenerationLoading type="AES" />}
                    </div>
                )}

                {(showRSAKeys || showAESKey) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-6 w-full max-w-4xl"
                    >
                        <h3 className="text-2xl font-semibold text-gray-700 text-center">Chaves Geradas</h3>
                        <div className="flex flex-col gap-6 w-full">
                            {showRSAKeys && (
                                <>
                                    <KeyDisplay
                                        title="Chave Pública RSA"
                                        content="-----BEGIN PUBLIC KEY-----\nMIIEowIBAAKCAQEABQEFz5A...\n-----END PUBLIC KEY-----"
                                        bgColor="#e3f8f3"
                                        textColor="#05668d"
                                    />
                                    <KeyDisplay
                                        title="Chave Privada RSA"
                                        content="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA5G8R7TI...\n-----END RSA PRIVATE KEY-----"
                                        bgColor="#e3f8f3"
                                        textColor="#05668d"
                                    />
                                </>
                            )}

                            {showAESKey && (
                                <KeyDisplay
                                    title="Chave AES"
                                    content="WXd9Hndks72MdP93Lw5T7n..."
                                    bgColor="#fdecef"
                                    textColor="#7f1d1d"
                                />
                            )}
                        </div>
                    </motion.div>
                )}

                {rsaGenerated && aesGenerated && (
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <FaInfoCircle className="text-2xl text-blue-500" />
                        <p className="text-sm text-gray-600 text-center">
                            A melhor abordagem é utilizar a chave RSA para a troca segura da chave AES. A chave AES é ideal para criptografar grandes volumes de dados devido à sua alta performance.
                        </p>
                    </div>
                )}

                {rsaGenerated && aesGenerated && (
                    <Button
                        onClick={handleReset}
                        className="flex items-center gap-3 px-6 py-3 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-all"
                    >
                        Resetar
                    </Button>
                )}
            </div>
        </div>
    );
}
