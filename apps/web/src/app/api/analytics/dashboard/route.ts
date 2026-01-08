// Router for the seed data (dashboard)

import seed from "@/lib/analytics/dashboard/seed.json"

export async function GET() {
    return Response.json(seed, {
        status: 200,
    });
}

