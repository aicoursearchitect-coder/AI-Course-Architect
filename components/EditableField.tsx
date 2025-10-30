import React, { useState, useEffect, useRef } from 'react';
import { PencilIcon } from './icons/PencilIcon';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  multiline?: boolean;
  displayClassName?: string;
  inputClassName?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  as = 'p',
  multiline = false,
  displayClassName = '',
  inputClassName = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        // For textarea, move cursor to the end
        inputRef.current.style.height = 'auto'; // Reset height
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      } else {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, multiline]);

  const handleSave = () => {
    if (currentValue.trim() !== value.trim() && currentValue.trim() !== '') {
      onSave(currentValue);
    } else {
      // Revert if unchanged or empty
      setCurrentValue(value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const DisplayComponent = as;

  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onInput={handleTextareaInput}
        className={`${inputClassName} resize-none overflow-hidden`}
        rows={1}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />
    );
  }

  return (
    <DisplayComponent
      onClick={() => setIsEditing(true)}
      className={`relative group cursor-pointer p-1 -m-1 rounded-md hover:bg-base-300/50 transition-colors ${displayClassName}`}
      title="Click to edit"
    >
      {value || <span className="text-text-secondary/50 italic">Click to add</span>}
      <PencilIcon className="absolute top-1/2 right-1 -translate-y-1/2 w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
    </DisplayComponent>
  );
};

export default EditableField;
