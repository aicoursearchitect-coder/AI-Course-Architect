
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Course, Source, SavedCourse } from './types';
import { generateCourseOutline, InvalidJsonError } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import CourseDisplay from './components/CourseDisplay';
import SourceList from './components/SourceList';
import Loader from './components/Loader';
import Feedback from './components/Feedback';
import SavedCoursesModal from './components/SavedCoursesModal';
import { SparklesIcon } from './components/icons/SparklesIcon';

const suggestedTopics = [
  'Introduction to Quantum Computing',
  'The Renaissance: Art and Culture',
  'Basics of Sustainable Agriculture',
  'Understanding Blockchain Technology',
  "A Beginner's Guide to Modern Calligraphy",
  'The History of Jazz Music',
];

export default function App() {
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const [savedCourses, setSavedCourses] = useLocalStorage<SavedCourse[]>('savedCourses', []);
  const [isSavedCoursesModalOpen, setIsSavedCoursesModalOpen] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  const generateCourse = useCallback(async (courseTopic: string) => {
    if (!courseTopic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setTopic(courseTopic); // Set topic in input for consistency

    setIsLoading(true);
    setError(null);
    setCourse(null);
    setSources([]);
    setFeedbackSubmitted(false);
    setShowSuggestions(false); // Hide suggestions when generation starts

    try {
      const { course, sources } = await generateCourseOutline(courseTopic);
      setCourse(course);
      setSources(sources);
    } catch (e) {
      console.error(e);
      if (e instanceof InvalidJsonError) {
        setError('The AI returned an unexpected format. This can happen with niche or complex topics. Please try rephrasing your topic.');
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGenerateCourse = useCallback(() => {
    generateCourse(topic);
  }, [topic, generateCourse]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    generateCourse(suggestion);
  }, [generateCourse]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
    if (!showSuggestions) setShowSuggestions(true);
    if(error) setError(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateCourse();
    }
  };

  const handleFeedbackSubmit = (feedback: { rating: 'good' | 'bad'; comment: string }) => {
    console.log('Feedback submitted:', feedback);
    setFeedbackSubmitted(true);
  };

  const handleSaveCourse = () => {
    if (!course) return;
    const newSavedCourse: SavedCourse = {
      id: Date.now().toString(),
      topic: topic || course.title, // Use input topic or fall back to course title
      savedAt: new Date().toISOString(),
      course,
      sources,
    };
    setSavedCourses([...savedCourses, newSavedCourse]);
  };

  const handleLoadCourse = (savedCourse: SavedCourse) => {
    setCourse(savedCourse.course);
    setSources(savedCourse.sources);
    setTopic(savedCourse.topic);
    setFeedbackSubmitted(false); // Reset feedback for loaded course
    setIsSavedCoursesModalOpen(false); // Close modal on load
  };

  const handleDeleteCourse = (courseId: string) => {
    setSavedCourses(savedCourses.filter(c => c.id !== courseId));
  };
  
  const handleCourseUpdate = (updatedCourse: Course) => {
    setCourse(updatedCourse);
  };

  const isCurrentCourseSaved = useMemo(() => {
    if (!course) return false;
    // Fix: Improve save detection logic to compare by content hash or a unique identifier if available.
    // For now, comparing stringified course object is a more robust check than just title/description.
    return savedCourses.some(saved => JSON.stringify(saved.course) === JSON.stringify(course));
  }, [course, savedCourses]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        savedCoursesCount={savedCourses.length}
        onToggleSavedCourses={() => setIsSavedCoursesModalOpen(!isSavedCoursesModalOpen)}
      />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-3">
            AI Course Architect
          </h1>
          <p className="max-w-2xl text-lg text-text-secondary">
            Enter any topic and our AI will crawl the web to design a unique, comprehensive learning experience just for you.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12" ref={suggestionsContainerRef}>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={handleTopicChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g., 'The History of Ancient Rome'"
              className="w-full pl-4 pr-32 py-4 text-lg bg-base-200 border border-base-300 rounded-full focus:ring-2 focus:ring-brand-secondary focus:outline-none transition-shadow"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              onClick={handleGenerateCourse}
              disabled={isLoading || !topic.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-3 px-6 rounded-full flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparklesIcon />
              <span>Generate</span>
            </button>
          </div>

          {showSuggestions && (
            <div className="absolute z-10 w-full mt-2 bg-base-200 border border-base-300 rounded-lg shadow-lg overflow-hidden animate-fade-in-down max-w-2xl">
              <h4 className="text-sm font-semibold text-text-secondary px-4 py-2 bg-base-300/50">Suggestions</h4>
              <ul>
                {suggestedTopics.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 text-text-primary hover:bg-brand-secondary/20 transition-colors duration-150"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        </div>

        {isLoading && <Loader />}

        {!isLoading && course && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-2">
                <CourseDisplay 
                  course={course}
                  sources={sources}
                  onSaveCourse={handleSaveCourse}
                  isSaved={isCurrentCourseSaved}
                  onCourseUpdate={handleCourseUpdate}
                />
              </div>
              <div>
                <SourceList sources={sources} />
              </div>
            </div>
            
            <div className="mt-12">
              {!feedbackSubmitted ? (
                <Feedback onSubmit={handleFeedbackSubmit} />
              ) : (
                <div className="bg-base-200 p-8 rounded-lg text-center transition-all duration-500">
                  <h3 className="text-xl font-bold text-text-primary">Thank you for your feedback!</h3>
                  <p className="text-text-secondary mt-1">Your input helps us improve.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-4 text-sm text-text-secondary border-t border-base-300">
        <p>Powered by Google Gemini</p>
      </footer>
      <SavedCoursesModal 
        isOpen={isSavedCoursesModalOpen}
        onClose={() => setIsSavedCoursesModalOpen(false)}
        savedCourses={savedCourses}
        onLoadCourse={handleLoadCourse}
        onDeleteCourse={handleDeleteCourse}
      />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
