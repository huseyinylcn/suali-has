import type { MapPoint3D } from '../../../lib/questionsApi';
import { QuestionsSpaceMap } from './QuestionsSpaceMap';

export function QuestionsMapTabPanel({
  points,
  pointSummaries,
  selectedQuestionId,
  onSelectQuestionId
}: {
  points: MapPoint3D[];
  pointSummaries: Record<string, string>;
  selectedQuestionId: string | null;
  onSelectQuestionId: (id: string | null) => void;
}) {
  return (
    <QuestionsSpaceMap
      points={points}
      pointSummaries={pointSummaries}
      selectedQuestionId={selectedQuestionId}
      onSelectQuestionId={onSelectQuestionId}
    />
  );
}
