import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface SelectFieldCustomProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  defaultValue?: string;
}

const SelectFieldV2: React.FC<SelectFieldCustomProps> = ({
  label,
  options,
  placeholder = "Seleccione una opción",
  onChange,
  defaultValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar la opción seleccionada si se pasa un defaultValue
  useEffect(() => {
    if (defaultValue) {
      const defaultOption = options.find(
        (option) => option.value === defaultValue
      ) || null;
      setSelected(defaultOption);
    }
  }, [defaultValue, options]);

  // Cerrar el dropdown al hacer click fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option: Option) => {
    setSelected(option);
    setIsOpen(false);
    onChange(option.value);
  };

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {/* Contenedor relativo para el input y dropdown */}
      <div className="relative" ref={containerRef}>
        <div
          className="p-2 border border-gray-300 rounded-lg bg-white cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            {selected ? (
              <>
                {selected.icon}
                <span className="ml-2">{selected.label}</span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
        </div>
        {isOpen && (
          <ul className="absolute top-full left-0 z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`px-2 py-1 flex items-center cursor-pointer hover:bg-gray-100 ${selected?.value === option.value ? "bg-gray-100" : ""
                  }`}
              >
                <span className="text-xl">{option.icon}</span>
                <span className="ml-2">{option.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SelectFieldV2;