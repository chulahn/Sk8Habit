export type Habit = {
  id: number;
  name: string;
  timeLabel: string; // "HH:MM"
  timeMins: number; // minutes since midnight
  y: number; // vertical position 0–100
  completed: boolean;
};

export type DayData = {
  id: string; // "YYYY-MM-DD"
  habits: Habit[];
};

export type Point = [number, number];

export type Friend = {
  id: number;
  name: string;
  points: number;
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
};

export type ProgressProfile = {
  displayName: string;
  friends: Friend[];
  purchases: string[];
  appUseDates: string[];
};
