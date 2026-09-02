import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container } from '../../../components/ui/Container';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { useInterview } from '../hooks/useInterview';
import { ROUTES } from '../../../constants/routes';
import { Download, ShieldAlert } from 'lucide-react';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { apiClient } from '../../../services/api.client';

export function FinalReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('id');

  const {
    session,
    isLoading,
    error,
    loadSession
  } = useInterview();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [securityAudit, setSecurityAudit] = useState<any>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      if (sessionId && session?.status === 'COMPLETED' && session?.overallScore !== null) {
        try {
          const res = await apiClient.get(`/security/session/${sessionId}`);
          if (res.data?.success && res.data.data) {
            setSecurityAudit(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch security audit', err);
        }
      }
    };
    fetchAudit();
  }, [sessionId, session?.status, session?.overallScore]);

  const handleDownloadPDF = async () => {
    if (!session) return;
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF();
      let y = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxTextWidth = pageWidth - margin * 2;

      const addText = (text: string, fontSize: number, isBold: boolean = false, textColor: number[] = [0,0,0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);

        const lines = doc.splitTextToSize(text, maxTextWidth);

        // Check page break
        if (y + (lines.length * fontSize * 0.5) > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }

        doc.text(lines, margin, y);
        y += (lines.length * fontSize * 0.4) + 6;
      };

      // Header
      addText('---------------------------------------------------------------------------------', 10);
      addText('INTERVIU AI', 16, true, [37, 99, 235]); // brand-600
      addText('INTERVIEW PERFORMANCE REPORT', 14, true);
      addText('---------------------------------------------------------------------------------', 10);
      y += 5;

      addText('Candidate Interview', 12, true);
      addText(`Domain: ${session.configuration.domain}`, 10);
      addText(`Interview Type: ${session.configuration.type}`, 10);
      addText(`Difficulty: ${session.configuration.difficulty}`, 10);
      if (session.configuration.company) {
        addText(`Company: ${session.configuration.company === 'GENERIC' ? 'Generic Interview' : session.configuration.company}`, 10);
      }
      if (session.configuration.role) {
        addText(`Role: ${session.configuration.role}`, 10);
      }
      addText(`Date: ${new Date(session.createdAt).toLocaleDateString()}`, 10);
      y += 10;

      addText('OVERALL SCORE', 14, true);
      addText(`${session.overallScore ?? 'N/A'} / 100`, 12, true, [37, 99, 235]);
      y += 10;

      addText('FEEDBACK SUMMARY', 12, true);
      addText(session.feedbackSummary || 'Not available.', 10);
      y += 10;

      if (session.strengths && session.strengths.length > 0) {
        addText('STRENGTHS', 12, true, [22, 163, 74]); // green-600
        session.strengths.forEach(s => addText(`• ${s}`, 10));
        y += 5;
      }

      if (session.weaknesses && session.weaknesses.length > 0) {
        addText('WEAKNESSES', 12, true, [220, 38, 38]); // red-600
        session.weaknesses.forEach(w => addText(`• ${w}`, 10));
        y += 5;
      }

      if (session.recommendations && session.recommendations.length > 0) {
        addText('RECOMMENDATIONS', 12, true, [37, 99, 235]); // blue-600
        session.recommendations.forEach(r => addText(`• ${r}`, 10));
        y += 10;
      }

      addText('QUESTION PERFORMANCE', 14, true);
      session.questions.forEach((q, idx) => {
        addText(`Question ${idx + 1}`, 12, true);
        addText(`Q: ${q.text}`, 10, true);
        addText(`Answer: ${q.userAnswer || 'No answer provided'}`, 10);
        if (q.evaluation) {
          addText(`Score: ${q.evaluation.score}/100`, 10, true, [37, 99, 235]);
          addText(`Feedback: ${q.evaluation.feedback}`, 10);
        } else {
          addText(`Evaluation: Not available.`, 10, false, [107, 114, 128]);
        }
        y += 5;
      });

      if (securityAudit) {
        y += 10;
        addText('SECURITY & PROCTORING SUMMARY', 14, true);
        const sec = securityAudit;
        addText(`Warning count: ${sec.warningCount || 0}`, 10);
        addText(`Violation count: ${sec.violationCount || 0}`, 10);
        addText(`Tab Switches: ${sec.tabSwitchCount || 0}`, 10);
        addText(`Focus Losses: ${sec.focusLossCount || 0}`, 10);
        addText(`Copy Attempts: ${sec.copyAttemptCount || 0}`, 10);
        addText(`Cut/Paste Attempts: ${(sec.cutAttemptCount || 0) + (sec.pasteAttemptCount || 0)}`, 10);
        addText(`Right-click Attempts: ${sec.rightClickCount || 0}`, 10);
        addText(`No-face Events: ${sec.noFaceCount || 0}`, 10);
        addText(`Multiple-face Events: ${sec.multipleFaceCount || 0}`, 10);

        if (sec.events && sec.events.length > 0) {
          y += 5;
          addText('Event Timeline:', 12, true);
          sec.events.slice(0, 15).forEach((e: any) => {
            const time = new Date(e.timestamp).toLocaleTimeString();
            addText(`${time} — ${e.type} (${e.severity})`, 10);
          });
          if (sec.events.length > 15) {
            addText(`... and ${sec.events.length - 15} more events.`, 10, false, [107, 114, 128]);
          }
        }
      } else {
        y += 10;
        addText('SECURITY & PROCTORING SUMMARY', 14, true);
        addText('No security violations were recorded during this interview.', 10, false, [107, 114, 128]);
      }

      y += 10;
      addText('---------------------------------------------------------------------------------', 10);
      addText('Generated by Interviu AI', 10, false, [107, 114, 128]);

      doc.save(`interviu-ai-interview-report-${session._id}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (sessionId && (!session || session._id !== sessionId)) {
      loadSession(sessionId);
    }
  }, [sessionId, session, loadSession]);

  // Polling logic for async report generation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (session && session.status === 'COMPLETED' && session.overallScore === null) {
      interval = setInterval(() => {
        loadSession(session._id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, loadSession]);

  if (!sessionId) {
    return (
      <Container className="py-8">
        <div className="text-center p-8 text-gray-500">No Interview Session ID provided.</div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center p-8 text-gray-500">Loading final report...</div>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container className="py-8">
        <div className="text-center p-8 text-gray-500">Session not found or failed to load.</div>
        {error && <div className="text-red-500 text-center mt-2">{error}</div>}
      </Container>
    );
  }

  if (session.status !== 'COMPLETED') {
    return (
      <Container className="py-8">
        <div className="text-center p-8 text-gray-500 space-y-4">
          <p>This interview is not yet completed.</p>
          <Button onClick={() => navigate(`${ROUTES.INTERVIEW_ACTIVE}?id=${session._id}`)}>
            Return to Interview
          </Button>
        </div>
      </Container>
    );
  }

  if (session.status === 'COMPLETED' && session.overallScore === null) {
    return (
      <Container className="py-8 max-w-4xl">
        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your report is being generated...</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Our AI is carefully evaluating your responses. This usually takes about 15-30 seconds. This page will automatically update when your report is ready.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-4xl">
      <PageHeader
        title="Final Interview Report"
        description="Detailed analysis of your interview performance."
      />

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8 mt-6">
        <div className="text-center pb-8 border-b border-gray-100">
          <div className="text-5xl font-bold text-brand-600 mb-2">
            {session.overallScore ?? 'N/A'}%
          </div>
          <p className="text-gray-500 font-medium mb-4">Overall Score</p>

          {(session.configuration.company || session.configuration.role) && (
            <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Context:</span>
              {session.configuration.company && (
                <span className="bg-white border border-gray-300 px-2 py-1 rounded shadow-sm">
                  🏢 {session.configuration.company === 'GENERIC' ? 'Generic Interview' : session.configuration.company}
                </span>
              )}
              {session.configuration.role && (
                <span className="bg-white border border-gray-300 px-2 py-1 rounded shadow-sm">
                  💼 {session.configuration.role}
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Feedback Summary</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {session.feedbackSummary || 'No summary available.'}
          </p>
        </div>

        {((session.strengths && session.strengths.length > 0) || (session.weaknesses && session.weaknesses.length > 0) || (session.recommendations && session.recommendations.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {session.strengths && session.strengths.length > 0 && (
              <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <h4 className="text-green-800 font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Strengths
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-green-700 text-sm">
                  {session.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {session.weaknesses && session.weaknesses.length > 0 && (
              <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                <h4 className="text-red-800 font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Areas for Improvement
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-red-700 text-sm">
                  {session.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            {session.recommendations && session.recommendations.length > 0 && (
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 md:col-span-2">
                <h4 className="text-blue-800 font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Actionable Recommendations
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                  {session.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-500" /> Security & Proctoring Summary
          </h3>

          {securityAudit ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <div className="bg-white p-3 rounded shadow-sm border border-slate-100 flex-1 min-w-[120px]">
                  <div className="text-sm text-slate-500 font-medium">Overall Violations</div>
                  <div className="text-2xl font-bold text-slate-800">{securityAudit.violationCount || 0}</div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm border border-slate-100 flex-1 min-w-[120px]">
                  <div className="text-sm text-slate-500 font-medium">Warnings</div>
                  <div className="text-2xl font-bold text-amber-600">{securityAudit.warningCount || 0}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><span className="text-slate-500">Tab Switches:</span> <span className="font-semibold">{securityAudit.tabSwitchCount || 0}</span></div>
                <div><span className="text-slate-500">Focus Losses:</span> <span className="font-semibold">{securityAudit.focusLossCount || 0}</span></div>
                <div><span className="text-slate-500">Copy Attempts:</span> <span className="font-semibold">{securityAudit.copyAttemptCount || 0}</span></div>
                <div><span className="text-slate-500">Right Clicks:</span> <span className="font-semibold">{securityAudit.rightClickCount || 0}</span></div>
                <div><span className="text-slate-500">No Face:</span> <span className="font-semibold">{securityAudit.noFaceCount || 0}</span></div>
                <div><span className="text-slate-500">Multiple Faces:</span> <span className="font-semibold">{securityAudit.multipleFaceCount || 0}</span></div>
              </div>

              {securityAudit.events && securityAudit.events.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-800 mb-3">Security Timeline</h4>
                  <ul className="space-y-2 text-sm text-slate-600 max-h-40 overflow-y-auto custom-scrollbar">
                    {securityAudit.events.map((e: any, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-slate-400 min-w-[80px]">{new Date(e.timestamp).toLocaleTimeString()}</span>
                        <span className="font-medium text-slate-700">{e.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          e.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                          e.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>{e.severity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 italic">No security violations were recorded during this interview.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Detailed Q&A Analysis</h3>
          <div className="space-y-6">
            {session.questions.map((q, idx) => (
              <div key={q._id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="font-semibold text-gray-900 mb-2">Q{idx + 1}: {q.text}</div>
                <div className="text-gray-600 mb-4 pl-4 border-l-2 border-gray-300">
                  <span className="font-medium text-gray-700">Your Answer: </span>
                  {q.userAnswer}
                </div>
                {q.evaluation ? (
                  <div className="bg-white p-4 rounded-md border border-green-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-green-700">Evaluation</span>
                      <span className="font-bold text-brand-600">Score: {q.evaluation.score}/100</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {q.evaluation.feedback}
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm">No evaluation recorded for this answer.</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
            aria-label="Download PDF report"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </Button>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </Container>
  );
}