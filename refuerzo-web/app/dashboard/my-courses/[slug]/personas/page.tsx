"use client";
import { useState } from "react";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import { useContext } from 'react';
import { CourseContext } from "../layout";


interface Person {
  _id: string;
  nombre: string;
  image?: string;
  email: string;
  telefono: string;
}

export default function Personas() {
  const [searchTerm, setSearchTerm] = useState("");
  const course = useContext(CourseContext);

  const filteredProfessors: Person[] = (course?.encargados.map((person) => ({
    ...person,
    id: person._id,
  })) || []).filter((person) =>
    person.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents: Person[] = (course?.alumnos.map((person) => ({
    ...person,
    id: person._id,
  })) || []).filter((person) =>
    person.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderList = (title: string, people: Person[], total?: number) => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-blue_principal">
        {title} {total !== undefined && `(${total})`}
      </h2>
      <ul className="mt-4 space-y-4">
        {people.map((person) => (
          <li
            key={person._id}
            className="flex items-center bg-white rounded-lg p-4 w-full"
          >
            {person.image ? (
              <Image
                src={person.image}
                alt={person.nombre}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover mr-4"
                priority
              />
            ) : (
              <div className="p-2 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <CircleUser className="w-8 h-8 text-blue_principal" />
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-lg font-medium text-gray-900">{person.nombre}</p>
              <p className="text-md text-gray-600">{person.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Buscar personas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-2 border outline-none border-gray-300 rounded-lg w-full"
      />

      <div>
        {filteredProfessors.length === 0 && filteredStudents.length === 0 && (
          <div className="text-center text-gray-500">
            <p>
              No se encontraron resultados con el término {searchTerm}
            </p>
          </div>
        )}

        {filteredProfessors.length > 0 && renderList("Profesores", filteredProfessors, course?.encargados.length)}

        {filteredStudents.length > 0 && renderList("Estudiantes", filteredStudents, course?.alumnos.length)}
      </div>

    </div>
  );
}