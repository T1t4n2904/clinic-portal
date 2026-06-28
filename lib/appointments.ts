export const DEMO_APPOINTMENT_AMOUNT = 500;
export const AVAILABILITY_STORAGE_KEY = "clinic_demo_availability";
export const NOTIFICATIONS_STORAGE_KEY = "clinic_demo_notifications";

export type AppointmentModeValue = "ONLINE" | "OFFLINE";
export type IntervalPreset = "5" | "10" | "15" | "CUSTOM";

export type ModeAvailability = {
  notAvailable: boolean;
  startMinutes: number;
  endMinutes: number;
  rangeDays: number;
  intervalPreset: IntervalPreset;
  customInterval: number;
  unavailableSlots: string[];
};

export type DemoAvailability = Record<AppointmentModeValue, ModeAvailability>;

export type DemoSlot = {
  id: string;
  date: string;
  time: string;
  label: string;
  mode: AppointmentModeValue;
  slotStart: Date;
};

export const DEFAULT_AVAILABILITY: DemoAvailability = {
  ONLINE: {
    notAvailable: false,
    startMinutes: 9 * 60,
    endMinutes: 12 * 60,
    rangeDays: 7,
    intervalPreset: "15",
    customInterval: 20,
    unavailableSlots: [],
  },
  OFFLINE: {
    notAvailable: false,
    startMinutes: 14 * 60,
    endMinutes: 18 * 60,
    rangeDays: 7,
    intervalPreset: "15",
    customInterval: 20,
    unavailableSlots: [],
  },
};

export function getTodayInputValue() {
  return toDateInputValue(new Date());
}

export function getMaxDateForAvailability(availability: ModeAvailability) {
  const date = new Date();
  date.setDate(date.getDate() + availability.rangeDays - 1);
  return toDateInputValue(date);
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getIntervalMinutes(availability: ModeAvailability) {
  if (availability.intervalPreset === "CUSTOM") {
    return Math.max(
      5,
      Math.min(
        availability.customInterval,
        Math.max(5, availability.endMinutes - availability.startMinutes)
      )
    );
  }

  return Number(availability.intervalPreset);
}

export function formatMinutes(minutes: number) {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function timeValueFromMinutes(minutes: number) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function minutesFromTimeValue(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function getDateTitle(dateValue: string) {
  if (dateValue === getTodayInputValue()) {
    return "Today";
  }

  const date = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatSlotDateTime(dateValue: string, timeValue: string) {
  const date = new Date(`${dateValue}T${timeValue}:00`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function makeSlotId(mode: AppointmentModeValue, date: string, time: string) {
  return `${mode}|${date}|${time}`;
}

export function parseSlotId(slotId: string): DemoSlot | null {
  const [mode, date, time] = slotId.split("|");

  if ((mode !== "ONLINE" && mode !== "OFFLINE") || !date || !time) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  const slotStart = new Date(`${date}T${time}:00`);

  if (Number.isNaN(slotStart.getTime())) {
    return null;
  }

  return {
    id: slotId,
    date,
    time,
    mode,
    slotStart,
    label: formatSlotDateTime(date, time),
  };
}

export function getDemoSlot(slotId: string) {
  return parseSlotId(slotId);
}

export function generateSlotsForDate(
  mode: AppointmentModeValue,
  date: string,
  availability: ModeAvailability
) {
  if (availability.notAvailable || availability.endMinutes <= availability.startMinutes) {
    return [];
  }

  const interval = getIntervalMinutes(availability);
  const slots: DemoSlot[] = [];

  for (
    let minutes = availability.startMinutes;
    minutes < availability.endMinutes;
    minutes += interval
  ) {
    const time = timeValueFromMinutes(minutes);
    const id = makeSlotId(mode, date, time);

    if (availability.unavailableSlots.includes(id)) {
      continue;
    }

    slots.push({
      id,
      date,
      time,
      mode,
      slotStart: new Date(`${date}T${time}:00`),
      label: formatMinutes(minutes),
    });
  }

  return slots;
}
