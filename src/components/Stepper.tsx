import * as React from "react";

import { defineStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import CheckinReason from "./CheckinReason";
import CheckoutTime from "./CheckoutTime";
import QrScanner from "./QrScanner";
import { format } from "date-fns";
import { API_URL } from "@/constants/url";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

const { Stepper } = defineStepper(
    {
        id: "step-1",
        title: "Purpose of visit",
    },
    {
        id: "step-2",
        title: "Checkout time",
    },
    {
        id: "step-3",
        title: "Member Card scan",
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

    const [isVerifying, setIsVerifying] = React.useState(false);

    return (
        <div className="flex w-full flex-col gap-8">
            <Dialog open={isVerifying}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {" "}
                            <Spinner /> Verifying your informations
                        </DialogTitle>
                        <DialogDescription>
                            Please wait during the verification of your
                            informations.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
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
                                                setIsVerifying(true);

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
                                                        setIsVerifying(false);
                                                        if (data.success) {
                                                            toast(
                                                                "QR Code scanned successfully",
                                                                {
                                                                    description:
                                                                        "You can now enter the ACM.",
                                                                    position:
                                                                        "top-center",
                                                                }
                                                            );

                                                            setMatricule(
                                                                matricule
                                                            );
                                                            setStep3Done(
                                                                !!matricule
                                                            );

                                                            onFinish();
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
                            <Stepper.Controls className="mt-10">
                                {!methods.isLast && (
                                    <>
                                        {" "}
                                        <Button
                                            className="px-8 py-6"
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                // when going back from step-3, we purposely keep checkoutDateObj so CheckinTime retains the value
                                                methods.prev();
                                            }}
                                            disabled={methods.isFirst}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            className="px-8 py-6"
                                            onClick={methods.next}
                                            // disable Next/Finish unless current step is completed
                                            disabled={!currentCompleted}
                                        >
                                            Next
                                        </Button>
                                    </>
                                )}
                            </Stepper.Controls>
                        </React.Fragment>
                    );
                }}
            </Stepper.Provider>
        </div>
    );
}
