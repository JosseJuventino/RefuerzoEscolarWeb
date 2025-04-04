import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldCustomProps {
  label: string;
  options: Option[];
  placeholder?: string;
  onChange: (values: string[]) => void;
  defaultValues?: string[];
}

const SelectFieldCustom: React.FC<SelectFieldCustomProps> = ({
  label,
  options,
  placeholder = "Seleccione opciones",
  onChange,
  defaultValues = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar las opciones seleccionadas con los valores predeterminados
  useEffect(() => {
    if (defaultValues.length > 0) {
      const defaultSelected = options.filter((option) =>
        defaultValues.includes(option.value)
      );
      setSelectedOptions(defaultSelected);
    }
  }, [defaultValues, options]);

  // Cerrar el dropdown al hacer clic fuera
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar la selección de una opción
  const handleOptionClick = (option: Option) => {
    if (selectedOptions.some((selected) => selected.value === option.value)) {
      const newSelection = selectedOptions.filter(
        (selected) => selected.value !== option.value
      );
      setSelectedOptions(newSelection);
      onChange(newSelection.map((item) => item.value));
    } else {
      const newSelection = [...selectedOptions, option];
      setSelectedOptions(newSelection);
      onChange(newSelection.map((item) => item.value));
    }
  };

  // Eliminar una selección
  const removeSelection = (value: string) => {
    const newSelection = selectedOptions.filter((option) => option.value !== value);
    setSelectedOptions(newSelection);
    onChange(newSelection.map((item) => item.value));
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="block text-medium text-blue_principal font-medium">
        {label}
      </label>
      <div className="relative" ref={containerRef}>
        {/* Campo de selección */}
        <div
          className="p-2 border border-gray-300 rounded-lg bg-white cursor-pointer min-h-[40px] flex items-center flex-wrap gap-2 max-h-32 overflow-y-auto"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                <span className="ml-1">{option.label}</span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelection(option.value);
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        {/* Dropdown de opciones */}
        {isOpen && (
          <ul className="absolute top-full left-0 z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`px-2 py-1 flex items-center cursor-pointer hover:bg-gray-100 ${selectedOptions.some((selected) => selected.value === option.value)
                  ? "bg-gray-200"
                  : ""
                  }`}
              >
                <span className="ml-2">{option.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SelectFieldCustom;