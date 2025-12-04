"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@apexseo/ui";
import { CreateProjectInput } from "../../../lib/validations/project";

export function Step3Schedule() {
    const { register, watch, formState: { errors } } = useFormContext<CreateProjectInput>();
    const frequency = watch("frequency");

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="frequency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Audit Frequency
                </label>
                <select
                    id="frequency"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("frequency")}
                >
                    <option value="manual">Manual (On Demand)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                {errors.frequency && (
                    <p className="text-sm text-red-500">{errors.frequency.message}</p>
                )}
            </div>

            {frequency !== "manual" && (
                <div className="space-y-2">
                    <label htmlFor="time" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Time (UTC)
                    </label>
                    <Input
                        id="time"
                        type="time"
                        {...register("time")}
                    />
                    {errors.time && (
                        <p className="text-sm text-red-500">{errors.time.message}</p>
                    )}
                </div>
            )}
        </div>
    );
}
