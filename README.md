*For a short demo of the application please open the "LaudryPresentation" PDF .* 

Built end-to-end platform (React, .NET 8, SQL Server) to digitize intake and handovers with QR-based item/order tracking.

Designed hybrid routing: local TSP (NN + 2-opt) , then Google optimizeWaypointOrder with traffic, generating accurate ETAs + polylines.

Dynamic route reconfiguration (add/remove/reorder stops) with duplicate-assignment guards and instant ETA refresh.

Delivered customer portal: OTP login, per-item status timeline, live driver location, secure expiring links, and notifications.

Built driver UI (start/complete stops, one-tap navigation) and staff tools (bulk status updates, route create/update, QR reprint).

Result: significant reduction in status calls (target ~60–75%), faster handovers, fewer labeling errors.



Stack: React (Vite), .NET 8 REST API (JWT), EF Core, SQL Server, Google Maps Platform (Routes/Directions), Vonage SMS, Swagger.

Core: OTP auth, QR item/order identification, pricing rules (fixed/multipliers), order & scheduling flows.

Routing: Hybrid algorithm (Nearest-Neighbor + 2-opt seed, refined by Google traffic) -> ETAs/polylines, dynamic re-opt on changes.

Ops/Quality: CORS/JWT security, audit trail for edits, guards against duplicate route assignment, Swagger and interface testing.
