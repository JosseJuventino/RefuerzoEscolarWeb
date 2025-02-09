import React from "react";
import { Edit2, Trash2, Repeat2Icon } from "lucide-react";
import { TableProps } from "@/types/types";

const Table = <T extends { _id: string }>({
  data,
  loading,
  columns,
  onEdit,
  onDelete,
  handleMove = () => { },
  hasMove = false,
  hasEdit = true,
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <span className="text-gray-500">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-blue_principal text-white">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="py-3 px-6 text-left">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="py-3 px-6 text-center">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                {columns.map((col, index) => (
                  <td key={index} className="py-4 px-6 text-gray-700">
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="py-4 px-6 text-center space-x-2">
                    <div className="flex flex-row gap-4 justify-center">
                      {hasEdit && onEdit && (
                        <button
                          className="flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 focus:outline-none"
                          onClick={() => onEdit(row)}
                          aria-label="Editar"
                        >
                          <Edit2 size={20} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 focus:outline-none"
                          onClick={() => onDelete(row._id)}
                          aria-label="Eliminar"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}

                      {
                        hasMove &&
                        <button
                          className="flex items-center justify-center w-8 h-8 text-yellow-500 hover:text-yellow-700 focus:outline-none"
                          onClick={() => handleMove(row)}
                          aria-label="Mover"
                        >
                          <Repeat2Icon size={22} />
                        </button>
                      }
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block sm:hidden mt-6">
        {data.map((row) => (
          <div
            key={row._id}
            className="bg-white shadow-md rounded-lg mb-4 overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-blue_logo">Registro</h3>
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      className="flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={() => onEdit(row)}
                      aria-label="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => onDelete(row._id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {columns.map((col, index) => (
                  <div key={index}>
                    <span className="font-medium text-gray-700">
                      {col.header}:
                    </span>{" "}
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
