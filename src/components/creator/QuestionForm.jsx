import { Trash2, Check, CheckCircle as CircleCheck } from 'lucide-react';

function QuestionForm({
  question,
  questionIndex,
  onQuestionChange,
  onAnswerChange,
  onCorrectAnswerChange,
  onRemove,
  canRemove
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
            title="Remove Question"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor={`question-${questionIndex}`} className="form-label">
          Question Text
        </label>
        <input
          id={`question-${questionIndex}`}
          type="text"
          className="form-input"
          value={question.question}
          onChange={(e) => onQuestionChange(questionIndex, 'question', e.target.value)}
          placeholder="Enter your question"
          required
        />
      </div>

      <div className="mb-4">
        <p className="form-label mb-2">Answer Options</p>
        <p className="text-sm text-gray-600 mb-3">Select the correct answer by clicking the circle next to it.</p>
        
        <div className="space-y-3">
          {question.answer.map((option, answerIndex) => (
            <div key={answerIndex} className="flex items-start">
              <button
                type="button"
                className="mt-2 mr-3 text-gray-400 hover:text-primary-600 focus:outline-none"
                onClick={() => onCorrectAnswerChange(questionIndex, answerIndex)}
                title={question.correctAnswerIndex === answerIndex ? "Correct Answer" : "Mark as Correct"}
              >
                {question.correctAnswerIndex === answerIndex ? (
                  <CircleCheck className="w-5 h-5 text-primary-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </button>
              
              <input
                type="text"
                className={`form-input flex-1 ${question.correctAnswerIndex === answerIndex ? 'border-primary-400' : ''}`}
                value={option}
                onChange={(e) => onAnswerChange(questionIndex, answerIndex, e.target.value)}
                placeholder={`Option ${answerIndex + 1}`}
                required
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionForm;