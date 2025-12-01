import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import useSWR from 'swr';

export function useSites(projectId: string) {
    const { data, error, isLoading } = useSWR(
        projectId ? `/sites/${projectId}/sites` : null,
        apiClient
    );

    return {
        sites: data || [],
        isLoading,
        isError: error
    };
}
