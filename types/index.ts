export type Habit = {
    id: string;
    name: string;
    color: string;
    completions: Record<string, boolean>;
};

export type Event = {
    id: string;
    title: string;
    date: string;
    time?: string;
    description?: string;
};