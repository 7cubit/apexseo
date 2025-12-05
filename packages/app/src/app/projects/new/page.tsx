'use client';

import { ProjectWizard } from '@/components/projects/ProjectWizard';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function NewProjectPage() {
    return (
        <DashboardLayout>
            <ProjectWizard />
        </DashboardLayout>
    );
}
