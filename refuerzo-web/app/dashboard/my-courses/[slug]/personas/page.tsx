"use client";
import { useState } from "react";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import data from "@/data/personas.json";

interface Person {
  id: number;
  name: string;
  image?: string | null;
}

export default function Personas() {
  const { professors, students } = data;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfessors = professors.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredStudents = students.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderList = (title: string, people: Person[], total?: number) => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {title} {total !== undefined && `(${total})`}
      </h2>
      <ul className="mt-4 space-y-4">
        {people.map((person) => (
          <li
            key={person.id}
            className="flex items-center bg-white shadow rounded-lg p-4 w-full"
          >
            {person.image ? (
              <Image
                src={person.image}
                alt={person.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="p-2 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <CircleUser className="w-8 h-8 text-blue_principal" />
              </div>
            )}
            <p className="text-lg font-medium text-gray-900">{person.name}</p>
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
        className="mb-6 p-2 border border-gray-300 rounded-lg w-full"
      />
      {renderList("Profesores", filteredProfessors)}
      {renderList("Estudiantes", filteredStudents, filteredStudents.length)}
    </div>
  );
}