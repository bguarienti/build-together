// Type shim for AppContext (JS module)
declare module "@/context/AppContext.jsx" {
  export const AppContext: import("react").Context<any>;
  export function AppContextProvider(props: { children: import("react").ReactNode }): JSX.Element;
}

declare module "@/hooks/useAppContext" {
  export function useAppContext(): any;
}

declare module "@/hooks/useAppContext.jsx" {
  export function useAppContext(): any;
}

declare module "@/utils/export" {
  export function exportToJSON(state: any): string;
}

declare module "@/utils/date" {
  export const HOURS: number[];
  export const SLOT_MINUTES: number;
  export const SLOTS: { hour: number; minute: number }[];
  export const WEEKDAYS: string[];
  export const WEEKDAYS_SHORT: string[];
  export function parseTime(hhmm: string): number;
  export function minutesToTime(total: number): string;
  export function getMonday(date: Date): Date;
  export function getWeekDates(date?: Date): Date[];
  export function formatDate(date: Date | string): string;
  export function formatDateBR(date: Date | string): string;
  export function formatTime(hour: number, minute?: number): string;
  export function isSameDay(a: Date, b: Date): boolean;
  export function isToday(date: Date): boolean;
  export function getDayName(date: Date): string;
  export function getDayNameShort(date: Date): string;
  export function addDays(date: Date, days: number): Date;
  export function getWeekRange(date: Date): string;
}

declare module "@/utils/metrics" {
  export function calculateHoursByTaskType(tasks: any[], taskTypes: any[]): any[];
  export function calculateDelayMetrics(tasks: any[], schedules: any[]): {
    avaliadas: number;
    atrasadas: number;
    no_prazo: number;
    atraso_total_horas: number;
    atraso_medio_horas: number;
    desvio_pct: number;
  };
}
