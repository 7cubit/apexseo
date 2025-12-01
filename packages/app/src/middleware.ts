import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            // Protect all routes under /dashboard, /projects, etc.
            const path = req.nextUrl.pathname;
            if (path.startsWith("/dashboard") || path.startsWith("/projects")) {
                return !!token;
            }
            return true;
        },
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/projects/:path*", "/settings/:path*"],
};
