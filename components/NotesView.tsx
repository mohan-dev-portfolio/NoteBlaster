
import React from 'react';
import { BookMarked } from 'lucide-react';

interface NotesViewProps {
  notes: string[];
}

export const NotesView: React.FC<NotesViewProps> = ({ notes }) => {
  return (
    <div className="p-4 sm:p-6 bg-surface rounded-lg shadow-lg border border-gray-700 animate-[fadeIn_0.5s_ease-in-out]">
      <h3 className="text-2xl font-bold text-primary mb-4 flex items-center">
        <BookMarked className="w-6 h-6 mr-3" />
        AI-Generated Key Points
      </h3>
      {notes.length > 0 ? (
        <ul className="space-y-3 pl-5">
          {notes.map((note, index) => (
            <li key={index} className="text-text-primary list-disc list-outside marker:text-primary">
              {note}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-secondary">No notes were generated. The source document might be empty or in an unsupported format.</p>
      )}
    </div>
  );
};
