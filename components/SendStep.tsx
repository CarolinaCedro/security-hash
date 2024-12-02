import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PaperAirplaneIcon as SendIcon,
  ShieldCheckIcon as SecurityIcon,
  LockClosedIcon as LockIcon,
  KeyIcon,
  ClipboardDocumentCheckIcon as DocumentIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {ShieldCheckIcon} from "@heroicons/react/24/outline";

const ANIMATION_DELAY = 800;
const MOVEMENT_DELAY = 4000;
const SUCCESS_DELAY = 9000;

const PACKAGE_STEPS = [
  {
    icon: LockIcon,
    text: "Encriptação do arquivo para segurança",
    delay: 0.8,
  },
  {
    icon: KeyIcon,
    text: "Cifra de chave para proteger acessos",
    delay: 1.6,
  },
  {
    icon: SecurityIcon,
    text: "Verificação de integridade concluída",
    delay: 2.4,
  },
] as const;

const ANIMATION_VARIANTS = {
  packageMovement: {
    initial: { left: 0, x: 0 },
    animate: {
      left: "calc(100% - 16px)",
      x: 0,
      rotate: [0, 3, 0, -3, 0],
    },
    transition: {
      duration: 6,
      ease: "easeInOut",
    },
  },
  progressBar: {
    initial: { width: "0%" },
    animate: { width: "100%" },
    transition: { duration: 6, ease: "easeInOut" },
  },
  checkmark: {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  },
};

const PackageSteps = ({ completedSteps }) => (
    <ul className="space-y-3 flex-1">
      {PACKAGE_STEPS.map((step, index) => (
          <motion.li
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center">
              <step.icon className="w-5 h-5 mr-3 text-indigo-500" />
              <span>{step.text}</span>
            </div>

            <motion.div
                variants={ANIMATION_VARIANTS.checkmark}
                initial="initial"
                animate={completedSteps > index ? "animate" : "initial"}
                className="ml-2"
            >
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            </motion.div>
          </motion.li>
      ))}
    </ul>
);

export function SendStep({ stepState, setStepState, setIsStepComplete }) {
  const {
    enviado,
    mensagemSucesso,
    iniciarMovimento,
    mostrarResumo,
  } = stepState;

  const [completedSteps, setCompletedSteps] = useState(0);

  const handleEnvio = useCallback(() => {
    setStepState({ enviado: true });

    PACKAGE_STEPS.forEach((_, index) => {
      setTimeout(() => {
        setCompletedSteps(index + 1);
      }, index * ANIMATION_DELAY);
    });

    setTimeout(() => {
      setStepState({
        mensagemSucesso: "Arquivo enviado com sucesso ao destinatário!",
        mostrarResumo: true,
        iniciarMovimento: true,
      });
    }, SUCCESS_DELAY);
  }, [setStepState]);

  const handleReset = () => {
    setStepState({
      enviado: false,
      mensagemSucesso: "",
      iniciarMovimento: false,
      mostrarResumo: false,
    });
  };

  useEffect(() => {
    setIsStepComplete(enviado && mostrarResumo);
  }, [enviado, mostrarResumo, setIsStepComplete]);

  const PackageWithGlow = () => (
      <motion.div
          variants={ANIMATION_VARIANTS.packageMovement}
          initial="initial"
          animate={iniciarMovimento ? "animate" : "initial"}
          className="absolute top-0 -mt-4"
      >
        <motion.div className="relative">
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-purple-400 rounded-full filter blur-md opacity-50"></div>
          <DocumentIcon className="w-8 h-8 text-purple-500 relative z-10" />
        </motion.div>
      </motion.div>
  );

  return (
      <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Envio de Arquivo Seguro</h2>
        </div>



        <div className="bg-white p-4 rounded-lg shadow-md w-full mb-6">
          <h3 className="font-semibold mb-3">Processo de Envio</h3>
          {/*<div className="flex gap-12 mb-4">*/}
            {/*  <PackageSteps completedSteps={completedSteps} />*/}
            {/*</div>*/}

          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4 mb-8">
            <motion.div
                variants={ANIMATION_VARIANTS.progressBar}
                initial="initial"
                animate={iniciarMovimento ? "animate" : "initial"}
                className="h-full bg-blue-500"
            ></motion.div>
          </div>

          <div className="flex justify-center">
            <button
                onClick={handleEnvio}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                disabled={enviado}
            >
              <SendIcon className="w-5 h-5 inline mr-2" />
              Enviar Arquivo
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center w-full mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <SendIcon className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm text-gray-600 mt-1">Origem</span>
          </div>

          <div className="flex-1 mx-4 relative">
            <svg
                className="w-full absolute top-1/2 -translate-y-1/2"
                height="20"
                strokeDasharray="5,5"
            >
              <line
                  x1="0"
                  y1="10"
                  x2="100%"
                  y2="10"
                  stroke="#9CA3AF"
                  strokeWidth="2"
              />
            </svg>

            {enviado && <PackageWithGlow />}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm text-gray-600 mt-1">Destino</span>
          </div>





        </div>

          {mensagemSucesso && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 font-medium text-lg text-center mb-4"
              >
                  {mensagemSucesso}
              </motion.div>
          )}
      </div>
  );
}
