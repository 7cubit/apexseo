export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold">404 - Not Found</h2>
            <p>Could not find the requested resource.</p>
        </div>
    );
}
