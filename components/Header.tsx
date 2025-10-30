import React from 'react';

// A simple, abstract logo representing a book (course) with structured content (AI-architected).
const Logo: React.FC = () => (
  <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()} title="AI Course Architect - Home">
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-7 w-7 text-brand-secondary"
    >
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4.5A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M9 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M9 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
    <span className="text-xl font-bold text-text-primary tracking-tight">
      AI Course Architect
    </span>
  </div>
);


interface HeaderProps {
  savedCoursesCount: number;
  onToggleSavedCourses: () => void;
}

const Header: React.FC<HeaderProps> = ({ savedCoursesCount, onToggleSavedCourses }) => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-base-300">
          <Logo />
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