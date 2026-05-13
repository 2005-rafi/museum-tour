import React, { useState } from 'react';

/**
 * Comment submission + editing form.
 * @param {{ onSubmit: (text:string)=>void, initialValue?: string, placeholder?: string,
 *           isLoading?: boolean, onCancel?: ()=>void }} props
 */
function CommentForm({ onSubmit, initialValue = '', placeholder = 'Write a comment…', isLoading = false, onCancel }) {
  const [text, setText] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < 2) return;
    onSubmit(trimmed);
    if (!initialValue) setText(''); // reset only for new comments
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-form-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={1000}
        required
        aria-label="Comment text"
      />
      <div className="comment-form-actions">
        {onCancel && (
          <button type="button" className="comment-form-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="comment-form-submit"
          disabled={isLoading || text.trim().length < 2}
        >
          {isLoading ? 'Saving…' : initialValue ? 'Save' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
