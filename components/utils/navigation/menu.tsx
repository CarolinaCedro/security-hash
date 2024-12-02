import {Menu} from "@/components/model/interfaces/menu-sequence";
import {ConfigStep} from '@/components/ConfigStep';
import {PrepStep} from '@/components/PrepStep';
import {SignStep} from "@/components/SignStep";
import {ProtectStep} from "@/components/ProtectStep";
import {SendStep} from "@/components/SendStep";
import {VerifyStep} from "@/components/VerifyStep";

import {
    ClipboardIcon,
    DocumentCheckIcon,
    KeyIcon,
    LockClosedIcon,
    PaperAirplaneIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export const menu: Menu[] = [
    {
        id: 'config',
        title: '1 - Geração de Chaves',
        content: ConfigStep,
        icon: <KeyIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'prep',
        title: '2 - Preparação',
        content: PrepStep,
        icon: <ClipboardIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'sign',
        title: '3 - Assinatura',
        content: SignStep,
        icon: <DocumentCheckIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'protect',
        title: '4 - Proteção',
        content: ProtectStep,
        icon: <ShieldCheckIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'pack',
        title: '5 - Envio',
        content: SendStep,
        icon: <PaperAirplaneIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'verify',
        title: '6 - Descriptografia',
        content: VerifyStep,
        icon: <LockClosedIcon className="w-6 h-6 text-blue-500"/>,
    }
];
