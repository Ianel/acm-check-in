import { useEffect, useRef, useState } from "react";
import { SimpleTimePicker } from "./TimePicker";
import { format } from "date-fns";

export default function CheckoutTime({
    value,
    onTimeSelected,
}: {
    value?: Date | null;
    onTimeSelected?: (formatted: string | null, dateObj?: Date | null) => void;
}) {
    // initialize from parent value if provided, otherwise now
    const [time, setTime] = useState<Date>(() => value ?? new Date());
    // keep a ref of the current time ms to avoid unnecessary setState loops
    const timeMsRef = useRef<number>(time.getTime());

    // keep local state in sync when parent provides a different (non-null) value
    useEffect(() => {
        if (!value) return;
        const parentMs = value.getTime();
        if (parentMs !== timeMsRef.current) {
            setTime(value);
            timeMsRef.current = parentMs;
        }
        // only run when parent value changes
    }, [value]);

    // notify parent whenever a valid time is set via the picker
    const handleChange = (d: Date) => {
        const newMs = d.getTime();
        // avoid redundant updates that can cause render loops
        if (newMs === timeMsRef.current) return;
        setTime(d);
        timeMsRef.current = newMs;
        const formatted = format(d, "hh:mm a");
        onTimeSelected?.(formatted, d);
    };

    return (
        <section className="flex flex-col items-center">
            <h2>Please, select the time at which you plan to leave: </h2>
            <br />
            <div className="flex gap-4 items-center">
                <SimpleTimePicker
                    use12HourFormat={true}
                    value={time}
                    onChange={handleChange}
                />
            </div>
        </section>
    );
}
