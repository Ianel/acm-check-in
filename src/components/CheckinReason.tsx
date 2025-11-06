import clsx from "clsx";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { API_URL } from "@/constants/url";

type Activity = {
    id: number;
    name: string;
    description: string;
    image?: string;
    isActive: boolean;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
};

export default function CheckinReason({
    selectedActivityId,
    onSelectionChange,
}: {
    selectedActivityId?: number | null;
    onSelectionChange?: (
        hasSelection: boolean,
        activityId?: number | null
    ) => void;
}) {
    const [activities, setActivities] = useState<Activity[]>([]);

    const handleClick = (id: number) => {
        const isSelected = selectedActivityId === id;
        const newSelected = isSelected ? null : id;
        onSelectionChange?.(!!newSelected, newSelected);
    };

    useEffect(() => {
        const fetchActivities = async () => {
            const response = await fetch(`${API_URL}/api/activity`);

            if (!response.ok) {
                throw new Error("Failed to fetch activities");
            }

            const data = await response.json();

            if (data.success) {
                setActivities(() => {
                    const activeActivities = data.data.filter(
                        (act: Activity) => act.isActive
                    );
                    return activeActivities;
                });
            }
        };

        fetchActivities();
    }, []);

    return (
        <section className="flex flex-col items-center">
            <h2>Please, choose from the list of activities below: </h2>
            <br />
            <div className="flex justify-center flex-wrap gap-8">
                {activities.map((a) => {
                    const isSelected = selectedActivityId === a.id;
                    return (
                        <Button
                            key={a.id}
                            className={clsx(
                                isSelected && "bg-primary text-white",
                                "transition-colors hover:bg-primary active:bg-primary px-10 py-8 hover:text-white"
                            )}
                            onClick={() => handleClick(a.id)}
                            variant={"outline"}
                            type="button"
                            aria-pressed={isSelected}
                        >
                            {a.name}
                        </Button>
                    );
                })}
            </div>
        </section>
    );
}
