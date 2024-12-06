import {motion} from 'framer-motion';
import nacl from 'tweetnacl';
import React, {useEffect, useState} from 'react';
import {FaFile, FaFileSignature, FaKey, FaLock, FaSignature} from 'react-icons/fa';
import {Button} from "@/components/utils/components/button";

export function Assinatura({stepState, setStepState, setIsStepComplete}) {
    const {isSigningAnimating, isEncryptingAnimating, isSigned, isEncrypted} = stepState;
    const [isSuccess, setIsSuccess] = useState(false);
    const [privateKey, setPrivateKey] = useState<Uint8Array>(null);
    const [symmetricKey, setSymmetricKey] = useState<Uint8Array>(null);
    const [nonce, setNonce] = useState<Uint8Array>(null);
    const [signature, setSignature] = useState<Uint8Array>(null);
    const [arquivoCifrado, setArquivoCifrado] = useState<Uint8Array>(null);
    const [file, setFile] = useState<Blob>(null); // Para armazenar o arquivo recuperado

    useEffect(() => {
        // Recuperar as chaves e o arquivo do backend


        async function fetchPrivateKey() {
            try {
                const response = await fetch('http://localhost:8083/rsa/chaves/private');
                const data = await response.json();
                console.log("O que ta vindo hein", data);

                // Verificar se data não está vazia e é um array
                if (data && Array.isArray(data) && data.length > 0) {

                    const privateKeyPem = data
                        .filter(chave => chave.tipo === 'privada')
                        .pop()?.chavePem;  // Pega a chave PEM da última chave filtrada (usando .pop())

                    const privateKeyUint8 = new Uint8Array(privateKeyPem);  // Certifique-se de converter sua chave PEM corretamente
                    console.log("a chave aqui", privateKeyUint8)
                    setPrivateKey(privateKeyUint8)

                } else {
                    throw new Error("Nenhuma chave encontrada no backend ou dados inválidos.");
                }

            } catch (error) {
                console.error("Erro ao buscar chave privada:", error);
            }
        }
        fetchPrivateKey();


        const fetchFile = async () => {
            try {

                // Recupera o arquivo
                const fileResponse = await fetch('http://localhost:8083/arquivo');
                const fileData = await fileResponse.blob();
                console.log("Puxa o arquivo já em blob", fileData);

                setFile(fileData);
            } catch (error) {
                console.error('Erro ao recuperar chaves e arquivo:', error);
            }
        };

        const fetchSymmetricKey = async () => {
            try {
                // Fetch a chave do backend
                const response = await fetch('http://localhost:8083/aes/chaves');
                const data = await response.json();

                if (data && data.length > 0) {
                    // Pegue a chave hexadecimal
                    const hexKey = data[0].chaveBase64; // Ou data[0].chaveHex se for hexadecimal

                    // Converta de hexadecimal para Uint8Array


                    const hexToUint8Array = hex => {
                        const array = new Uint8Array(hex.length / 2);
                        for (let i = 0; i < array.length; i++) {
                            array[i] = parseInt(hex.substr(i * 2, 2), 16);
                        }
                        return array;
                    };

                    const symmetricKeyBuffer = hexToUint8Array(hexKey);
                    console.log("Chave simétrica importada:", symmetricKeyBuffer);

                    setSymmetricKey(symmetricKeyBuffer)
                    return symmetricKeyBuffer;
                }


            } catch (error) {
                console.error("Erro ao recuperar chave simétrica:", error);
            }
        };


        fetchSymmetricKey();
        fetchFile();
        fetchPrivateKey()
    }, []);


    // Função para assinar o documento
    const signDocument = async (document) => {
        // Codificar o documento para ArrayBuffer com TextEncoder
        const encoder = new TextEncoder();
        const documentBuffer = encoder.encode(document); // Converte o documento para Uint8Array

        try {
            // Verificar se a chave privada foi carregada corretamente
            // if (!privateKey || privateKey.length !== 32) {
            //     throw new Error("A chave privada precisa ter 32 bytes.");
            // }

            // Assinando o documento usando o algoritmo Ed25519
            const signature = nacl.sign.detached(documentBuffer, privateKey);

            console.log("Documento assinado com sucesso", signature);
            setSignature(signature)

            return signature;
        } catch (error) {
            console.error("Erro ao assinar o documento:", error);
        }
    };




    const encryptDocument = async (document, symmetricKey) => {
        // Codifica o documento em um ArrayBuffer
        const encoder = new TextEncoder();
        const documentBuffer = encoder.encode(document); // Converte o documento para Uint8Array

        try {
            // Gerar um nonce (vetor de inicialização) de 24 bytes para XSalsa20
            const nonce = nacl.randomBytes(24);  // O nonce deve ser de 24 bytes para XSalsa20
            setNonce(nonce)

            // Criptografando o documento com XSalsa20
            const encryptedDocument = nacl.secretbox(documentBuffer, nonce, symmetricKey);

            console.log("Documento criptografado com sucesso", encryptedDocument);
            setArquivoCifrado(encryptedDocument)

            const payload = {
                arquivoAssinado: encryptedDocument, // Documento criptografado
                nonce: nonce, // O nonce usado na criptografia
            };

            const response = await fetch("http://localhost:8080/assinatura/salvar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    arquivoAssinado: Array.from(signature),  // Converte o Uint8Array para um array normal
                    nonce: Array.from(nonce),  // Também converte o nonce para um array normal
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar o arquivo criptografado no backend');
            }




            // Retorna o documento criptografado e o nonce, pois o nonce é necessário para decriptar
            return { encryptedDocument, nonce };

        } catch (error) {
            console.error("Erro ao criptografar o documento:", error);
        }
    };



    const startProcess = async () => {
        try {
            // Verifique se as chaves e o arquivo estão carregados
            if (!privateKey || !symmetricKey || !file) {
                console.log("private veio? ", privateKey)
                console.log("symmetrickey veio? ", symmetricKey)
                console.log("file veio? ", file)


                throw new Error("Chaves ou arquivo não carregados");
            }

            // Prepare o arquivo (convertido para ArrayBuffer)
            const fileBuffer = await file.arrayBuffer();

            // Start signing animation
            setStepState({...stepState, isSigningAnimating: true});

            // Assine o documento
            const signedDocument = await signDocument(fileBuffer);
            setStepState({...stepState, isSigningAnimating: false, isSigned: true});

            // Start encryption animation
            setStepState({...stepState, isEncryptingAnimating: true});
            const encryptedDocument = await encryptDocument(signedDocument, symmetricKey);
            setStepState({...stepState, isEncryptingAnimating: false, isEncrypted: true});

            // Enviar para o backend para salvar a assinatura e o arquivo cifrado

            console.log("se chegou é pq encriṕtou e cifrou tbm", encryptedDocument, signedDocument)

            // await saveEncryptedData(encryptedDocument, signedDocument);

            setIsSuccess(true);
            setIsStepComplete(true);
        } catch (error) {
            console.error("Erro durante o processo:", error);
        }
    };

    const saveEncryptedData = async (encryptedDocument, signedDocument) => {
        try {
            const response = await fetch('http://localhost:8080/arquivo/salvar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signedDocument: signedDocument,
                    encryptedDocument: encryptedDocument,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar dados no backend');
            }
        } catch (error) {
            console.error('Erro ao salvar os dados:', error);
        }
    };

    const getStatusText = () => {
        if (!isSigned) return 'Assine o documento para começar.';
        if (!isEncrypted) return 'Cifre o documento para finalizar.';
        return 'Documento assinado e cifrado com sucesso!';
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
    };

    return (
        <div
            className="flex flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 p-10 rounded-lg shadow-lg space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Processo de Assinatura e Cifragem</h2>
            <div className="relative flex items-center w-full max-w-md">
                <div className="absolute w-full h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 flex">
                    <motion.div
                        className="h-1 bg-blue-500"
                        initial={{width: 0}}
                        animate={{
                            width: isSigningAnimating || isEncryptingAnimating ? '50%' : isSigned ? '100%' : 0,
                        }}
                        transition={{duration: 1}}
                    />
                </div>
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10"
                    animate={{scale: isSigningAnimating ? 1.2 : 1}}
                >
                    <FaFile className="text-gray-500"/>
                </motion.div>
                <motion.div
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10 ml-auto"
                    animate={{
                        scale: isEncryptingAnimating ? 1.2 : isEncrypted ? 1.5 : 1,
                        backgroundColor: isEncrypted ? '#FFD700' : '#FFFFFF',
                    }}
                >
                    {isSigned && !isEncryptingAnimating && !isEncrypted ? (
                        <FaSignature className="text-blue-500"/>
                    ) : isEncrypted ? (
                        <FaLock className="text-green-500"/>
                    ) : null}
                </motion.div>
            </div>

            <div className="space-y-6 w-full max-w-md">
                <div className="flex items-start space-x-4">
                    <div className="w-1/3 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                        <FaFileSignature className="text-blue-500"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Assinatura Digital</h3>
                        <p className="text-sm text-gray-600">
                            A assinatura digital garante a autenticidade e a integridade do arquivo. Ela utiliza um par
                            de chaves criptográficas (privada e pública) para garantir que o arquivo não foi alterado e
                            que a identidade do remetente é verificada.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="w-1/3 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <FaLock className="text-yellow-500"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Cifragem do Arquivo</h3>
                        <p className="text-sm text-gray-600">
                            A cifragem protege o conteúdo do arquivo contra acesso não autorizado. Com a cifragem,
                            apenas a pessoa que possui a chave de descriptografia poderá acessar o conteúdo do arquivo,
                            garantindo a privacidade das informações.
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="w-1/3 h-10 bg-green-200 rounded-full flex items-center justify-center">
                        <FaKey className="text-green-500"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Proteção de Acesso</h3>
                        <p className="text-sm text-gray-600">
                            O processo de cifragem utiliza chaves simétricas e assimétricas para garantir que o arquivo
                            seja acessado apenas por destinatários autorizados. A chave simétrica, por exemplo, é usada
                            para cifrar e decifrar os dados, tornando o processo seguro e eficiente.
                        </p>
                    </div>
                </div>
            </div>


            <Button style={{backgroundColor: "#F5CF3D"}} onClick={startProcess} className="btn btn-primary">
                Iniciar Processo
            </Button>
            <p className={`text-center text-lg font-semibold p-4 rounded-md ${
                isSigningAnimating || isEncryptingAnimating
                    ? 'bg-blue-100 text-blue-800'
                    : isSigned
                        ? 'bg-green-100 text-green-800'
                        : isEncrypted
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
            } transition-all duration-300 ease-in-out`}>
                {getStatusText()}
            </p>
            <Button onClick={handleReset}
                    className="flex items-center gap-3 px-6 py-3 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-all">
                Resetar
            </Button>
        </div>
    );
}
