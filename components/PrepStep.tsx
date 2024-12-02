import {useEffect, useRef} from "react";
import {calculateHash} from "@/components/utils";
import {Textarea} from "@/components/utils/textarea";
import {Label} from "@/components/utils/label";
import {Button} from "@/components/utils/button";
import {TooltipProvider} from "@/components/utils/tooltip";
import {motion} from "framer-motion";
import {RefreshCw} from "lucide-react";

export function PrepStep({stepState, setStepState, setIsStepComplete}) {
    const {publicKey, file, fileHash} = stepState;
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const isPublicKeyValid = publicKey?.trim().length > 0;
        const isFileValid = !!file;

        setIsStepComplete(isPublicKeyValid && isFileValid);
    }, [file, publicKey, setIsStepComplete]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setStepState({file: selectedFile, fileContent: null});

        const isViewableFile = /\.(txt|json|md|csv|log|xml|yaml|yml|html|css|js|ts|jsx|tsx)$/i.test(selectedFile.name);

        const reader = new FileReader();
        if (isViewableFile) {
            reader.onload = () => {
                const content = reader.result as string;
                setStepState({fileContent: content});
                calculateHash(content).then((hash) => setStepState({fileHash: hash}));
            };
            reader.readAsText(selectedFile);
        } else {
            reader.onload = () => {
                const content = reader.result as ArrayBuffer;
                calculateHash(content).then((hash) => setStepState({fileHash: hash}));
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handlePublicKeyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setStepState({publicKey: value});
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
                            <Label className="text-lg font-semibold text-gray-700">Chave Pública do Destinatário</Label>
                            <Textarea
                                placeholder="Cole aqui a chave pública (formato PEM)..."
                                value={publicKey || ''}
                                onChange={handlePublicKeyChange}
                                className="mt-2 font-mono text-sm border-gray-300 shadow-sm"
                                rows={6}
                            />
                        </div>
                    </div>

                    {/* Arquivo para Envio */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300">
                        <Label htmlFor="fileInput" className="text-lg font-semibold text-gray-700">Arquivo para
                            Envio</Label>
                        <p className="text-sm text-gray-500 mb-4">Selecione um arquivo para ser criptografado</p>

                        <input
                            ref={fileInputRef}
                            id="fileInput"
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        <div
                            className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={triggerFileInput}
                        >
                            {!file ? (
                                <p className="text-sm text-gray-600">Arraste e solte um arquivo aqui, ou clique para
                                    selecionar</p>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReset();
                                        }}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informações do Arquivo */}
                    {fileHash && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300">
                            <div className="flex items-center justify-between mb-4">
                                <strong className="text-gray-700">Informações do Arquivo</strong>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(fileHash)}
                                >
                                    Copiar Hash
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Nome: {file.name}</p>
                                <p className="text-sm font-medium text-gray-600">Tamanho: {file.size} bytes</p>
                                <p className="text-sm font-medium text-gray-600">Hash SHA-256: {fileHash}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botão para Repetir */}
                {(publicKey?.trim().length > 0 && file) && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="flex justify-center pt-6"
                    >
                        <Button variant="outline" onClick={handleReset} className="hover:bg-gray-50">
                            <RefreshCw className="w-4 h-4 mr-2"/>
                            Repetir
                        </Button>
                    </motion.div>
                )}
            </div>
        </TooltipProvider>
    );
}
