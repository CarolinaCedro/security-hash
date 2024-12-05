import {Menu} from "@/components/model/interfaces/menu-sequence";
import {GeracaoChaves} from '@/components/GeracaoChaves';
import {Preparacao} from '@/components/Preparacao';
import {Assinatura} from "@/components/Assinatura";
import {Protecao} from "@/components/Protecao";
import {Encripty} from "@/components/Encripty";
import {Descriptografia} from "@/components/Descriptografia";

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
        content: GeracaoChaves,
        icon: <KeyIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'prep',
        title: '2 - Preparação',
        content: Preparacao,
        icon: <ClipboardIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'sign',
        title: '3 - Assinatura',
        content: Assinatura,
        icon: <DocumentCheckIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'protect',
        title: '4 - Proteção',
        content: Protecao,
        icon: <ShieldCheckIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'pack',
        title: '5 - Envio',
        content: Encripty,
        icon: <PaperAirplaneIcon className="w-6 h-6 text-blue-500"/>,
    },
    {
        id: 'verify',
        title: '6 - Descriptografia',
        content: Descriptografia,
        icon: <LockClosedIcon className="w-6 h-6 text-blue-500"/>,
    }
];
