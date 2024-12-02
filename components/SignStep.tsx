import {motion} from 'framer-motion';
import {useEffect} from 'react';
import {FaFile, FaLock, FaRedoAlt, FaSignature} from 'react-icons/fa';

export function SignStep({stepState, setStepState, setIsStepComplete}) {
    const {isSigningAnimating, isEncryptingAnimating, isSigned, isEncrypted} = stepState;

    const startSigningAnimation = () => {
        setStepState({isSigningAnimating: true});
        setTimeout(() => {
            setStepState({isSigningAnimating: false, isSigned: true});
        }, 1500);
    };

    const startEncryptingAnimation = () => {
        setStepState({isEncryptingAnimating: true});
        setTimeout(() => {
            setStepState({isEncryptingAnimating: false, isEncrypted: true});
        }, 1500);
    };

    const handleReset = () => {
        setStepState({
            isSigningAnimating: false,
            isEncryptingAnimating: false,
            isSigned: false,
            isEncrypted: false,
        });
    };

    const getStatusText = () => {
        if (!isSigned) return "Assine o documento para começar.";
        if (!isEncrypted) return "Cifre o documento para finalizar.";
        return "Documento assinado e cifrado!";
    };

    useEffect(() => {
        setIsStepComplete(isSigned && isEncrypted);
    }, [isSigned, isEncrypted, setIsStepComplete]);

    return (
        <div
            className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 p-10 rounded-lg shadow-lg space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Processo de Assinatura e Cifragem</h2>

            {/* Linha de Progresso */}
            <div className="relative flex items-center w-full max-w-md">
                {/* Linha Pontilhada */}
                <div className="absolute w-full h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 flex">
                    <motion.div
                        className="h-1 bg-blue-500"
                        initial={{width: 0}}
                        animate={{
                            width: isSigningAnimating || isEncryptingAnimating ? "50%" : isSigned ? "100%" : 0,
                        }}
                        transition={{duration: 1}}
                    />
                </div>

                {/* Ponto A */}
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10"
                    animate={{scale: isSigningAnimating ? 1.2 : 1}}
                >
                    <FaFile className="text-gray-500"/>
                </motion.div>

                {/* Ponto B */}
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10 ml-auto"
                    animate={{
                        scale: isEncryptingAnimating ? 1.2 : isEncrypted ? 1.5 : 1,
                        backgroundColor: isEncrypted ? "#FFD700" : "#FFFFFF",
                    }}
                >
                    {isSigned && !isEncryptingAnimating && !isEncrypted ? (
                        <FaSignature className="text-blue-500"/>
                    ) : isEncrypted ? (
                        <FaLock className="text-yellow-500"/>
                    ) : (
                        <FaFile className="text-gray-500"/>
                    )}
                </motion.div>
            </div>

            {/* Texto de Progresso */}
            <p className="text-gray-700 text-center">{getStatusText()}</p>

            {/* Botões */}
            <div className="flex space-x-4">
                <button
                    onClick={startSigningAnimation}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={isSigningAnimating || isSigned}
                >
                    Assinar Documento
                </button>
                <button
                    onClick={startEncryptingAnimation}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 disabled:opacity-50"
                    disabled={!isSigned || isEncryptingAnimating || isEncrypted}
                >
                    Cifrar Documento
                </button>
            </div>

            {isSigned && isEncrypted && (
                <motion.button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.5}}
                >
                    <FaRedoAlt/>
                    <span>Recomeçar</span>
                </motion.button>
            )}
        </div>
    );
}
