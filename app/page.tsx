'use client';
import {useState} from 'react';
import {Menu} from "@/components/Menu";
import {menu} from "@/components/utils/navigation/menu";
import {IdType} from "@/components/model/menu";
import {DocumentCheckIcon, LockClosedIcon, ShieldCheckIcon} from "@heroicons/react/24/outline";
import {Button} from "@/components/utils/components/button";

export default function Home() {
    const [currentStepId, setCurrentStepId] = useState<IdType>('config');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isStepComplete, setIsStepComplete] = useState(false);
    const [stepStates, setStepStates] = useState(() => {
        const initialState = {};
        menu.forEach((step) => {
            initialState[step.id] = {};
        });
        return initialState;
    });

    const currentStepIndex = menu.findIndex((step) => step.id === currentStepId);
    const isLastStep = currentStepIndex === menu.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setCurrentStepId('config');
            }, 2000);
            return;
        }

        if (currentStepIndex < menu.length - 1) {
            setCurrentStepId(menu[currentStepIndex + 1].id);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepId(menu[currentStepIndex - 1].id);
        }
    };

    const currentStep = menu.find((step) => step.id === currentStepId);
    const ContentComponent = currentStep?.content || null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-semibold text-yello-600">✓ Processo concluido!</h2>
                        <p className="text-gray-700 mt-2">Aguarde o redirecionamento para estagio inicial...</p>
                    </div>
                </div>
            )}

            <header className="mb-8 text-center flex w-full justify-center flex-col items-center space-y-2">
                {/* Linha com ícones e título */}
                <div className="flex items-center space-x-4">
                    {/* Ícone de segurança */}
                    <ShieldCheckIcon className="w-10 h-10 text-blue-600"/>

                    {/* Ícone de assinatura digital (hash) */}
                    <DocumentCheckIcon className="w-10 h-10 text-purple-600"/>
                    {/* eslint-disable-next-line react/jsx-no-undef */}
                    <LockClosedIcon className="w-10 h-10 text-green-600"/>

                </div>

                {/* Título */}
                <h1 className="text-3xl font-bold text-yellow-600">Comunicação Segura</h1>
            </header>


            <div className="w-full max-w-7xl bg-white shadow-md rounded-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Navegação */}
                    <nav className="w-full lg:w-64 bg-blue-50 border-r border-gray-200 p-4">
                        <ul className="space-y-4 ">
                            {menu.map((step) => (
                                <Menu
                                    key={step.id}
                                    title={step.title}
                                    icon={step.icon}
                                    status={
                                        step.id === currentStepId
                                            ? 'current'
                                            : currentStepIndex > menu.findIndex((s) => s.id === step.id)
                                                ? 'completed'
                                                : 'pending'
                                    }
                                />
                            ))}
                        </ul>
                    </nav>

                    {/* Conteúdo Principal */}
                    <main className="flex-1 p-6">
                        <div className="bg-gray-100 p-6 rounded-lg shadow-inner min-h-[300px]">
                            {ContentComponent && (
                                <ContentComponent
                                    stepState={stepStates[currentStepId]}
                                    setStepState={(newState) =>
                                        setStepStates((prev) => ({
                                            ...prev,
                                            [currentStepId]: {
                                                ...prev[currentStepId],
                                                ...newState,
                                            },
                                        }))
                                    }
                                    setIsStepComplete={setIsStepComplete}
                                />
                            )}
                        </div>
                    </main>
                </div>

                {/* Controles */}
                <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentStepIndex === 0}
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Voltar
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!isStepComplete}
                        className={`${
                            isLastStep
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        } disabled:opacity-50`}
                    >
                        {isLastStep ? 'Concluir' : 'Avançar'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
