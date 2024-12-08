import {useEffect, useRef, useState} from "react";
import {calculateHash} from "@/components/utils";
import {Label} from "@/components/utils/components/label";
import {TooltipProvider} from "@/components/utils/components/tooltip";
import {LockClosedIcon} from "@heroicons/react/24/outline";
import {InformationCircleIcon} from "@heroicons/react/16/solid";

export function Preparacao({stepState, setStepState, setIsStepComplete}) {
    const {publicKey, file, fileHash, fileContent} = stepState;
    const [fileInfo, setFileInfo] = useState(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const isPublicKeyValid = publicKey?.trim().length > 0;
        const isFileValid = !!file;
        if (isPublicKeyValid && isFileValid !== stepState.isStepComplete) {
            setIsStepComplete(isPublicKeyValid && isFileValid);
        }
    }, [file, publicKey, stepState.isStepComplete, setIsStepComplete]);

    useEffect(() => {
        const savedPublicKey = localStorage.getItem("keyPub");
        const savedFile = localStorage.getItem("file");

        if (savedPublicKey && savedFile && (!publicKey || !file)) {
            setStepState({
                publicKey: savedPublicKey,
                file: savedFile,
            });
        }
    }, [publicKey, file, setStepState]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setStepState({file: selectedFile, fileContent: null});

        const reader = new FileReader();
        reader.onload = async () => {
            const content = reader.result as string | ArrayBuffer;
            const base64Content = btoa(
                new Uint8Array(content instanceof ArrayBuffer ? content : new TextEncoder().encode(content))
                    .reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            const hash = await calculateHash(content);

            setStepState({fileContent: content, fileHash: hash});
            setFileInfo({
                name: selectedFile.name,
                size: (selectedFile.size / 1024).toFixed(2),
            });

            await handleFileUpload({
                nomeArquivo: selectedFile.name,
                tipoArquivo: selectedFile.type,
                arquivoOriginal: base64Content,
            });
        };

        if (selectedFile.type.match(/text|json|xml|csv|html|css|js|ts|md/)) {
            reader.readAsText(selectedFile);
        } else {
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleFileUpload = async (arquivo: {
        nomeArquivo: string;
        tipoArquivo: string;
        arquivoOriginal: string;
    }) => {
        try {
            const response = await fetch("http://localhost:8083/arquivo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(arquivo),
            });

            if (!response.ok) {
                throw new Error("Erro ao enviar o arquivo");
            }

            const result = await response.json();
            console.log("Arquivo salvo com sucesso:", result);
            alert("Arquivo enviado com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar o arquivo:", error);
            alert("Erro ao salvar o arquivo. Tente novamente.");
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleReset = () => {
        setStepState({
            publicKey: "",
            file: null,
            fileContent: null,
            fileHash: null,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        localStorage.removeItem("keyPub");
        localStorage.removeItem("file");
        setFileInfo(null);
    };

    return (
        <TooltipProvider>
            <div className="space-y-6 max-w-3xl mx-auto p-8">
                <div className="border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Preparação do Ambiente</h2>
                </div>
                <div className="border-b pb-4 bg-blue-50 p-4 rounded-lg shadow-md flex items-start mb-4">
                    <div className="text-blue-600 mr-3">
                        <InformationCircleIcon className="w-10 h-16 text-blue-500 animate-bounce"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-blue-800">
                            Importante:
                        </h2>
                        <p className="text-sm text-blue-700 mt-1">
                            Não é necessário subir nenhuma chave nesta etapa. Elas já foram geradas no processo
                            anterior, salvas com segurança,
                            e serão recuperadas automaticamente nos estágios posteriores.
                        </p>
                    </div>
                </div>

                <div className="border-b pb-4 bg-green-50 p-4 rounded-lg shadow-md flex items-start">
                    <div className="text-green-600 mr-3">
                        <LockClosedIcon className="w-10 h-16 text-green-500 animate-bounce"/>

                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-green-800">
                            Segurança do Arquivo:
                        </h2>
                        <p className="text-sm text-green-700 mt-1">
                            Para garantir a segurança do arquivo, é necessário fazer o upload do arquivo na etapa atual.
                            Isso permitirá que o sistema
                            processe e armazene o arquivo de forma segura, utilizando as chaves geradas no processo
                            anterior.
                        </p>
                    </div>
                </div>


                <div className="space-y-6">
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

                    {fileInfo && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300">
                            <h3 className="text-lg font-semibold text-gray-700">Informações do Arquivo</h3>
                            <p className="text-sm text-gray-500">Nome: {fileInfo.name}</p>
                            <p className="text-sm text-gray-500">Tamanho: {fileInfo.size} KB</p>
                            {fileHash && <p className="text-sm text-gray-500">Hash SHA-256: {fileHash}</p>}
                            {fileContent && (
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold text-gray-700">Conteúdo do Arquivo:</h4>
                                    <pre
                                        className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 overflow-x-auto">
                                        {fileContent}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>


            </div>
        </TooltipProvider>
    );
}
