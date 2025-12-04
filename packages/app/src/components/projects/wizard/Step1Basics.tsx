"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@apexseo/ui";
import { Label } from "@radix-ui/react-label"; // Assuming Radix primitive or I need to check if Label exists in UI
import { CreateProjectInput } from "../../../lib/validations/project";

export function Step1Basics() {
    const { register, formState: { errors } } = useFormContext<CreateProjectInput>();

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Project Name
                </label>
                <Input
                    id="name"
                    placeholder="My Awesome Project"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Domain URL
                </label>
                <Input
                    id="domain"
                    placeholder="https://example.com"
                    {...register("domain")}
                    className={errors.domain ? "border-red-500" : ""}
                />
                {errors.domain && (
                    <p className="text-sm text-red-500">{errors.domain.message}</p>
                )}
            </div>
        </div>
    );
}
