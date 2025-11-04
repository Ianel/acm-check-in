import React from "react";
import clsx from "clsx";
import { Button } from "./ui/button";

const activitiesData = [
    { id: 1, label: "STEM Club" },
    { id: 2, label: "Conversation class" },
    { id: 3, label: "Books" },
    { id: 4, label: "Internet" },
];

export default function CheckinReason({
    selectedActivityId,
    highlightTextPrimary,
    onSelectionChange,
}: {
    selectedActivityId?: number | null;
    highlightTextPrimary?: boolean;
    onSelectionChange?: (
        hasSelection: boolean,
        activityId?: number | null
    ) => void;
}) {
    const handleClick = (id: number) => {
        const isSelected = selectedActivityId === id;
        const newSelected = isSelected ? null : id;
        onSelectionChange?.(!!newSelected, newSelected);
    };

    return (
        <section className="flex flex-col items-center">
            <h2>Please, choose from the list of activities below: </h2>
            <br />
            <div className="flex flex-wrap gap-8">
                {activitiesData.map((a) => {
                    const isSelected = selectedActivityId === a.id;
                    return (
                        <Button
                            key={a.id}
                            className={clsx(
                                isSelected && "bg-primary text-white",
                                "transition-colors"
                            )}
                            onClick={() => handleClick(a.id)}
                            variant={"outline"}
                            type="button"
                            aria-pressed={isSelected}
                        >
                            {a.label}
                        </Button>
                    );
                })}
            </div>
        </section>
    );
}
