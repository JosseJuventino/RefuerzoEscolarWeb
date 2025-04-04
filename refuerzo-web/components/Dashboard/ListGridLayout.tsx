import { LayoutGrid, LayoutList } from "lucide-react";

interface ListGridLayoutProps {
    isCardView: boolean;
    setIsCardView: (isCardView: boolean) => void;
}

export default function ListGridLayout({ isCardView, setIsCardView }: ListGridLayoutProps) {
    return (
        <div className="flex flex-row-reverse items-center gap-4">
            <button
                onClick={() => setIsCardView(!isCardView)}
                className={`ml-2 ${isCardView
                    ? 'bg-blue_principal text-white'
                    : 'text-gray-600 bg-white'
                    } font-medium px-4 py-2 rounded-lg shadow transition-all`}
            >
                {isCardView ? <LayoutList size={18} /> : <LayoutGrid size={18} />}
            </button>
        </div>
    );
}