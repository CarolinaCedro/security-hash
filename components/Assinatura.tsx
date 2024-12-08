import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { FaFile, FaFileSignature, FaKey, FaLock, FaSignature } from 'react-icons/fa';
import { Button } from "@/components/utils/components/button";

export function Assinatura({ stepState, setStepState, setIsStepComplete }) {
    const { isSigningAnimating, isEncryptingAnimating, isSigned, isEncrypted } = stepState;
    const [isSuccess, setIsSuccess] = useState(false);
    const [keysInfo, setKeysInfo] = useState({
        signingKey: {
            arquivoAssinado: '', // Certifique-se de inicializar corretamente
        },
        encryptionKey: '',
    });

    const startProcess = async () => {
        try {
            // Iniciando a animação da assinatura
            setStepState({ ...stepState, isSigningAnimating: true });

            const assinaturaResponse = await fetch('http://localhost:8083/assinatura/assinar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!assinaturaResponse.ok) throw new Error('Erro ao assinar arquivo.');

            const assinaturaData = await assinaturaResponse.json(); // Resposta da assinatura
            console.log('Assinatura:', assinaturaData); // Debug da resposta da assinatura

            // Atualizando a chave de assinatura com o campo correto
            setKeysInfo((prevState) => ({
                ...prevState,
                signingKey: assinaturaData, // Agora a chave de assinatura contém todo o objeto, incluindo "arquivoAssinado"
            }));

            setStepState({ ...stepState, isSigningAnimating: false, isSigned: true });

            // Iniciando a animação da cifragem
            setStepState({ ...stepState, isEncryptingAnimating: true });

            const cifragemResponse = await fetch('http://localhost:8083/assinatura/cifrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!cifragemResponse.ok) throw new Error('Erro ao cifrar arquivo.');

            const cifragemData = await cifragemResponse.text(); // Resposta da cifragem
            console.log('Cifragem:', cifragemData); // Debug da resposta da cifragem

            // Atualizando a chave de cifragem
            setKeysInfo((prevState) => ({
                ...prevState,
                encryptionKey: cifragemData, // Assumindo que a cifragem seja retornada como texto
            }));

            setStepState({
                ...stepState,
                isEncryptingAnimating: false,
                isEncrypted: true,
            });

            setIsSuccess(true);
            setIsStepComplete(true);
        } catch (error) {
            console.error('Erro durante o processo:', error);
            alert('Erro durante o processo. Verifique o console para mais detalhes.');
            setStepState({
                ...stepState,
                isSigningAnimating: false,
                isEncryptingAnimating: false,
            });
        }
    };

    const handleReset = () => {
        setStepState({
            isSigningAnimating: false,
            isSigned: false,
            isEncryptingAnimating: false,
            isEncrypted: false,
        });
        setIsSuccess(false);
        setIsStepComplete(false);
        setKeysInfo({ signingKey: '', encryptionKey: '' });
    };

    return (
        <div className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 p-10 rounded-lg shadow-lg space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Processo de Assinatura e Cifragem</h2>

            {/* Barra de progresso */}
            <div className="relative flex items-center w-full max-w-md">
                <div className="absolute w-full h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 flex">
                    <motion.div
                        className="h-1 bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{
                            width: isSigningAnimating || isEncryptingAnimating ? '50%' : isSigned ? '100%' : 0,
                        }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10"
                    animate={{ scale: isSigningAnimating ? 1.2 : 1 }}
                >
                    <FaFile className="text-gray-500" />
                </motion.div>
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10 ml-auto"
                    animate={{
                        scale: isEncryptingAnimating ? 1.2 : isEncrypted ? 1.5 : 1,
                        backgroundColor: isEncrypted ? '#FFD700' : '#FFFFFF',
                    }}
                >
                    {isSigned && !isEncryptingAnimating && !isEncrypted ? (
                        <FaSignature className="text-blue-500" />
                    ) : isEncrypted ? (
                        <FaLock className="text-green-500" />
                    ) : null}
                </motion.div>
            </div>

            {/* Cards de informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                <div className="p-6 bg-blue-200 rounded-lg shadow-xl flex flex-col items-center space-y-4 hover:bg-blue-300 transition duration-300">
                    <FaKey className="text-blue-600 text-4xl" />
                    <h3 className="text-xl font-semibold text-gray-800">Arquivo Assinado</h3>
                    <p className="text-sm text-gray-700 break-all">
                        {keysInfo.signingKey?.arquivoAssinado || 'Aguardando geração...'}
                    </p>
                    {keysInfo.signingKey && (
                        <span className="text-xs text-gray-500">{`Tamanho do arquivo: ${
                            keysInfo.signingKey.arquivoAssinado?.length || 'Desconhecido'
                        }`}</span>
                    )}
                </div>
                <div className="p-6 bg-yellow-200 rounded-lg shadow-xl flex flex-col items-center space-y-4 hover:bg-yellow-300 transition duration-300">
                    <FaKey className="text-yellow-600 text-4xl" />
                    <h3 className="text-xl font-semibold text-gray-800">Chave de Simétrica Cifrada</h3>
                    <p className="text-sm text-gray-700 break-all">
                        {keysInfo.encryptionKey || 'Aguardando geração...'}
                    </p>
                    {keysInfo.encryptionKey && (
                        <span className="text-xs text-gray-500">{`Tamanho do arquivo: ${
                            keysInfo.encryptionKey?.length  || 'Desconhecido'
                        }`}</span>
                    )}


                </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col justify-between gap-y-4">
                <Button style={{ backgroundColor: '#F5CF3D' }} onClick={startProcess}>
                    Iniciar Processo
                </Button>
                {isSuccess && <p className="text-center text-green-500">Processo concluído com sucesso!</p>}
                <Button style={{ backgroundColor: '#aeabab' }} onClick={handleReset}>
                    Reiniciar Processo
                </Button>
            </div>
        </div>
    );
}
