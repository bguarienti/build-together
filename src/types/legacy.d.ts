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
  export const WEEKDAYS: string[];
  export const WEEKDAYS_SHORT: string[];
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
}
