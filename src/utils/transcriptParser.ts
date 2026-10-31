import { TranscriptSegment } from '../types';

export function parseTranscriptSegments(rawText: string): TranscriptSegment[] {
  const lines = rawText.split('\n');
  const segments: TranscriptSegment[] = [];

  let currentSpeaker = 'Speaker';
  let segmentCount = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for timestamps like [00:01:23] or (01:23) or 00:01:23
    const timeMatch = line.match(/\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/);
    let timestamp: string | null = timeMatch ? timeMatch[1] : null;

    // Check for speaker pattern "Rahul:" or "Priya [00:01]:" or "Sneha (Backend):"
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);

    if (colonMatch) {
      let rawSpeaker = colonMatch[1].trim();
      const content = colonMatch[2].trim();

      // If speaker had timestamp e.g. "Rahul [00:01:10]"
      const spkTimeMatch = rawSpeaker.match(/\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/);
      if (spkTimeMatch) {
        timestamp = spkTimeMatch[1];
        rawSpeaker = rawSpeaker.replace(/\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/, '').trim();
      }

      currentSpeaker = rawSpeaker;
      segments.push({
        id: `seg-${segmentCount++}`,
        speaker: currentSpeaker,
        text: content,
        timestamp: timestamp || generateSyntheticTimestamp(segmentCount),
        lineNumber: i + 1,
      });
    } else {
      // Continuation line or untagged
      segments.push({
        id: `seg-${segmentCount++}`,
        speaker: currentSpeaker,
        text: line,
        timestamp: timestamp || generateSyntheticTimestamp(segmentCount),
        lineNumber: i + 1,
      });
    }
  }

  return segments;
}

function generateSyntheticTimestamp(index: number): string {
  const totalSeconds = (index - 1) * 45 + 15;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
