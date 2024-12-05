
import {RefreshCw} from "lucide-react";
import {motion} from "framer-motion";
import {Button} from "@/components/utils/components/button";

interface ProcessStepProps {
    title: string;
    status: 'completed' | 'current' | 'pending';
    icon: JSX.Element;
    onReset?: () => void;
}

export function Menu({title, icon, status, onReset}: ProcessStepProps) {
    const statusStyles = {
        completed: 'text-green-600',
        current: '',
        pending: 'text-yellow-400'
    };

    return (
        <li className={`flex flex-col items-center pb-3 justify-center font-bold px-2 ${statusStyles[status]}`}>
        <span className="flex items-center space-x-2 text-center break-words w-full">
            {/* Ícone e título alinhados horizontalmente */}
            <div className="w-6 h-6">{icon}</div>
            {/* Ícone */}
            <span>{title}</span> {/* Título */}
        </span>

            {status === 'completed' && onReset && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    className="flex justify-center pt-4"
                >
                    <Button
                        variant="outline"
                        onClick={onReset}
                        className="hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4 mr-2"/>
                        Repetir
                    </Button>


                </motion.div>
            )}
        </li>
    );

} 