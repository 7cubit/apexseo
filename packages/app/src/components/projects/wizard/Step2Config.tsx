"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@apexseo/ui";
import { CreateProjectInput } from "../../../lib/validations/project";

export function Step2Config() {
    const { register, formState: { errors } } = useFormContext<CreateProjectInput>();

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="userAgent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    User Agent
                </label>
                <Input
                    id="userAgent"
                    placeholder="ApexSEO-Bot/1.0"
                    {...register("userAgent")}
                />
                <p className="text-xs text-muted-foreground">
                    The user agent string used by the crawler.
                </p>
                {errors.userAgent && (
                    <p className="text-sm text-red-500">{errors.userAgent.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="maxPages" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Max Pages
                </label>
                <Input
                    id="maxPages"
                    type="number"
                    {...register("maxPages", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                    Maximum number of pages to crawl.
                </p>
                {errors.maxPages && (
                    <p className="text-sm text-red-500">{errors.maxPages.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="ignorePatterns" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Ignore Patterns (Optional)
                </label>
                <Input
                    id="ignorePatterns"
                    placeholder="/admin, /login, *.pdf"
                    {...register("ignorePatterns")}
                />
                <p className="text-xs text-muted-foreground">
                    Comma-separated list of URL patterns to ignore.
                </p>
                {errors.ignorePatterns && (
                    <p className="text-sm text-red-500">{errors.ignorePatterns.message}</p>
                )}
            </div>
        </div>
    );
}
