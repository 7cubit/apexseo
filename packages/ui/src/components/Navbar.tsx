import React from 'react';
import { cn } from '../components/Button';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User } from 'lucide-react';

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Navbar({ className }: NavbarProps) {
    return (
        <div className={cn("border-b bg-background", className)}>
            <div className={cn("flex h-16 items-center px-4")}>
                <div className={cn("ml-auto flex items-center space-x-4")}>
                    <Input
                        type="search"
                        placeholder="Search..."
                        className={cn("md:w-[100px] lg:w-[300px]")}
                    />
                    <Button variant="ghost" size="icon" className={cn("rounded-full")}>
                        <User className={cn("h-5 w-5")} />
                        <span className={cn("sr-only")}>User menu</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
