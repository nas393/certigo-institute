import { createFileRoute, redirect } from "@tanstack/react-router";

// The old shop is replaced by the pricing page and per-course checkout.
export const Route = createFileRoute("/shop")({
  beforeLoad: () => { throw redirect({ to: "/pricing" }); },
});
