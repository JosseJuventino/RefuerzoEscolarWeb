"use client";
import { CircleUser } from "lucide-react";
import data from "@/data/personas.json"; 

interface Person {
  id: number;
  name: string;
  image?: string | null;
}

export default function Personas() {
  const { professors, students } = data;

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
              <img
                src={person.image}
                alt={person.name}
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
      {renderList("Profesores", professors)}
      {renderList("Estudiantes", students, students.length)}
    </div>
  );
}
