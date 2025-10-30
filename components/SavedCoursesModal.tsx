import React, { useEffect, useCallback } from 'react';
import type { SavedCourse } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';

interface SavedCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCourses: SavedCourse[];
  onLoadCourse: (course: SavedCourse) => void;
  onDeleteCourse: (courseId: string) => void;
}

const SavedCoursesModal: React.FC<SavedCoursesModalProps> = ({
  isOpen,
  onClose,
  savedCourses,
  onLoadCourse,
  onDeleteCourse,
}) => {

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-base-100 bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-base-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col transform transition-transform duration-300 scale-95 opacity-0 animate-fade-in-scale"
        style={{ animationFillMode: 'forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold text-text-primary">My Saved Courses</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-base-300 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {savedCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">You have no saved courses yet.</p>
              <p className="text-text-secondary">Generate a course and click 'Save' to see it here.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {savedCourses.map((course) => (
                <li
                  key={course.id}
                  className="bg-base-300 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-grow">
                    <h3 className="font-bold text-text-primary text-lg">{course.course.title}</h3>
                    <p className="text-sm text-text-secondary">
                      Topic: "{course.topic}"
                    </p>
                    <p className="text-xs text-text-secondary/70 mt-1">
                      Saved on: {formatDate(course.savedAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onLoadCourse(course)}
                      className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 text-sm"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                      aria-label={`Delete course titled ${course.course.title}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SavedCoursesModal;
