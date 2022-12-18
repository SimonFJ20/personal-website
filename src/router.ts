import { index } from "./pages";
import { notFound } from "./pages/notFound";
import { _, matchEqual } from "./utils";

export const route = (path: string): string =>
    matchEqual(path, [
        ["/", () => index()],
        [_, () => notFound()],
    ]);
