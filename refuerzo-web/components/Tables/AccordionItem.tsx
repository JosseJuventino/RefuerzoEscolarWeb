import React, { useState } from "react";
import { ChevronDown, Edit2, Trash2, Repeat2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Column<T> {
    header: string;
    accessor: ((row: T) => React.ReactNode) | keyof T;
}

interface AccordionItemProps<T extends { _id: string }> {
    row: T;
    columns: Column<T>[];
    onEdit?: (row: T) => void;
    onDelete?: (id: string) => void;
    hasMove?: boolean;
    handleMove?: (row: T) => void;
    hasEdit?: boolean;
}

const AccordionItem = <T extends { _id: string }>({
    row,
    columns,
    onEdit,
    onDelete,
    hasMove = false,
    hasEdit = true,
    handleMove = () => {},
}: AccordionItemProps<T>) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center p-4 focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <span className="text-gray-800 font-semibold">
                        {typeof columns[0].accessor === "function"
                            ? columns[0].accessor(row)
                            : (row[columns[0].accessor] as React.ReactNode)}
                    </span>
                    <span className="text-gray-600">
                        {typeof columns[1].accessor === "function"
                            ? columns[1].accessor(row)
                            : (row[columns[1].accessor] as React.ReactNode)}
                    </span>
                </div>
                <ChevronDown
                    size={20}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border-t border-gray-200 overflow-hidden"
                    >
                        {columns.slice(2).map((col, index) => (
                            <div key={index} className="flex justify-between py-2">
                                <span className="text-sm text-gray-500">{col.header}:</span>
                                <span className="text-sm text-gray-700">
                                    {typeof col.accessor === "function"
                                        ? col.accessor(row)
                                        : (row[col.accessor] as React.ReactNode)}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-end mt-3 space-x-3">
                            {hasEdit && onEdit && (
                                <button
                                    onClick={() => onEdit(row)}
                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                    aria-label="Editar"
                                >
                                    <Edit2 size={20} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(row._id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    aria-label="Eliminar"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            {hasMove && handleMove && (
                                <button
                                    onClick={() => handleMove(row)}
                                    className="text-yellow-500 hover:text-yellow-700 transition-colors"
                                    aria-label="Mover"
                                >
                                    <Repeat2Icon size={22} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface MobileAccordionViewProps<T extends { _id: string }> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (row: T) => void;
    onDelete?: (id: string) => void;
    hasMove?: boolean;
    handleMove?: (row: T) => void;
    hasEdit?: boolean;
}

export const MobileAccordionView = <T extends { _id: string }>({
    data,
    columns,
    onEdit,
    onDelete,
    hasMove = false,
    handleMove = () => { },
    hasEdit = true,
}: MobileAccordionViewProps<T>) => {
    return (
        <div className="block sm:hidden">
            {data.map((row) => (
                <AccordionItem
                    key={row._id}
                    row={row}
                    columns={columns}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    hasMove={hasMove}
                    handleMove={handleMove}
                    hasEdit={hasEdit}
                />
            ))}
        </div>
    );
};
