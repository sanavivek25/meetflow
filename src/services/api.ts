export interface AnalysisRequest {
  transcript: string;
  title: string;
  date: string;
  participants: string[];
  meetingType: string;
}

export interface AnalysisResponse {
  meetingSummary: string;
  keyDiscussionPoints: string[];
  decisions: any[];
  actionItems: any[];
  risks: any[];
  unresolvedQuestions: any[];
  isDemoFallback?: boolean;
  message?: string;
  errorNotice?: string;
}

export async function checkServerStatus(): Promise<{ geminiConfigured: boolean; model: string }> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch (e) {
    return { geminiConfigured: false, model: 'gemini-3.8-flash' };
  }
}

export async function analyzeTranscript(request: AnalysisRequest): Promise<AnalysisResponse> {
  const res = await fetch('/api/analyze-transcript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}
