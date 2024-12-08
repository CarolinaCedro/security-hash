import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

interface KeyDisplayProps {
    title: string;
    content: string;
}

export function Informativos({ title, content }: KeyDisplayProps) {
    const [showInfo, setShowInfo] = useState(false);

    // Função para adicionar cabeçalhos
    const addHeaders = (key: string, type: 'public' | 'private') => {
        if (type === 'public') {
            return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`;
        }
        if (type === 'private') {
            return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
        }
        return key;
    };

    const getExplanation = (title: string) => {
        switch (title) {
            case "Chave Pública RSA":
                return "Chave pública RSA é usada para criptografar dados e verificar assinaturas digitais. Pode ser compartilhada livremente.";
            case "Chave Privada RSA":
                return "Chave privada RSA é usada para descriptografar dados e criar assinaturas digitais. Deve ser mantida em segredo.";
            case "Chave AES":
                return "Chave simétrica AES é usada tanto para criptografar quanto descriptografar dados. É mais rápida que RSA, mas deve ser compartilhada de forma segura.";
            default:
                return "Informações adicionais não disponíveis.";
        }
    };

    // Adicionando cabeçalhos se a chave for pública ou privada
    const formattedContent =
        title === "Chave Pública RSA" || title === "Chave Privada RSA"
            ? addHeaders(content, title === "Chave Pública RSA" ? 'public' : 'private')
            : content;

    return (
        <div className="p-6 rounded-lg border border-blue-500 shadow-md flex flex-col items-center justify-start w-full h-100px m-4 bg-white">
            <h3 className="text-lg font-semibold text-blue-600 text-center mb-4">
                {title}
            </h3>

            <pre className="font-mono text-sm text-gray-700 text-center overflow-auto flex-1 w-full">
                {formattedContent}
            </pre>

            <div
                className="mt-4 flex items-center gap-2 cursor-pointer text-blue-500"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
            >
                <FaInfoCircle className="text-xl" />
                {showInfo && (
                    <div className="absolute bg-white border border-gray-200 p-3 rounded-md shadow-lg w-1/3 text-sm text-gray-600 z-10">
                        {getExplanation(title)}
                    </div>
                )}
            </div>
        </div>
    );
}
