"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button, Card } from "@apexseo/ui";
import { createProjectSchema, CreateProjectInput } from "@/lib/validations/project";
import { Step1Basics } from "./Step1Basics";
import { Step2Config } from "./Step2Config";
import { Step3Schedule } from "./Step3Schedule";

export function ProjectWizard() {
    const [step, setStep] = useState(1);
    const router = useRouter();
    const methods = useForm<CreateProjectInput>({
        resolver: zodResolver(createProjectSchema) as any,
        defaultValues: {
            name: "",
            domain: "",
            userAgent: "ApexSEO-Bot/1.0",
            maxPages: 100,
            ignorePatterns: "",
            frequency: "manual",
            time: "00:00",
        },
        mode: "onChange",
    });

    const { handleSubmit, trigger, formState: { isSubmitting } } = methods;

    const nextStep = async () => {
        let isValid = false;
        if (step === 1) {
            isValid = await trigger(["name", "domain"]);
        } else if (step === 2) {
            isValid = await trigger(["userAgent", "maxPages", "ignorePatterns"]);
        }

        if (isValid) {
            setStep((s) => s + 1);
        }
    };

    const prevStep = () => {
        setStep((s) => s - 1);
    };

    const onSubmit = async (data: CreateProjectInput) => {
        try {
            // TODO: Call API to create project
            console.log("Creating project:", data);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect to dashboard (mock ID for now)
            router.push("/projects/123");
        } catch (error) {
            console.error("Failed to create project:", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Create New Project</h1>
                    <p className="text-muted-foreground">Step {step} of 3</p>
                    <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="min-h-[300px]">
                            {step === 1 && <Step1Basics />}
                            {step === 2 && <Step2Config />}
                            {step === 3 && <Step3Schedule />}
                        </div>

                        <div className="flex justify-between mt-8 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 1 || isSubmitting}
                            >
                                Back
                            </Button>

                            {step < 3 ? (
                                <Button type="button" onClick={nextStep}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Project"}
                                </Button>
                            )}
                        </div>
                    </form>
                </FormProvider>
            </Card>
        </div>
    );
}
