type ConsultationViewProps = {
  consultation: {
    chiefComplaint: string;
    symptoms: string;
    diagnosis: string;
    advice: string;
    followUpDate: Date | null;
    createdAt: Date;
  };
};

export function ConsultationView({ consultation }: ConsultationViewProps) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-900">Consultation Notes</h2>

      <div className="mt-4 grid gap-3">
        <NoteField label="Chief Complaint" value={consultation.chiefComplaint} />
        <NoteField label="Symptoms" value={consultation.symptoms} />
        <NoteField label="Diagnosis" value={consultation.diagnosis} />
        <NoteField label="Advice" value={consultation.advice} />
        {consultation.followUpDate ? (
          <NoteField
            label="Follow-up Date"
            value={consultation.followUpDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        ) : null}
        <NoteField
          label="Recorded At"
          value={consultation.createdAt.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        />
      </div>
    </div>
  );
}

function NoteField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value}</p>
    </div>
  );
}
