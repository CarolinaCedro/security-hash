import {IdType} from "@/components/model/menu";


export interface Menu {
    id: IdType;
    title: string;
    content: React.ComponentType<{ setIsStepComplete: (isComplete: boolean) => void }>;
    icon: JSX.Element;  // Adicionando o campo 'icon' do tipo JSX.Element
}
