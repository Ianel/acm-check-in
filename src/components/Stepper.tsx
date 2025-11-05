import * as React from "react";

import { defineStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import CheckinReason from "./CheckinReason";
import CheckoutTime from "./CheckoutTime";
import QrScanner from "./QrScanner";
import { format } from "date-fns";
import { API_URL } from "@/constants/url";
import { toast } from "sonner";

const { Stepper } = defineStepper(
    {
        id: "step-1",
        title: "Why ?",
    },
    {
        id: "step-2",
        title: "How long ?",
    },
    {
        id: "step-3",
        title: "Who ?",
    }
);

export function StepperWithLabel() {
    // collected data
    const [activityId, setActivityId] = React.useState<number | null>(null);
    const [expectedCheckoutTime, setExpectedCheckoutTime] = React.useState<
        string | null
    >(null);
    const [checkoutDateObj, setCheckoutDateObj] = React.useState<Date | null>(
        null
    );
    const [matricule, setMatricule] = React.useState<string | null>(null);

    // per-step completion flags
    const [step1Done, setStep1Done] = React.useState(false);
    const [step2Done, setStep2Done] = React.useState(false);
    const [step3Done, setStep3Done] = React.useState(false);

    const [hasScanned, setHasScanned] = React.useState(false);

    // UI flags
    const [highlightTextPrimary, setHighlightTextPrimary] =
        React.useState(false);

    return (
        <div className="flex w-full flex-col gap-8">
            <Stepper.Provider
                className="space-y-4"
                variant="horizontal"
                labelOrientation="vertical"
            >
                {({ methods }) => {
                    // determine whether current step is completed
                    const currentStepId =
                        methods.current?.id ?? methods.all[0].id;
                    const currentCompleted =
                        currentStepId === "step-1"
                            ? step1Done
                            : currentStepId === "step-2"
                            ? step2Done
                            : step3Done;

                    const onFinish = () => {
                        // build payload as requested
                        const payload = {
                            activity_id: activityId ?? null,
                            // check_in_time should use same format as expected_checkout_time
                            check_in_time: format(new Date(), "hh:mm a"),
                            expected_checkout_time:
                                expectedCheckoutTime ?? null,
                            // matricule must be a string
                            matricule: matricule ?? "",
                        };
                        // send/print payload
                        console.log(
                            "Finish payload:",
                            JSON.stringify(payload, null, 2)
                        );
                        // reset stepper and local state
                        methods.reset();
                        setActivityId(null);
                        setExpectedCheckoutTime(null);
                        setCheckoutDateObj(null);
                        setMatricule(null);
                        setStep1Done(false);
                        setStep2Done(false);
                        setStep3Done(false);
                        setHighlightTextPrimary(false);
                    };

                    return (
                        <React.Fragment>
                            <Stepper.Navigation>
                                {methods.all.map((step) => (
                                    <Stepper.Step
                                        key={step.id}
                                        of={step.id}
                                        onClick={() => methods.goTo(step.id)}
                                    >
                                        <Stepper.Title>
                                            {step.title}
                                        </Stepper.Title>
                                    </Stepper.Step>
                                ))}
                            </Stepper.Navigation>
                            <section className="mt-12">
                                {methods.switch({
                                    "step-1": () => (
                                        <CheckinReason
                                            selectedActivityId={activityId}
                                            onSelectionChange={(has, id) => {
                                                setStep1Done(has);
                                                setActivityId(id ?? null);
                                                // once user explicitly selects, stop special highlight
                                                setHighlightTextPrimary(false);
                                            }}
                                        />
                                    ),
                                    "step-2": () => (
                                        <CheckoutTime
                                            // keep previously entered time when navigating back from step3
                                            value={checkoutDateObj ?? null}
                                            onTimeSelected={(
                                                formatted,
                                                dateObj
                                            ) => {
                                                setStep2Done(!!formatted);
                                                setExpectedCheckoutTime(
                                                    formatted ?? null
                                                );
                                                setCheckoutDateObj(
                                                    dateObj ?? null
                                                );
                                            }}
                                        />
                                    ),
                                    "step-3": () => (
                                        <QrScanner
                                            onResult={(text) => {
                                                const matricule =
                                                    text.split("reg=")[1];
                                                console.log(matricule);

                                                fetch(
                                                    `${API_URL}/api/member/reg/${matricule}`
                                                )
                                                    .then((response) =>
                                                        response.json()
                                                    )
                                                    .then((data) => {
                                                        if (data.success) {
                                                            if (!hasScanned) {
                                                                toast(
                                                                    "QR Code scanned successfully",
                                                                    {
                                                                        description:
                                                                            "You can now enter the ACM.",
                                                                        position:
                                                                            "top-center",
                                                                    }
                                                                );
                                                                setHasScanned(
                                                                    true
                                                                );
                                                            }

                                                            setMatricule(
                                                                matricule
                                                            );
                                                            setStep3Done(
                                                                !!matricule
                                                            );
                                                        } else {
                                                            toast(
                                                                "You're not a member",

                                                                {
                                                                    description:
                                                                        "Please, use a valid member card!",
                                                                    position:
                                                                        "top-center",
                                                                }
                                                            );
                                                        }
                                                    })
                                                    .catch((error) => {
                                                        toast(
                                                            "An error occurred" +
                                                                error,
                                                            {
                                                                position:
                                                                    "top-center",
                                                            }
                                                        );
                                                    });
                                            }}
                                        />
                                    ),
                                })}
                            </section>
                            <Stepper.Controls className="mt-24">
                                {!methods.isLast && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            // If we're on step-2 and user clicks Previous, highlight the selected button on step-1
                                            if (currentStepId === "step-2") {
                                                setHighlightTextPrimary(true);
                                            } else {
                                                setHighlightTextPrimary(false);
                                            }
                                            // when going back from step-3, we purposely keep checkoutDateObj so CheckinTime retains the value
                                            methods.prev();
                                        }}
                                        disabled={methods.isFirst}
                                    >
                                        Previous
                                    </Button>
                                )}
                                <Button
                                    onClick={
                                        methods.isLast ? onFinish : methods.next
                                    }
                                    // disable Next/Finish unless current step is completed
                                    disabled={!currentCompleted}
                                >
                                    {methods.isLast ? "Finish" : "Next"}
                                </Button>
                            </Stepper.Controls>
                        </React.Fragment>
                    );
                }}
            </Stepper.Provider>
        </div>
    );
}
