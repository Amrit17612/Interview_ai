import { Container } from '../../../components/ui/Container';
import { Accordion } from '../../../components/ui/Accordion';

export function FAQ() {
  const faqItems = [
    {
      title: "What is Interviu AI?",
      content: "Interviu AI is a technical and behavioral interview preparation platform designed to give you structured practice, actionable AI-driven feedback, and personalized improvement roadmaps so you can confidently land your target role."
    },
    {
      title: "Who is the platform designed for?",
      content: "It is designed primarily for students, new graduates, and early-career candidates looking to structure their preparation for technical, behavioral, and domain-specific roles (like Frontend, Backend, or Data Science)."
    },
    {
      title: "What can I practice?",
      content: "You can practice specific domain concepts (e.g., system design, algorithms, frontend frameworks) and company-specific interview patterns. You can also analyze your resume to receive ATS scores and structural suggestions."
    },
    {
      title: "How does AI feedback work?",
      content: "After you complete an interview module, the platform analyzes your responses for technical accuracy, communication clarity, and structural delivery. It highlights what you did well and pinpoints specific areas where your explanation or logic fell short."
    },
    {
      title: "Are personalized roadmaps generated from my performance?",
      content: "Yes. Your feedback automatically influences a personalized roadmap that guides you on what concepts to review or what communication skills to practice next."
    },
    {
      title: "Can I explore packs before creating an account?",
      content: "Yes! You can view the full catalog of available Domain and Company preparation packs publicly to see exactly what modules and features are included. However, you must create an account to actually begin practicing."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gray-50 border-b border-gray-100">
        <Container className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to know about preparing with Interviu AI.
          </p>
        </Container>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24">
        <Container className="max-w-3xl mx-auto">
          <Accordion items={faqItems} className="border-none shadow-none" />
        </Container>
      </section>
    </div>
  );
}
