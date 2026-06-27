export const DEMO_APPOINTMENT_AMOUNT = 500;

export const DEMO_SLOTS = [
  {
    id: "tomorrow-morning",
    label: "Tomorrow, 10:00 AM",
    offsetDays: 1,
    hour: 10,
    minute: 0,
  },
  {
    id: "tomorrow-evening",
    label: "Tomorrow, 5:30 PM",
    offsetDays: 1,
    hour: 17,
    minute: 30,
  },
  {
    id: "day-after-morning",
    label: "Day after tomorrow, 11:30 AM",
    offsetDays: 2,
    hour: 11,
    minute: 30,
  },
] as const;

export function getDemoSlot(slotId: string) {
  const slot = DEMO_SLOTS.find((item) => item.id === slotId);

  if (!slot) {
    return null;
  }

  const slotStart = new Date();
  slotStart.setDate(slotStart.getDate() + slot.offsetDays);
  slotStart.setHours(slot.hour, slot.minute || 0, 0, 0);

  return {
    label: slot.label,
    slotStart,
  };
}
