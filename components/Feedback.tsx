import React, { useState } from 'react';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';

interface FeedbackProps {
  onSubmit: (feedback: { rating: 'good' | 'bad'; comment: string }) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating) {
      onSubmit({ rating, comment });
    }
  };

  const getButtonClass = (buttonRating: 'good' | 'bad') => {
    let baseClass = 'p-3 rounded-full transition-all duration-200 ';
    if (rating === buttonRating) {
        return baseClass + (rating === 'good' ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500' : 'bg-red-500/20 text-red-400 ring-2 ring-red-500');
    }
    return baseClass + 'bg-base-300 hover:bg-base-100';
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <h3 className="text-xl font-bold text-text-primary mb-4 text-center">Was this course helpful?</h3>
        <div className="flex justify-center items-center gap-4 mb-5">
          <button
            type="button"
            onClick={() => setRating('good')}
            className={getButtonClass('good')}
            aria-label="Good course"
          >
            <ThumbsUpIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => setRating('bad')}
            className={getButtonClass('bad')}
            aria-label="Bad course"
          >
            <ThumbsDownIcon className="h-6 w-6" />
          </button>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any other feedback? (optional)"
          className="w-full p-3 text-base bg-base-300 border border-base-100 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:outline-none transition-shadow"
          rows={3}
        />
        <button
          type="submit"
          disabled={!rating}
          className="mt-4 w-full bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default Feedback;
