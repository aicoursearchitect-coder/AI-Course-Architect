import React from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface HeaderProps {
  savedCoursesCount: number;
  onToggleSavedCourses: () => void;
}

const Header: React.FC<HeaderProps> = ({ savedCoursesCount, onToggleSavedCourses }) => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-base-300">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="h-8 w-8 text-brand-secondary" />
            <span className="text-xl font-bold tracking-wider">CourseGen</span>
          </div>
          <div>
            <button 
              onClick={onToggleSavedCourses}
              className="relative bg-base-300 hover:bg-opacity-80 text-text-primary font-semibold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300"
            >
              My Courses
              {savedCoursesCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                  {savedCoursesCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;