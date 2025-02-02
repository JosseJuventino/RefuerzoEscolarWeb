interface IndicatorStepFinishProps {
    handlePrevious: () => void;
    handleFinish: () => void;
}

export default function IndicatorStepFinish({ handlePrevious, handleFinish }: IndicatorStepFinishProps) {
    return (
        <div className="flex gap-4">
            <button
                onClick={handlePrevious}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-all"
            >
                Volver
            </button>
            <button
                onClick={handleFinish}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-all"
            >
                Finalizar
            </button>
        </div>
    );
}