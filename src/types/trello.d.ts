export interface CardTimeData {
  dataInicial?: string;
  dataFinal?: string;
  /** YYYY-MM-DD — data de entrega/conclusão real do Trello (dueComplete / lista Done) */
  dataConclusao?: string;
}

export interface TaskTimeResult {
  tempoTask: number;
  diasAteFinalizar: number;
  atrasos: number;
  totalDias: number;
}

export type BadgeColor =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'pink'
  | 'sky'
  | 'lime'
  | 'light-gray';

export interface TrelloBadge {
  text: string;
  title?: string;
  color?: BadgeColor;
  icon?: string;
  refresh?: number;
}

export interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  due?: string | null;
  dueComplete?: boolean;
  dateLastActivity?: string;
  closed?: boolean;
}

export interface TrelloList {
  id: string;
  name: string;
  closed?: boolean;
}

export interface TrelloAction {
  id: string;
  type: string;
  date: string;
  data: {
    listAfter?: { id: string; name: string };
    listBefore?: { id: string; name: string };
    card?: {
      due?: string | null;
      dueComplete?: boolean;
    };
    old?: {
      due?: string | null;
      dueComplete?: boolean;
    };
  };
}

export interface TrelloPowerUpIFrame {
  get<T = unknown>(
    scope: 'card' | 'board' | 'member' | 'organization',
    visibility: 'shared' | 'private',
    key?: string,
    defaultValue?: T,
  ): Promise<T>;
  set(
    scope: 'card' | 'board' | 'member' | 'organization',
    visibility: 'shared' | 'private',
    key: string,
    value: unknown,
  ): Promise<void>;
  set(
    scope: 'card' | 'board' | 'member' | 'organization',
    visibility: 'shared' | 'private',
    data: Record<string, unknown>,
  ): Promise<void>;
  remove(
    scope: 'card' | 'board' | 'member' | 'organization',
    visibility: 'shared' | 'private',
    key?: string,
  ): Promise<void>;
  card(fields: string | string[]): Promise<Partial<TrelloCard>>;
  list(fields: string | string[]): Promise<Partial<TrelloList>>;
  lists(fields: string | string[]): Promise<Partial<TrelloList>[]>;
  getRestApi(): {
    getToken(): Promise<string | null>;
    isAuthorized(): Promise<boolean>;
    authorize(opts?: { expiration?: string; scope?: string }): Promise<string>;
  };
  render(fn: () => void | Promise<void>): void;
  sizeTo(selector: string | number | HTMLElement): Promise<void>;
  signUrl(url: string, args?: Record<string, unknown>): string;
  localizeKey(key: string): string;
  arg<T = unknown>(name: string, defaultValue?: T): T;
}

export interface CardBackSection {
  title: string;
  icon: string;
  content: {
    type: 'iframe';
    url: string;
    height?: number;
  };
}

export interface TrelloPowerUpStatic {
  initialize(capabilities: {
    'card-back-section'?: (
      t: TrelloPowerUpIFrame,
    ) => CardBackSection | Promise<CardBackSection>;
    'card-badges'?: (t: TrelloPowerUpIFrame) => TrelloBadge[] | Promise<TrelloBadge[]>;
    'card-detail-badges'?: (
      t: TrelloPowerUpIFrame,
    ) => TrelloBadge[] | Promise<TrelloBadge[]>;
  }): void;
  iframe(opts?: { appKey?: string; appName?: string }): TrelloPowerUpIFrame;
}

declare global {
  const __POWERUP_NAME__: string;
  const __POWERUP_APP_KEY__: string;

  interface Window {
    TrelloPowerUp: TrelloPowerUpStatic;
  }
}

export {};
