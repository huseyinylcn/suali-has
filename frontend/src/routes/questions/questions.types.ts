import type { LucideIcon } from 'lucide-react';
import { Focus, List, Map } from 'lucide-react';

export type QuestionsTabId = 'list' | 'map' | 'mapDetail';

export const QUESTIONS_TABS: { id: QuestionsTabId; label: string; icon: LucideIcon }[] = [
  { id: 'list', label: 'Liste', icon: List },
  { id: 'map', label: 'Soru Haritası', icon: Map },
  { id: 'mapDetail', label: 'Harita detayı', icon: Focus }
];
