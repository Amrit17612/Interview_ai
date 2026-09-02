import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { CheckCircle, Star, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/api.client';
import { ROUTES } from '../../../constants/routes';

export function Feedback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('id');

  const [ratings, setRatings] = useState({
    overallExperience: 0,
    questionQuality: 0,
    skillTesting: 0
  });
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate(ROUTES.INTERVIEW);
    }
  }, [sessionId, navigate]);

  const handleRating = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const isFormValid = ratings.overallExperience > 0 && ratings.questionQuality > 0 && ratings.skillTesting > 0;

  const handleSubmit = async () => {
    if (!isFormValid || !sessionId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/feedback', {
        sessionId,
        ...ratings,
        additionalSuggestions: suggestions
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate(`${ROUTES.INTERVIEW_REPORT}?id=${sessionId}`);
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Unable to submit feedback right now. Please try again.';
      if (msg.includes('already been submitted')) {
        setSubmitted(true);
        setTimeout(() => {
          navigate(`${ROUTES.INTERVIEW_REPORT}?id=${sessionId}`);
        }, 1500);
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate(`${ROUTES.INTERVIEW_REPORT}?id=${sessionId}`);
  };

  if (submitted) {
    return (
      <Container className="py-12 max-w-2xl flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Thank you for your feedback!</h2>
        <p className="text-gray-600 text-center text-lg">
          Your feedback helps us improve Interviu AI. Taking you to your report...
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mt-8" />
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your interview has been submitted successfully</h1>
          <p className="text-gray-600">
            Your performance report is being prepared. You can continue while we generate your detailed report.
          </p>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <RatingCategory 
              title="Overall Platform Experience"
              description="How was the interface and the flow?"
              value={ratings.overallExperience}
              onChange={(val) => handleRating('overallExperience', val)}
            />
            <RatingCategory 
              title="Quality of Questions"
              description="Were they clear and relevant?"
              value={ratings.questionQuality}
              onChange={(val) => handleRating('questionQuality', val)}
            />
            <RatingCategory 
              title="How Well It Tested Your Skills"
              description="Did it reflect real-world scenarios?"
              value={ratings.skillTesting}
              onChange={(val) => handleRating('skillTesting', val)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Any additional suggestions <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
              rows={4}
              placeholder="Feel free to drop any suggestions related to content, platform and test quality"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex-1 py-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : 'Submit Feedback'}
            </Button>
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="py-3 px-8 text-gray-500"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}

function RatingCategory({ title, description, value, onChange }: { title: string, description: string, value: number, onChange: (val: number) => void }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 focus:outline-none transition-colors duration-200"
            aria-label={`Rate ${star} out of 5 stars`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? 'fill-brand-500 text-brand-500'
                  : 'fill-transparent text-gray-300 hover:text-brand-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
