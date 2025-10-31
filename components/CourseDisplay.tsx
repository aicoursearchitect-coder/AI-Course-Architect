import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Course, Module, Lesson } from '../types';
import { FileDownIcon } from './icons/FileDownIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import EditableField from './EditableField';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';

interface CourseDisplayProps {
  course: Course;
  onSaveCourse: () => void;
  isSaved: boolean;
  onCourseUpdate: (course: Course) => void;
}

interface ModuleCardProps {
  module: Module;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onFieldChange: (path: (string | number)[], value: string) => void;
  onAddLesson: (newLesson: Lesson) => void;
  onDelete: () => void;
  onDeleteLesson: (lessonIndex: number) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, index, isOpen, onToggle, onFieldChange, onAddLesson, onDelete, onDeleteLesson }) => {
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const [editingDescriptionFor, setEditingDescriptionFor] = useState<number | null>(null);
  const [currentDescription, setCurrentDescription] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setEditingDescriptionFor(null);
    }
  }, [isOpen]);

  const handleSaveNewLesson = () => {
    if (!newLessonTitle.trim()) {
      setFormError('Lesson title is required.');
      return;
    }
    if (!newLessonDescription.trim()) {
      setFormError('Please add a description for the new lesson.');
      return;
    }

    onAddLesson({
      title: newLessonTitle,
      description: newLessonDescription,
    });
    // Reset form state
    setIsAddingLesson(false);
    setNewLessonTitle('');
    setNewLessonDescription('');
    setFormError(null);
  };

  const handleCancelAddLesson = () => {
    setIsAddingLesson(false);
    setNewLessonTitle('');
    setNewLessonDescription('');
    setFormError(null);
  };

  const handleSaveDescription = (lessonIndex: number) => {
    onFieldChange(['modules', index, 'lessons', lessonIndex, 'description'], currentDescription);
    setEditingDescriptionFor(null);
    setCurrentDescription('');
  };

  const titlePrefix = `Module ${index + 1}`;
  const lowerCasePrefix = titlePrefix.toLowerCase();
  const lowerCaseTitle = module.title.trim().toLowerCase();

  let titleForEditing = module.title;
  // Intelligently strip the prefix "Module X" or "Module X:" for editing to avoid duplication.
  if (lowerCaseTitle.startsWith(lowerCasePrefix)) {
      const rest = module.title.substring(lowerCasePrefix.length).trim();
      if (rest.startsWith(':')) {
          titleForEditing = rest.substring(1).trim();
      } else {
          titleForEditing = rest;
      }
  }

  return (
    <div className="bg-base-200 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-brand-secondary/50">
        <details className="group" open={isOpen}>
            <summary 
              className="p-5 flex justify-between items-center cursor-pointer list-none"
              onClick={(e) => {
                // Prevent default if the click is on the delete button.
                if ((e.target as HTMLElement).closest('button.delete-module-btn')) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                onToggle();
              }}
            >
                <div className="w-full mr-4">
                    <h3 className="text-xl font-bold flex items-baseline gap-2">
                      <span className="text-brand-secondary whitespace-nowrap">
                        {`${titlePrefix}:`}
                      </span>
                      <EditableField
                        as="span"
                        value={titleForEditing}
                        onSave={(newValue) => onFieldChange(['modules', index, 'title'], newValue)}
                        displayClassName="text-text-primary w-full"
                        inputClassName="text-xl font-bold text-text-primary bg-base-300 rounded px-2 py-1 w-full"
                      />
                    </h3>
                    <EditableField
                      value={module.description}
                      onSave={(newValue) => onFieldChange(['modules', index, 'description'], newValue)}
                      displayClassName="text-text-secondary mt-1 w-full"
                      inputClassName="text-text-secondary mt-1 bg-base-300 rounded px-2 py-1 w-full"
                    />
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                      }}
                      className="delete-module-btn p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                      aria-label={`Delete module ${index + 1}`}
                      title="Delete Module"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            </summary>
            <div className="px-5 pb-5 border-t border-base-300">
                <ul className="space-y-4 mt-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                        <li key={lessonIndex} className="group relative flex items-start pr-8">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-primary/50 flex items-center justify-center mr-3 mt-1">
                                <span className="text-xs font-bold text-white">{index + 1}.{lessonIndex + 1}</span>
                            </div>
                            <div className="w-full">
                                <EditableField
                                  value={lesson.title}
                                  onSave={(newValue) => onFieldChange(['modules', index, 'lessons', lessonIndex, 'title'], newValue)}
                                  displayClassName="font-semibold text-text-primary w-full"
                                  inputClassName="font-semibold text-text-primary bg-base-300 rounded px-2 py-1 w-full"
                                />
                                <div className="mt-1">
                                  {editingDescriptionFor === lessonIndex ? (
                                    <div className="mt-2 space-y-2 animate-fade-in">
                                      <textarea
                                        value={currentDescription}
                                        onChange={(e) => setCurrentDescription(e.target.value)}
                                        className="text-sm text-text-secondary bg-base-300 rounded px-2 py-2 w-full focus:ring-2 focus:ring-brand-secondary focus:outline-none"
                                        placeholder="Enter a one-sentence explanation..."
                                        autoFocus
                                        rows={2}
                                      />
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => handleSaveDescription(lessonIndex)} 
                                          className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-1 px-3 rounded-full text-xs transition-colors"
                                        >
                                          Save
                                        </button>
                                        <button 
                                          onClick={() => setEditingDescriptionFor(null)} 
                                          className="bg-base-300 hover:bg-opacity-80 text-text-secondary font-semibold py-1 px-3 rounded-full text-xs transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => {
                                        setCurrentDescription(lesson.description);
                                        setEditingDescriptionFor(lessonIndex);
                                      }}
                                      className="relative group cursor-pointer p-1 -m-1 rounded-md hover:bg-base-300/50 transition-colors"
                                      title="Click to edit explanation"
                                    >
                                      {lesson.description ? (
                                        <p className="text-sm text-text-secondary">{lesson.description}</p>
                                      ) : (
                                        <p className="text-sm text-text-secondary/60 italic">Click to add an explanation.</p>
                                      )}
                                      <PencilIcon className="absolute top-1/2 right-1 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  )}
                                </div>
                            </div>
                             <button
                              onClick={() => onDeleteLesson(lessonIndex)}
                              className="absolute top-1/2 right-0 -translate-y-1/2 p-2 rounded-full hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              aria-label={`Delete lesson ${lesson.title}`}
                              title="Delete Lesson"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-base-300/50">
                  {isAddingLesson ? (
                    <div className="space-y-3 animate-fade-in">
                      <h4 className="font-semibold text-text-primary">Add New Lesson</h4>
                      <div>
                        <input
                          type="text"
                          placeholder="Lesson Title (required)"
                          value={newLessonTitle}
                          onChange={(e) => {
                            setNewLessonTitle(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          className="font-semibold text-text-primary bg-base-300 rounded px-2 py-2 w-full focus:ring-2 focus:ring-brand-secondary focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Lesson Description (required)"
                          value={newLessonDescription}
                          onChange={(e) => {
                            setNewLessonDescription(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          className="text-sm text-text-secondary bg-base-300 rounded px-2 py-2 w-full focus:ring-2 focus:ring-brand-secondary focus:outline-none"
                          rows={3}
                        />
                      </div>
                      {formError && <p className="text-red-500 text-sm">{formError}</p>}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleSaveNewLesson} 
                          className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-1 px-4 rounded-full text-sm transition-colors"
                        >
                          Save Lesson
                        </button>
                        <button 
                          onClick={handleCancelAddLesson} 
                          className="bg-base-300 hover:bg-opacity-80 text-text-secondary font-semibold py-1 px-4 rounded-full text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingLesson(true)}
                      className="flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 rounded"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Lesson
                    </button>
                  )}
                </div>
            </div>
        </details>
    </div>
  );
}

const CourseDisplay: React.FC<CourseDisplayProps> = ({ course, onSaveCourse, isSaved, onCourseUpdate }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({ 0: true });
  const pdfExportRef = useRef<HTMLDivElement>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenModules({ 0: true });
  }, [course]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleModule = (index: number) => {
    setOpenModules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExpandAll = () => {
    const allOpen = course.modules.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<number, boolean>);
    setOpenModules(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenModules({});
  };

  const handleFieldChange = (path: (string | number)[], value: string) => {
    const newCourse = JSON.parse(JSON.stringify(course));
    
    let current = newCourse;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    onCourseUpdate(newCourse);
  };

  const handleAddLesson = (moduleIndex: number, newLesson: Lesson) => {
    const updatedCourse = {
      ...course,
      modules: course.modules.map((module, index) => {
        if (index === moduleIndex) {
          return { ...module, lessons: [...module.lessons, newLesson] };
        }
        return module;
      })
    };
    onCourseUpdate(updatedCourse);
  };
  
  const handleAddModule = () => {
    const newModule: Module = {
      title: 'New Module',
      description: 'Enter a description for this module.',
      lessons: [{ title: 'New Lesson', description: 'Enter a description for this lesson.' }]
    };
    const updatedCourse = { ...course, modules: [...course.modules, newModule] };
    onCourseUpdate(updatedCourse);
    setOpenModules(prev => ({ ...prev, [course.modules.length]: true }));
  };

  const handleDeleteModule = (moduleIndex: number) => {
    if (window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      const updatedCourse = {
        ...course,
        modules: course.modules.filter((_, index) => index !== moduleIndex),
      };
      onCourseUpdate(updatedCourse);
    }
  };
  
  const handleDeleteLesson = (moduleIndex: number, lessonIndex: number) => {
    if (window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      const updatedCourse = JSON.parse(JSON.stringify(course));
      updatedCourse.modules[moduleIndex].lessons.splice(lessonIndex, 1);
      onCourseUpdate(updatedCourse);
    }
  };

  const slugify = (text: string) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');

  const handleSaveAsJson = () => {
    const courseJson = JSON.stringify(course, null, 2);
    const blob = new Blob([courseJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-${slugify(course.title || 'untitled')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handleExportAsTxt = () => {
    let content = `Course Title: ${course.title}\n\n`;
    content += `Description: ${course.description}\n\n`;
    content += '--------------------------------------------------\n\n';

    course.modules.forEach((module, moduleIndex) => {
        content += `Module ${moduleIndex + 1}: ${module.title}\n`;
        content += `Description: ${module.description}\n\n`;
        
        module.lessons.forEach((lesson, lessonIndex) => {
            content += `  Lesson ${moduleIndex + 1}.${lessonIndex + 1}: ${lesson.title}\n`;
            content += `  Description: ${lesson.description}\n\n`;
        });
        
        content += '--------------------------------------------------\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-${slugify(course.title || 'untitled')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handleExportAsDocx = () => {
      const styles = `
          <style>
              body { font-family: sans-serif; line-height: 1.5; }
              h1 { color: #3b82f6; font-size: 24pt; }
              h2 { color: #1e40af; font-size: 18pt; border-bottom: 1px solid #eeeeee; padding-bottom: 5px; margin-top: 2em; }
              h3 { color: #374151; font-size: 14pt; }
              p { font-size: 12pt; }
          </style>
      `;

      let content = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <title>${course.title}</title>
              ${styles}
          </head>
          <body>
              <h1>${course.title}</h1>
              <p>${course.description}</p>
      `;

      course.modules.forEach((module, moduleIndex) => {
          content += `<h2>Module ${moduleIndex + 1}: ${module.title}</h2>`;
          content += `<p>${module.description}</p>`;
          
          module.lessons.forEach((lesson, lessonIndex) => {
              content += `<h3>Lesson ${moduleIndex + 1}.${lessonIndex + 1}: ${lesson.title}</h3>`;
              content += `<p>${lesson.description}</p>`;
          });
      });

      content += '</body></html>';

      const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course-${slugify(course.title || 'untitled')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExportMenuOpen(false);
  };

  const handleExportAsPdf = async () => {
    if (!pdfExportRef.current) return;
    setIsExporting(true);
    setIsExportMenuOpen(false);
  
    try {
      const canvas = await html2canvas(pdfExportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#111827',
        windowWidth: pdfExportRef.current.scrollWidth,
        windowHeight: pdfExportRef.current.scrollHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
  
      const contentWidth = pdfWidth - margin * 2;
      const ratio = canvas.width / contentWidth;
      const scaledImgHeight = canvas.height / ratio;
  
      const pageContentHeight = pdfHeight - margin * 2;
      const totalPages = Math.ceil(scaledImgHeight / pageContentHeight);
  
      const addHeaderAndFooter = (page: number) => {
        pdf.setFontSize(9);
        pdf.setTextColor('#d1d5db');
        pdf.text(course.title, margin, margin - 15, { align: 'left' });
        const pageNumText = `Page ${page} of ${totalPages}`;
        const textWidth = pdf.getTextWidth(pageNumText);
        pdf.text(pageNumText, pdfWidth - margin - textWidth, pdfHeight - margin + 15);
      };
  
      for (let i = 1; i <= totalPages; i++) {
        const yPos = margin - (pageContentHeight * (i - 1));
        pdf.addImage(imgData, 'PNG', margin, yPos, contentWidth, scaledImgHeight);
        addHeaderAndFooter(i);
        if (i < totalPages) {
          pdf.addPage();
        }
      }
      
      pdf.save(`course-${slugify(course.title || 'untitled')}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="bg-base-200 p-6 rounded-lg shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4">
          <div className="w-full">
            <EditableField 
              as="h2"
              value={course.title}
              onSave={(newValue) => handleFieldChange(['title'], newValue)}
              displayClassName="text-3xl font-extrabold text-text-primary mb-2 w-full"
              inputClassName="text-3xl font-extrabold text-text-primary mb-2 bg-base-300 rounded px-2 py-1 w-full"
            />
            <EditableField
              as="p"
              multiline
              value={course.description}
              onSave={(newValue) => handleFieldChange(['description'], newValue)}
              displayClassName="text-text-secondary text-lg w-full"
              inputClassName="text-text-secondary text-lg bg-base-300 rounded px-2 py-1 w-full"
            />
          </div>
          <div className="flex-shrink-0 flex items-center flex-wrap justify-end gap-2">
             <button
              onClick={onSaveCourse}
              disabled={isSaved}
              title={isSaved ? "Course is saved" : "Save course"}
              className="bg-base-300 hover:bg-opacity-80 text-text-primary font-semibold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <BookmarkIcon className="h-4 w-4" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  disabled={isExporting}
                  title="Export course"
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-full flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <FileDownIcon className="h-4 w-4" />
                  <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>
                {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-base-300 rounded-md shadow-lg z-20 animate-fade-in-down-fast">
                        <ul className="py-1">
                            <li>
                                <button onClick={handleSaveAsJson} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-secondary/20 transition-colors">Save as JSON</button>
                            </li>
                             <li>
                                <button onClick={handleExportAsTxt} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-secondary/20 transition-colors">Export as Text (.txt)</button>
                            </li>
                             <li>
                                <button onClick={handleExportAsDocx} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-secondary/20 transition-colors">Export as Word (.docx)</button>
                            </li>
                            <li>
                                <button onClick={handleExportAsPdf} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-secondary/20 transition-colors">Export as PDF</button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-base-300">
          <button
            onClick={handleExpandAll}
            className="text-sm font-semibold text-brand-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 rounded"
          >
            Expand All Modules
          </button>
          <button
            onClick={handleCollapseAll}
            className="text-sm font-semibold text-brand-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 rounded"
          >
            Collapse All Modules
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {course.modules.map((module, index) => (
          <ModuleCard
            key={index}
            module={module}
            index={index}
            isOpen={!!openModules[index]}
            onToggle={() => handleToggleModule(index)}
            onFieldChange={handleFieldChange}
            onAddLesson={(newLesson) => handleAddLesson(index, newLesson)}
            onDelete={() => handleDeleteModule(index)}
            onDeleteLesson={(lessonIndex) => handleDeleteLesson(index, lessonIndex)}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleAddModule}
          className="flex items-center gap-2 bg-base-200 hover:bg-base-300 text-text-primary font-semibold py-2 px-5 rounded-full transition-all duration-300"
        >
          <PlusIcon className="w-5 h-5" />
          Add Module
        </button>
      </div>

      {/* Hidden container for PDF export */}
      <div 
        ref={pdfExportRef} 
        className="absolute left-[-9999px] top-0 w-[900px] p-10 bg-base-100 text-text-primary font-sans"
        aria-hidden="true"
      >
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold text-text-primary mb-3">{course.title}</h2>
          <p className="text-text-secondary text-lg">{course.description}</p>
        </div>

        <div className="space-y-6">
          {course.modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="bg-base-200 rounded-lg p-6 break-inside-avoid">
              <h3 className="text-2xl font-bold text-brand-secondary mb-2">
                Module {moduleIndex + 1}: {module.title}
              </h3>
              <p className="text-text-secondary mb-4">{module.description}</p>
              <div className="border-t border-base-300 pt-4">
                <ul className="space-y-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <li key={lessonIndex} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-primary/50 flex items-center justify-center mr-4 mt-1">
                        <span className="text-xs font-bold text-white">{moduleIndex + 1}.{lessonIndex + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">{lesson.title}</h4>
                        <p className="text-sm text-text-secondary mt-1">{lesson.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadeInDownFast {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down-fast {
          animation: fadeInDownFast 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CourseDisplay;