import { useEffect, useRef, useState } from "react";
import { calculateHash } from "@/components/utils";
import { Label } from "@/components/utils/components/label";
import { TooltipProvider } from "@/components/utils/components/tooltip";

export function Preparacao({ stepState, setStepState, setIsStepComplete }) {
    const { publicKey, file, fileHash } = stepState;
    const [fileInfo, setFileInfo] = useState(null); // Estado para armazenar as informações do arquivo
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Verifica se a chave pública e o arquivo foram carregados e atualiza o estado de "completude" da etapa
        const isPublicKeyValid = publicKey?.trim().length > 0;
        const isFileValid = !!file;

        if (isPublicKeyValid && isFileValid !== stepState.isStepComplete) {
            setIsStepComplete(isPublicKeyValid && isFileValid);
        }
    }, [file, publicKey, stepState.isStepComplete, setIsStepComplete]);

    useEffect(() => {
        // Restaura a chave pública e o arquivo do localStorage, se existirem
        const savedPublicKey = localStorage.getItem("keyPub");
        const savedFile = localStorage.getItem("file");

        if (savedPublicKey && savedFile && (!publicKey || !file)) {
            setStepState({
                publicKey: savedPublicKey,
                file: savedFile,
            });
        }
    }, [publicKey, file, setStepState]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setStepState({ file: selectedFile, fileContent: null });

        const isViewableFile = /\.(txt|json|md|csv|log|xml|yaml|yml|html|css|js|ts|jsx|tsx)$/i.test(selectedFile.name);

        const reader = new FileReader();
        if (isViewableFile) {
            reader.onload = () => {
                const content = reader.result as string;
                setStepState({ fileContent: content });
                calculateHash(content).then((hash) => setStepState({ fileHash: hash }));
                // Definir informações do arquivo
                setFileInfo({
                    name: selectedFile.name,
                    size: (selectedFile.size / 1024).toFixed(2), // Converte o tamanho para KB
                });
            };
            reader.readAsText(selectedFile);
        } else {
            reader.onload = () => {
                const content = reader.result as ArrayBuffer;
                calculateHash(content).then((hash) => setStepState({ fileHash: hash }));
                // Definir informações do arquivo
                setFileInfo({
                    name: selectedFile.name,
                    size: (selectedFile.size / 1024).toFixed(2), // Converte o tamanho para KB
                });
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handlePublicKeyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setStepState({ publicKey: value });
    };

    const handleReset = () => {
        setStepState({
            publicKey: '',
            file: null,
            fileContent: null,
            fileHash: null,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Remover do localStorage após reset
        localStorage.removeItem("keyPub");
        localStorage.removeItem("file");
        setFileInfo(null); // Limpar informações do arquivo
    };

    const handlePublicKeyFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result as string;
            setStepState({ publicKey: content });
            localStorage.setItem("keyPub", content); // Salvar chave pública no localStorage
        };
        reader.onerror = () => {
            alert("Erro ao ler o arquivo da chave pública. Tente novamente.");
        };

        reader.readAsText(selectedFile);
    };

    return (
        <TooltipProvider>
            <div className="space-y-6 max-w-3xl mx-auto p-8">
                <div className="border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Preparação do Ambiente</h2>
                </div>

                <div className="space-y-6">
                    {/* Chave Pública */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300">
                        <div className="mb-6">
                            <Label htmlFor="publicKeyInput" className="text-lg font-semibold text-gray-700">
                                Chave Pública do Destinatário
                            </Label>
                            <p className="text-sm text-gray-500 mb-4">Selecione o arquivo contendo a chave pública
                                (formato PEM)</p>

                            <input
                                id="publicKeyInput"
                                type="file"
                                accept=".pem"
                                className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                onChange={handlePublicKeyFileSelect}
                            />
                        </div>
                    </div>

                    {/* Arquivo para Envio */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300">
                        <Label htmlFor="fileInput" className="text-lg font-semibold text-gray-700">Arquivo</Label>

                        <input
                            ref={fileInputRef}
                            id="fileInput"
                            type="file"
                            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Exibindo informações sobre o arquivo carregado */}
                    {fileInfo && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300">
                            <h3 className="text-lg font-semibold text-gray-700">Informações do Arquivo</h3>
                            <p className="text-sm text-gray-500">Nome: {fileInfo.name}</p>
                            <p className="text-sm text-gray-500">Tamanho: {fileInfo.size} KB</p>
                            {fileHash && (
                                <p className="text-sm text-gray-500">Hash SHA-256: {fileHash}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
