import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as createRootRoute, b as useNavigate, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { d as normalizeKrTicker, f as shouldRouteToEtf, i as getUniverseItem, l as isKrTicker, n as UNIVERSE_BY_CODE, s as isDigitTicker, t as UNIVERSE } from "./universe-BRNalp0M.mjs";
import { n as rankByQuery, t as matchesSearchQuery } from "./search-match-0BigPUUT.mjs";
import { t as US_LINKED_CODES } from "./us-link-7--eFHFs.mjs";
import { n as SECTORS, r as SECTOR_BY_ID, t as FOCUS_SECTOR_IDS } from "./sectors-CSrSXBVT.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as object, i as number, n as array, o as string, r as literal, s as union, t as _enum } from "../_libs/zod.mjs";
import { A as LayoutDashboard, D as LoaderCircle, F as Flag, L as FileText, S as Moon, U as Crosshair, a as TriangleAlert, c as Sun, f as Ship, h as Search, i as Triangle, j as Layers, k as Library, l as Star, n as X, w as Menu, y as Palette } from "../_libs/lucide-react.mjs";
import { n as QueryClientProvider, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { t as wrapper_default } from "../_libs/ws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-HKMONqs6.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/store-TVOZJbRy.js
var DEFAULT_WATCHLIST = [
	"005930",
	"000660",
	"373220",
	"207940",
	"277810",
	"012450"
];
var useAppStore = create()(persist((set, get) => ({
	watchlist: DEFAULT_WATCHLIST,
	theme: "dark",
	colorConvention: "korea",
	focusMode: false,
	preferredSectors: FOCUS_SECTOR_IDS,
	sidebarOpen: false,
	addToWatchlist: (code) => set((s) => s.watchlist.includes(code) ? s : { watchlist: [...s.watchlist, code] }),
	removeFromWatchlist: (code) => set((s) => ({ watchlist: s.watchlist.filter((c) => c !== code) })),
	toggleWatchlist: (code) => {
		const { watchlist } = get();
		if (watchlist.includes(code)) get().removeFromWatchlist(code);
		else get().addToWatchlist(code);
	},
	setTheme: (theme) => set({ theme }),
	toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
	setColorConvention: (colorConvention) => set({ colorConvention }),
	setFocusMode: (focusMode) => set({ focusMode }),
	setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
	isWatched: (code) => get().watchlist.includes(code)
}), {
	name: "korea-equity-cc",
	partialize: (s) => ({
		watchlist: s.watchlist,
		theme: s.theme,
		colorConvention: s.colorConvention,
		focusMode: s.focusMode,
		preferredSectors: s.preferredSectors
	})
}));
/** Korea: red up / blue down. Global: green up / red down. */
function usePriceColors() {
	if (useAppStore((s) => s.colorConvention) === "korea") return {
		up: "text-price-up",
		down: "text-price-down",
		upBg: "bg-price-up/10",
		downBg: "bg-price-down/10",
		upSolid: "bg-price-up",
		downSolid: "bg-price-down",
		label: "상승 빨강 · 하락 파랑 (한국)"
	};
	return {
		up: "text-price-up-global",
		down: "text-price-down-global",
		upBg: "bg-price-up-global/10",
		downBg: "bg-price-down-global/10",
		upSolid: "bg-price-up-global",
		downSolid: "bg-price-down-global",
		label: "상승 초록 · 하락 빨강 (글로벌)"
	};
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/format-CQ1NfHtZ.js
function formatPrice(value) {
	if (!Number.isFinite(value)) return "—";
	const abs = Math.abs(value);
	if (abs >= 1e3) return new Intl.NumberFormat("ko-KR").format(Math.round(value));
	if (Number.isInteger(value) || abs >= 100) return new Intl.NumberFormat("ko-KR").format(Math.round(value));
	return new Intl.NumberFormat("ko-KR", {
		minimumFractionDigits: 0,
		maximumFractionDigits: abs < 10 ? 2 : 1
	}).format(value);
}
function formatUsd(value) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}
function formatHoldingPrice(value, currency) {
	if (currency === "USD") return formatUsd(value);
	return formatPrice(value);
}
function formatWeight(value) {
	if (value == null || !Number.isFinite(value)) return "—";
	const abs = Math.abs(value).toFixed(2);
	return value < 0 ? `−${abs}%` : `${abs}%`;
}
function formatQty(value) {
	if (value == null || !Number.isFinite(value)) return "—";
	if (Number.isInteger(value)) return value.toLocaleString("ko-KR");
	return value.toLocaleString("ko-KR", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	});
}
function formatChange(value) {
	if (!Number.isFinite(value)) return "—";
	return `${value > 0 ? "+" : ""}${new Intl.NumberFormat("ko-KR").format(Math.round(value))}`;
}
function formatPct(value) {
	if (!Number.isFinite(value)) return "—";
	return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function formatVolume(value) {
	if (!Number.isFinite(value) || value === 0) return "—";
	if (value >= 1e8) return `${(value / 1e8).toFixed(1)}억`;
	if (value >= 1e4) return `${(value / 1e4).toFixed(0)}만`;
	return new Intl.NumberFormat("ko-KR").format(value);
}
function formatMarketCap(억) {
	if (!Number.isFinite(억) || 억 === 0) return "—";
	if (억 >= 1e4) return `${(억 / 1e4).toFixed(1)}조`;
	return `${new Intl.NumberFormat("ko-KR").format(억)}억`;
}
function relativeTime(iso, now = Date.now()) {
	const diff = now - new Date(iso).getTime();
	const mins = Math.floor(diff / 6e4);
	if (mins < 1) return "방금";
	if (mins < 60) return `${mins}분 전`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}시간 전`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}일 전`;
	return new Date(iso).toLocaleDateString("ko-KR", {
		month: "short",
		day: "numeric"
	});
}
/** Normalize listing / trade timestamps to YYYY-MM-DD. */
function formatIsoDate(raw) {
	if (!raw) return "—";
	const sliced = raw.trim().slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) return sliced;
	const dt = new Date(raw);
	if (Number.isNaN(dt.getTime())) return "—";
	return kstYmd(dt);
}
/** YYYY-MM-DD in Asia/Seoul. Never use UTC midnight for Korean session dates. */
function kstYmd(d = /* @__PURE__ */ new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Seoul",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(d);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-B3Rw4zmt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function QueryProvider({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		retry: 1,
		refetchOnWindowFocus: false,
		staleTime: 2e4
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client,
		children
	});
}
/**
* Top branding bar for deployed apps. Shown only when live
* GetRemixEligibility reports forkable. Project id is the sole VITE_ input
* (needed to call the RPC and build the remix link).
*/
var BANNER_HEIGHT = "2.75rem";
var BANNER_HEIGHT_VAR = "--grok-banner-h";
var REMIX_ELIGIBILITY_PATH = "/rest/app-deployer/v1/projects/{project_id}/remix-eligibility";
function readEnv(key) {
	const fromVite = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_AUTH_ENABLED": "false",
		"VITE_DEV_SERVER_HOST": "0.0.0.0"
	}[key];
	if (fromVite !== void 0 && fromVite !== "") return fromVite;
}
function remixEligibilityUrl(projectId) {
	return `https://app-builder-deployer.grok.com${REMIX_ELIGIBILITY_PATH.replace("{project_id}", encodeURIComponent(projectId))}`;
}
async function fetchRemixEligible(projectId) {
	try {
		const response = await fetch(remixEligibilityUrl(projectId), {
			method: "GET",
			credentials: "omit",
			headers: { Accept: "application/json" }
		});
		if (!response.ok) return false;
		const data = await response.json();
		if (!data || typeof data !== "object" || !("forkable" in data)) return false;
		return data.forkable === true;
	} catch {
		return false;
	}
}
function RemixIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "14",
		height: "14",
		viewBox: "0 0 14 14",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: "block size-3.5 shrink-0",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M2.85059 3.5C3.42171 3.49757 3.9879 3.74949 4.36816 4.17562C5.82851 5.79822 7.28852 7.42134 8.74886 9.04394C8.91014 9.22468 9.14982 9.3323 9.39201 9.33333C9.39445 9.33335 9.39697 9.33333 9.39941 9.33333C9.69335 9.33354 9.98729 9.34136 10.2812 9.35612L9.50423 8.5791L10.3291 7.75423L12.4915 9.91667L10.3291 12.0791L9.50423 11.2542L10.2812 10.4766C9.98728 10.4914 9.69336 10.4998 9.39941 10.5C9.39371 10.5 9.38802 10.5 9.38232 10.5C8.81697 10.4976 8.25832 10.2462 7.88184 9.82438C6.42149 8.20178 4.96148 6.57866 3.50114 4.95605C3.33823 4.77345 3.09529 4.66561 2.85059 4.66667H1.75V3.5H2.85059Z",
				fill: "#417CFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M5.53597 8.52612C5.14663 8.95882 4.75754 9.39174 4.36816 9.82438C3.9879 10.2505 3.42171 10.5024 2.85059 10.5H1.75V9.33333H2.85059C3.09529 9.33439 3.33823 9.22655 3.50114 9.04394C3.91804 8.58073 4.33469 8.11725 4.75155 7.65397L5.53597 8.52612Z",
				fill: "#417CFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12.4915 4.08333L10.3291 6.24577L9.50423 5.4209L10.2801 4.64445C9.99185 4.65884 9.70361 4.66667 9.41536 4.66667H9.39941C9.15471 4.66561 8.91177 4.77346 8.74886 4.95605C8.33197 5.41926 7.91473 5.88219 7.49788 6.34546L6.71346 5.47331C7.10279 5.04063 7.49247 4.60825 7.88184 4.17562C8.2621 3.74949 8.8283 3.49757 9.39941 3.5H9.41536C9.7036 3.5 9.99186 3.50726 10.2801 3.52165L9.50423 2.74577L10.3291 1.9209L12.4915 4.08333Z",
				fill: "#417CFF"
			})
		]
	});
}
function CreatedWithGrokBanner() {
	const projectId = (readEnv("VITE_PROJECT_ID") ?? "").trim();
	const [showRemix, setShowRemix] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (projectId.length === 0) return;
		fetchRemixEligible(projectId).then(setShowRemix);
	}, [projectId]);
	if (!showRemix) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed top-2 left-0 right-0 z-[100] flex justify-center",
		"data-created-with-grok-banner": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `:root{${BANNER_HEIGHT_VAR}:${BANNER_HEIGHT};}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: `https://grok.com/remix?app_id=${encodeURIComponent(projectId)}`,
			target: "_blank",
			rel: "noopener noreferrer",
			"aria-label": "Created with Grok — Remix this app",
			className: "group pointer-events-auto flex h-9 select-none items-center gap-2 rounded-full border border-white/15 bg-black/85 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.08)] pl-4 pr-1.5 text-[13px] leading-none text-white/90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium tracking-tight text-white/85",
				children: "Created with Grok"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex h-6 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 text-[12px] font-medium text-white transition-colors group-hover:bg-white/15",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RemixIcon, {}), "Remix"]
			})]
		})]
	});
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/**
* Stock universe accessors. Prices are NOT stored here —
* load live quotes via getMarketQuotes / useMarketQuotes.
*/
function stocksBySector(sectorId) {
	if (sectorId === "us-linked") return US_LINKED_CODES.map((c) => UNIVERSE_BY_CODE[c]).filter(Boolean);
	return UNIVERSE.filter((s) => s.sectorId === sectorId);
}
var getStocksBySector = stocksBySector;
function searchUniverse(q) {
	const s = q.trim();
	if (!s) return [];
	const hits = UNIVERSE.filter((x) => matchesSearchQuery(s, [
		x.nameKo,
		x.nameEn,
		x.code,
		SECTOR_BY_ID[x.sectorId]?.nameKo,
		SECTOR_BY_ID[x.sectorId]?.nameEn
	]));
	return rankByQuery(hits, s, (x) => ({
		name: x.nameKo,
		code: x.code
	})).slice(0, 20);
}
function mergeQuote(meta, q) {
	const price = q?.price ?? 0;
	const marketCap = q?.marketCap ?? 0;
	return {
		code: meta.code,
		nameKo: meta.nameKo,
		nameEn: meta.nameEn,
		sectorId: meta.sectorId,
		market: meta.market,
		price,
		change: q?.change ?? 0,
		changePct: q?.changePct ?? 0,
		volume: q?.volume ?? 0,
		marketCap,
		high52: q?.high52 ?? 0,
		low52: q?.low52 ?? 0,
		sparkline: [],
		capBand: marketCap >= 1e5 ? "대형" : marketCap >= 2e4 ? "중형" : "소형"
	};
}
function quoteToStock(q) {
	return mergeQuote({
		code: q.code,
		nameKo: q.nameKo,
		nameEn: q.nameEn,
		sectorId: q.sectorId,
		market: q.market
	}, q);
}
function marketMoversFromQuotes(quotes, n = 6) {
	const byPct = [...[...quotes].filter((q) => q.price > 0)].sort((a, b) => b.changePct - a.changePct);
	return {
		gainers: byPct.slice(0, n).map(quoteToStock),
		losers: [...byPct].reverse().slice(0, n).map(quoteToStock)
	};
}
function sectorStatsFromQuotes(sectorId, quotes) {
	const codes = sectorId === "us-linked" ? new Set(US_LINKED_CODES) : new Set(UNIVERSE.filter((u) => u.sectorId === sectorId).map((u) => u.code));
	const list = quotes.filter((q) => codes.has(q.code) && q.price > 0);
	if (!list.length) return {
		count: 0,
		avgChangePct: 0,
		topGainer: null,
		topLoser: null
	};
	const avg = list.reduce((s, q) => s + q.changePct, 0) / Math.max(1, list.length);
	const sorted = [...list].sort((a, b) => b.changePct - a.changePct);
	return {
		count: list.length,
		avgChangePct: avg,
		topGainer: quoteToStock(sorted[0]),
		topLoser: quoteToStock(sorted[sorted.length - 1])
	};
}
var getSecuritySearch = createServerFn({ method: "GET" }).validator(object({ q: string().min(1).max(80) })).handler(createSsrRpc("1a24cb119da9e6a2541edadee6c36926c6686f6648440daee51b9dd5311a79db"));
var getQuotesByCodes = createServerFn({ method: "GET" }).validator(object({ codes: array(string()).max(80) })).handler(createSsrRpc("20ea6d9740e1873a46832e044191aca791a44d54741a82c0515cc1024ed4809f"));
var getMarketQuotes = createServerFn({ method: "GET" }).handler(createSsrRpc("22317702d830bba22c18bf55ff9aebcad93b94248c8d7055bab2fcde519e8e40"));
var getStockBundle = createServerFn({ method: "GET" }).validator(object({ code: string().regex(/^\d{6}$/) })).handler(createSsrRpc("e9288d88bf1ce8e8e4c2f168f1315f422eb2b842f1836dbace9e44e9e3397186"));
var getChartData = createServerFn({ method: "GET" }).validator(object({
	code: string().min(4).max(8).transform((s) => normalizeKrTicker(s)).refine((s) => /^[0-9A-Z]{6}$/.test(s), "invalid ticker"),
	market: _enum(["KOSPI", "KOSDAQ"]),
	interval: _enum([
		"minute",
		"day",
		"week",
		"month",
		"year"
	]),
	minuteSize: union([
		literal(1),
		literal(3),
		literal(5),
		literal(10),
		literal(15),
		literal(30),
		literal(60)
	]).optional(),
	range: string().max(12).optional()
})).handler(createSsrRpc("2741e40ab8821427d8bcf896deb105a7fc19dc0babb8b6aaa02a412130fbdcb1"));
var getResearchPdf = createServerFn({ method: "GET" }).validator(object({
	researchId: number().int().positive(),
	category: _enum([
		"company",
		"industry",
		"market",
		"economy"
	]).optional()
})).handler(createSsrRpc("ec3f9140d0f0bf9b88ddf1a2d851c83947f39c599f5e8d3b49ee04869396705b"));
var getResearchDesk = createServerFn({ method: "GET" }).handler(createSsrRpc("7f1eda26b4ed9a12a5244298a15abb0733dcd49bd061fc8a0accfab120cc103f"));
var getIndustryResearch = createServerFn({ method: "GET" }).validator(object({ sectorId: string().min(2).max(40) })).handler(createSsrRpc("fa901486ee32fe838f7ec1e2616b9ca96d283759d098635f15bc3ca29270f2b4"));
var getDisclosureDetail = createServerFn({ method: "GET" }).validator(object({
	code: string().regex(/^[0-9A-Za-z]{6}$/),
	disclosureId: string().min(1).max(80)
})).handler(createSsrRpc("1107098a65d0f5af81534960a39838855f849486e0bdbe3da960184f336bc8d6"));
var getMarketIndices = createServerFn({ method: "GET" }).handler(createSsrRpc("f154a3830a7fa769b3681442c51672d43b9a273e148420e7f4105ddbb9cec5a6"));
createServerFn({ method: "GET" }).handler(createSsrRpc("9e6270a121f70ddeb2c53fa068debfb416fa043638edf949510802e4c35a32b9"));
var getKrxDisclosureDesk = createServerFn({ method: "GET" }).handler(createSsrRpc("6281abd8e0ea4fcb2e73102513eb9f1836f4cfa213660d96e1f42e5efd6335e4"));
createServerFn({ method: "GET" }).validator(object({
	code: string().min(4).max(8),
	nameKo: string().max(40).optional()
})).handler(createSsrRpc("f6e1258df5ed0a87b70ff13bb9ab8a207cc972029afee820bfc15f9d9ec58fa9"));
var getEtfMarket = createServerFn({ method: "GET" }).validator(object({
	bucket: _enum([
		"retirement",
		"all",
		"new",
		"theme",
		"us",
		"bond"
	]).optional(),
	q: string().max(80).optional(),
	limit: number().int().min(1).max(300).optional()
}).optional()).handler(createSsrRpc("1f550e4983ce6593c02d459289b03dbcfd2ca8e5672e4ed84b0ed31936d8a6a3"));
var getEtfListingNews = createServerFn({ method: "GET" }).handler(createSsrRpc("958e0e687e7dc66dfb3df70d2a767358d6db1234c44cbf9a9b449ac225dd3e84"));
var getEtfBundle = createServerFn({ method: "GET" }).validator(object({ code: string().min(4).max(8) })).handler(createSsrRpc("53180af1c07730e82baef51d15e76df4b7cb48694d71483a894406251d5d9db7"));
var getUsLinkDesk = createServerFn({ method: "GET" }).handler(createSsrRpc("f52dc16aa5a4dbef8932d53da7a78136dd3815103ce8fd839ab0848dc7c35b11"));
/** Coverage-universe snapshot quotes (Naver). KIS ticks overlay via useMarketStream. */
function useMarketQuotes(refetchMs = 45e3) {
	return useQuery({
		queryKey: ["market-quotes"],
		queryFn: () => getMarketQuotes(),
		staleTime: 4e4,
		refetchInterval: refetchMs,
		refetchOnWindowFocus: false
	});
}
function useQuoteMap() {
	const q = useMarketQuotes();
	const map = /* @__PURE__ */ new Map();
	for (const quote of q.data?.quotes ?? []) map.set(quote.code, quote);
	return {
		...q,
		map
	};
}
function useStockBundle(code) {
	const padded = normalizeKrTicker(code);
	return useQuery({
		queryKey: ["stock-bundle", padded],
		queryFn: () => getStockBundle({ data: { code: padded } }),
		staleTime: 25e3,
		refetchInterval: 45e3,
		refetchOnWindowFocus: false,
		enabled: isDigitTicker(padded)
	});
}
function useChartData(opts) {
	const code = normalizeKrTicker(opts.code);
	return useQuery({
		queryKey: [
			"chart",
			code,
			opts.market,
			opts.interval,
			opts.minuteSize ?? 1,
			opts.range ?? "default"
		],
		queryFn: () => getChartData({ data: {
			code,
			market: opts.market,
			interval: opts.interval,
			minuteSize: opts.minuteSize,
			range: opts.range
		} }),
		staleTime: opts.interval === "minute" ? 15e3 : 6e4,
		enabled: (opts.enabled ?? true) && isKrTicker(code),
		refetchOnWindowFocus: false
	});
}
function useMarketIndices() {
	return useQuery({
		queryKey: ["market-indices"],
		queryFn: () => getMarketIndices(),
		staleTime: 2e4,
		refetchInterval: 3e4,
		refetchOnWindowFocus: false
	});
}
function useResearchDesk(opts) {
	return useQuery({
		queryKey: ["research-desk"],
		queryFn: () => getResearchDesk(),
		staleTime: 3e5,
		enabled: opts?.enabled ?? true,
		refetchOnWindowFocus: false
	});
}
function useIndustryResearch(sectorId) {
	return useQuery({
		queryKey: ["industry-research", sectorId],
		queryFn: () => getIndustryResearch({ data: { sectorId } }),
		enabled: Boolean(sectorId),
		staleTime: 18e4,
		refetchOnWindowFocus: false
	});
}
function useEtfMarket(opts) {
	return useQuery({
		queryKey: [
			"etf-market",
			opts.bucket ?? "all",
			opts.q ?? "",
			opts.limit ?? 100
		],
		queryFn: () => getEtfMarket({ data: {
			bucket: opts.bucket,
			q: opts.q,
			limit: opts.limit
		} }),
		staleTime: 45e3,
		enabled: opts.enabled ?? true,
		refetchOnWindowFocus: false
	});
}
function useEtfListingNews(opts) {
	return useQuery({
		queryKey: ["etf-listing-news"],
		queryFn: () => getEtfListingNews(),
		staleTime: 3e5,
		enabled: opts?.enabled ?? true,
		refetchOnWindowFocus: false
	});
}
function useEtfBundle(code) {
	const normalized = normalizeKrTicker(code);
	return useQuery({
		queryKey: ["etf-bundle", normalized],
		queryFn: () => getEtfBundle({ data: { code: normalized } }),
		staleTime: 3e4,
		enabled: isKrTicker(normalized),
		refetchOnWindowFocus: false
	});
}
function useUsLinkDesk() {
	return useQuery({
		queryKey: ["us-link-desk"],
		queryFn: () => getUsLinkDesk(),
		staleTime: 9e4,
		refetchInterval: 18e4,
		refetchOnWindowFocus: false
	});
}
function useSecuritySearch(q) {
	const needle = q.trim();
	return useQuery({
		queryKey: ["security-search", needle],
		queryFn: () => getSecuritySearch({ data: { q: needle } }),
		enabled: needle.length >= 1,
		staleTime: 6e4,
		placeholderData: (prev) => prev
	});
}
function useQuotesByCodes(codes) {
	const key = [...codes].sort().join(",");
	return useQuery({
		queryKey: ["quotes-by-codes", key],
		queryFn: () => getQuotesByCodes({ data: { codes } }),
		enabled: codes.length > 0,
		staleTime: 3e4
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
	});
}
var NAV = [
	{
		to: "/",
		label: "대시보드",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/etfs",
		label: "퇴직연금 ETF",
		icon: Layers,
		tone: "text-desk-gold"
	},
	{
		to: "/us-link",
		label: "미국 연계",
		icon: Flag,
		tone: "text-desk-teal"
	},
	{
		to: "/export-desk",
		label: "수출 × KOSPI",
		icon: Ship,
		tone: "text-desk-gold"
	},
	{
		to: "/research",
		label: "리서치 데스크",
		icon: Library
	},
	{
		to: "/disclosures",
		label: "주요 공시",
		icon: FileText
	},
	{
		to: "/watchlist",
		label: "관심종목",
		icon: Star
	}
];
function Sidebar({ onNavigate, className }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const focusMode = useAppStore((s) => s.focusMode);
	const setFocusMode = useAppStore((s) => s.setFocusMode);
	const colors = usePriceColors();
	const { data } = useMarketQuotes();
	const quotes = data?.quotes ?? [];
	const sectors = focusMode ? SECTORS.filter((s) => FOCUS_SECTOR_IDS.includes(s.id) || s.focus) : SECTORS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("shell-sidebar flex h-full w-60 flex-col text-white", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3.5 py-3.5 border-b border-white/[0.08]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					onClick: onNavigate,
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-desk-gold to-amber-700 text-xs font-bold text-black shadow",
						children: "KX"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold tracking-tight text-white",
							children: "Korea Equity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[9px] font-medium uppercase tracking-[0.14em] text-white/45",
							children: "Command Center"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "px-2 py-2.5 space-y-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35",
					children: "Workspace"
				}), NAV.map((item) => {
					const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						onClick: onNavigate,
						className: cn("nav-item", active ? "nav-item-active" : "nav-item-idle"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-3.5 shrink-0", item.tone || "opacity-80") }), item.label]
					}, item.to);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-2.5 my-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center justify-between gap-2 text-xs text-white/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-3 text-desk-gold" }), "Focus 모드"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: focusMode,
						onCheckedChange: setFocusMode,
						"aria-label": "Focus 모드"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[10px] text-white/50 leading-snug",
					children: "미국 연계 · 반도체 · 전지 · 바이오 · 로봇"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto scroll-thin px-2 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35",
					children: "Sectors · 산업"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-0.5",
					children: sectors.map((s) => {
						const stats = sectorStatsFromQuotes(s.id, quotes);
						const to = `/industry/${s.id}`;
						const active = pathname === to || pathname.startsWith(`${to}/`);
						const up = stats.avgChangePct > 0;
						const color = !stats.count || stats.avgChangePct === 0 ? "text-white/40" : up ? colors.up : colors.down;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/industry/$sectorId",
							params: { sectorId: s.id },
							onClick: onNavigate,
							className: cn("nav-item justify-between", active ? "nav-item-active" : "nav-item-idle", s.id === "us-linked" && !active && "ring-1 ring-desk-gold/35"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate text-[13px]",
								children: [s.id === "us-linked" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-desk-gold mr-1",
									children: "★"
								}) : null, s.nameKo]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[11px] tabular shrink-0 font-medium font-mono", color),
								children: stats.count ? formatPct(stats.avgChangePct) : "—"
							})]
						}, s.id);
					})
				})]
			})
		]
	});
}
/** Static labels only — values load from server-side market adapters. */
var DATA_LABEL = "실시간: KIS Open API · KRX WebSocket(설정 시) · 백업: 네이버 금융 스냅샷 · 리포트: 네이버 금융 · 공시: DART";
var DATA_DELAY_NOTE = "KIS 자격증명이 설정된 종목은 KRX 실시간 체결 스트림으로 갱신합니다. 미설정·장애 시 네이버 금융 스냅샷으로 자동 유지되며, 화면에 데이터 모드를 명시합니다. 시장 폭·섹터 통계는 앱 커버리지 종목 기준입니다.";
function statusLabel(ms) {
	if (!ms) return null;
	const u = ms.toUpperCase();
	if (u === "OPEN") return "개장";
	if (u === "CLOSE" || u === "CLOSED") return "마감";
	if (u === "PREOPEN" || u === "PRE") return "장전";
	if (u === "AFTER" || u === "AFTERHOURS") return "시간외";
	return ms;
}
function MarketBar() {
	const colors = usePriceColors();
	const { data, isLoading, isError } = useMarketIndices();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const indices = data?.indices ?? [];
	const anyOpen = indices.some((i) => i.marketStatus?.toUpperCase() === "OPEN");
	const status = statusLabel(indices[0]?.marketStatus);
	const source = data?.source ?? indices[0]?.source ?? "naver-finance-snapshot";
	const modeLabel = source === "kis-krx-websocket" ? "KIS·KRX LIVE" : "스냅샷(네이버)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "market-tape",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-0 overflow-x-auto scroll-thin max-w-full",
			children: [
				mounted && isLoading && indices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 py-2 text-[11px] text-muted-foreground",
					children: "지수 수신 중…"
				}),
				isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 py-2 text-[11px] text-price-down",
					children: "지수 조회 실패"
				}),
				status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "market-tape-item flex shrink-0 items-center gap-1.5 border-r border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", anyOpen ? "bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" : "bg-muted-foreground") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-semibold tracking-wide text-muted-foreground uppercase",
							children: status
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded px-1 py-0.5 text-[9px] font-semibold tracking-wide", source === "kis-krx-websocket" ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"),
							children: modeLabel
						})
					]
				}),
				indices.map((idx, i) => {
					const up = idx.changePct > 0;
					const color = idx.changePct === 0 ? "text-muted-foreground" : up ? colors.up : colors.down;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("market-tape-item flex shrink-0 items-baseline gap-2", i > 0 && "border-l border-border"),
						title: `${idx.nameEn} · ${idx.source}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
								children: idx.nameKo
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold tabular text-foreground",
								children: idx.value.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("text-[11px] font-medium tabular", color),
								children: [
									up ? "+" : "",
									idx.change.toLocaleString("en-US", { maximumFractionDigits: 2 }),
									" ",
									"(",
									formatPct(idx.changePct),
									")"
								]
							})
						]
					}, idx.id);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ml-auto shrink-0 px-3 py-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-muted-foreground whitespace-nowrap",
						children: DATA_LABEL
					})
				})
			]
		})
	});
}
function PriceChange({ change, changePct, size = "sm", showAmount = true, className }) {
	const colors = usePriceColors();
	const up = changePct > 0;
	const flat = changePct === 0;
	const color = flat ? "text-muted-foreground" : up ? colors.up : colors.down;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-0.5 font-medium tabular", size === "xs" ? "text-[11px]" : size === "md" ? "text-sm" : "text-xs", color, className),
		children: [
			!flat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Triangle, {
				className: cn("size-2 fill-current", !up && "rotate-180"),
				strokeWidth: 0
			}),
			showAmount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatChange(change) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"(",
				formatPct(changePct),
				")"
			] })
		]
	});
}
function PriceValue({ value, changePct, size = "md", className }) {
	const colors = usePriceColors();
	const color = changePct === void 0 || changePct === 0 ? "text-foreground" : changePct > 0 ? colors.up : colors.down;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("font-semibold tabular tracking-tight", size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base", color, className),
		children: new Intl.NumberFormat("ko-KR").format(value >= 100 ? Math.round(value) : value)
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
var RECENT_KEY = "kx-search-recent-v1";
function loadRecent() {
	try {
		const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
		return Array.isArray(raw) ? raw.slice(0, 8) : [];
	} catch {
		return [];
	}
}
function pushRecent(hit) {
	const prev = loadRecent().filter((x) => x.code !== hit.code);
	localStorage.setItem(RECENT_KEY, JSON.stringify([hit, ...prev].slice(0, 8)));
}
function SearchCommand({ className }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [debounced, setDebounced] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [hi, setHi] = (0, import_react.useState)(0);
	const wrapRef = (0, import_react.useRef)(null);
	const navigate = useNavigate();
	const { map } = useQuoteMap();
	(0, import_react.useEffect)(() => {
		const id = window.setTimeout(() => setDebounced(q.trim()), 180);
		return () => window.clearTimeout(id);
	}, [q]);
	const live = useSecuritySearch(debounced);
	const localStocks = (0, import_react.useMemo)(() => searchUniverse(q), [q]);
	const etfQ = useEtfMarket({
		bucket: "all",
		q: debounced.length >= 2 ? debounced : void 0,
		limit: 20,
		enabled: debounced.length >= 2
	});
	const stockHits = (0, import_react.useMemo)(() => {
		const by = /* @__PURE__ */ new Map();
		for (const s of localStocks) by.set(s.code, {
			code: s.code,
			nameKo: s.nameKo,
			nameEn: s.nameEn,
			market: s.market,
			sectorId: s.sectorId,
			isEtf: false,
			source: "universe"
		});
		for (const h of live.data?.hits ?? []) if (!h.isEtf) by.set(h.code, h);
		return [...by.values()];
	}, [localStocks, live.data?.hits]);
	const etfResults = (0, import_react.useMemo)(() => {
		const fromLive = (live.data?.hits ?? []).filter((h) => h.isEtf);
		const needle = q.trim();
		if (needle.length < 2) return fromLive;
		const extra = (etfQ.data?.etfs ?? []).filter((etf) => matchesSearchQuery(needle, [
			etf.nameKo,
			etf.code,
			etf.tabLabel,
			etf.issuer
		])).map((etf) => ({
			code: etf.code,
			nameKo: etf.nameKo,
			nameEn: etf.nameKo,
			market: "KOSPI",
			sectorId: "electronics",
			isEtf: true,
			source: "naver-autocomplete"
		}));
		const by = /* @__PURE__ */ new Map();
		for (const h of [...fromLive, ...extra]) by.set(h.code, h);
		return [...by.values()];
	}, [
		live.data?.hits,
		etfQ.data?.etfs,
		q
	]);
	const rows = (0, import_react.useMemo)(() => {
		return [...stockHits.map((hit) => ({
			kind: "stock",
			hit
		})), ...etfResults.map((hit) => ({
			kind: "etf",
			hit
		}))].slice(0, 20);
	}, [stockHits, etfResults]);
	(0, import_react.useEffect)(() => setHi(0), [q]);
	(0, import_react.useEffect)(() => {
		function onDoc(e) {
			if (!wrapRef.current?.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, []);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				wrapRef.current?.querySelector("input")?.focus();
				setOpen(true);
			}
			if (e.key === "Escape") setOpen(false);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	function go(hit) {
		const code = normalizeKrTicker(hit.code);
		const etf = shouldRouteToEtf(code, hit.nameKo, hit.isEtf);
		const routed = {
			...hit,
			code,
			isEtf: etf
		};
		pushRecent(routed);
		try {
			sessionStorage.setItem("kx-last-security", JSON.stringify(routed));
		} catch {}
		if (etf) navigate({
			to: "/etfs/$code",
			params: { code }
		});
		else navigate({
			to: "/stock/$ticker",
			params: { ticker: code }
		});
		setOpen(false);
		setQ("");
	}
	const fetching = live.isFetching || etfQ.isFetching;
	const empty = !fetching && q.trim().length > 0 && rows.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: cn("relative w-full max-w-md", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => {
						setQ(e.target.value);
						setOpen(true);
					},
					onFocus: () => setOpen(true),
					onKeyDown: (e) => {
						if (!open) return;
						if (e.key === "ArrowDown") {
							e.preventDefault();
							setHi((i) => Math.min(i + 1, Math.max(rows.length - 1, 0)));
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							setHi((i) => Math.max(i - 1, 0));
						} else if (e.key === "Enter" && rows[hi]) {
							e.preventDefault();
							go(rows[hi].hit);
						}
					},
					placeholder: "코스피·코스닥 전 종목 · ETF · 코드 (⌘K)",
					className: "h-10 pl-9 pr-8 bg-muted/40 border-border text-sm",
					"aria-label": "종목 검색",
					autoComplete: "off"
				}),
				q && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
					onClick: () => {
						setQ("");
						setOpen(false);
					},
					"aria-label": "검색 지우기",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
			children: !q.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentList, { onPick: go }) : empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 py-6 text-center text-xs text-muted-foreground",
				children: "검색 결과 없음"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-80 overflow-y-auto scroll-thin py-1",
				children: [fetching && rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " 전 종목 검색 중"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: rows.map((row, i) => {
					const quote = map.get(row.hit.code);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50", i === hi && "bg-muted/60"),
						onMouseEnter: () => setHi(i),
						onClick: () => go(row.hit),
						children: [
							row.kind === "etf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-desk-gold shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 shrink-0 text-[10px] font-semibold text-muted-foreground",
								children: row.hit.market === "KOSDAQ" ? "코스닥" : "코스피"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: row.hit.nameKo
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10px] text-muted-foreground",
									children: [row.hit.code, row.kind === "etf" ? " · ETF" : ""]
								})]
							}),
							quote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-semibold tabular",
									children: formatPrice(quote.price)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChange, {
									change: quote.change,
									changePct: quote.changePct,
									size: "sm"
								})]
							})
						]
					}) }, `${row.kind}-${row.hit.code}`);
				}) })]
			})
		})]
	});
}
function RecentList({ onPick }) {
	const recent = typeof window === "undefined" ? [] : loadRecent();
	if (!recent.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-3 py-4 text-[11px] text-muted-foreground",
		children: "코스피·코스닥 전 종목 검색. 종목명 또는 6자리 코드를 입력하세요."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
			children: "최근 검색"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: recent.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50",
			onClick: () => onPick(h),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] text-muted-foreground w-10",
					children: h.isEtf ? "ETF" : h.market === "KOSDAQ" ? "코스닥" : "코스피"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: h.nameKo
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-[10px] tabular text-muted-foreground",
					children: h.code
				})
			]
		}) }, h.code)) })]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			destructive: "bg-destructive text-white hover:bg-destructive/90",
			link: "text-foreground underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-3.5 py-2",
			sm: "h-8 rounded-md px-2.5 text-xs",
			lg: "h-11 rounded-lg px-5",
			icon: "h-9 w-9",
			"icon-sm": "h-8 w-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Sheet = Dialog;
function SheetPortal(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogPortal, { ...props });
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
		className: cn("fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex flex-col gap-4 bg-card shadow-lg transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out", side === "right" && "inset-y-0 right-0 h-full w-full max-w-md border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right", side === "left" && "inset-y-0 left-0 h-full w-full max-w-xs border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left", side === "bottom" && "inset-x-0 bottom-0 max-h-[85vh] border-t border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-70 hover:bg-accent hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 border-b border-border px-4 py-3 pr-12", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		className: cn("text-base font-semibold text-foreground", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
		className: cn("text-xs text-muted-foreground", className),
		...props
	});
}
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
function TooltipContent({ className, sideOffset = 4, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 overflow-hidden rounded-md bg-primary px-2.5 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95", className),
		...props
	}) });
}
function AppShell({ children }) {
	const theme = useAppStore((s) => s.theme);
	const toggleTheme = useAppStore((s) => s.toggleTheme);
	const colorConvention = useAppStore((s) => s.colorConvention);
	const setColorConvention = useAppStore((s) => s.setColorConvention);
	const sidebarOpen = useAppStore((s) => s.sidebarOpen);
	const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		if (theme === "dark") root.classList.add("dark");
		else root.classList.remove("dark");
	}, [theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 300,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "app-shell bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "app-shell-banner shrink-0",
					style: { height: "var(--grok-banner-h, 0px)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "app-shell-top shell-header z-40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 h-12 px-3 md:grid-cols-[15rem_minmax(0,1fr)_auto] md:px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										className: "md:hidden",
										onClick: () => setSidebarOpen(true),
										"aria-label": "메뉴 열기",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/",
										className: "md:hidden flex items-center gap-2 font-semibold text-sm tracking-tight",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-desk-gold to-amber-700 text-[11px] font-bold text-black shadow-sm",
											children: "KX"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "leading-tight",
											children: ["Equity", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-[9px] font-medium text-muted-foreground tracking-wider uppercase",
												children: "Command"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden md:block" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchCommand, { className: "min-w-0 max-w-xl mx-auto w-full" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										onClick: () => setColorConvention(colorConvention === "korea" ? "global" : "korea"),
										"aria-label": "등락 색상 전환",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: colorConvention === "korea" ? "한국식 (빨강↑ 파랑↓) → 글로벌" : "글로벌 (초록↑ 빨강↓) → 한국식" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										onClick: toggleTheme,
										"aria-label": "테마 전환",
										children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: theme === "dark" ? "라이트 모드" : "다크 모드" })] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketBar, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "app-shell-body",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, { className: "hidden md:flex min-h-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "app-shell-main scroll-thin bg-background",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "app-shell-content desk-page mx-auto w-full max-w-[1440px] px-4 py-5 md:px-7 md:py-7",
							children
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
							className: "border-t border-border bg-panel/90 px-4 py-3 md:px-7",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mx-auto max-w-[1440px] text-[11px] leading-relaxed text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-desk-gold",
									children: "면책 · "
								}), "Korea Equity Command Center는 정보·리서치 워크플로 도구이며 투자 자문·매매 권유·주문 실행 서비스가 아닙니다. 시세·차트·수급·리포트는 제3자 경로(KIS/KRX·네이버·Yahoo·DART 등)에 의존하며 지연·누락·오류가 있을 수 있습니다. 투자 결정과 손실 책임은 이용자 본인에게 있습니다. 실주문 전 증권사 HTS/MTS에서 호가·잔량·VI·공시를 재확인하세요."]
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
					open: sidebarOpen,
					onOpenChange: setSidebarOpen,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
						side: "left",
						className: "w-72 p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
							className: "sr-only",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "메뉴" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
							className: "w-full border-0",
							onNavigate: () => setSidebarOpen(false)
						})]
					})
				})
			]
		})
	});
}
var styles_default = "/assets/styles-prKxmWmG.css";
var APP_NAME = "Korea Equity Command Center";
var Route$12 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "한국 주식 산업별 실시간 시세 · 공시 · 뉴스 · 증권사 리포트 커맨드 센터"
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "theme-color",
				content: "#060a12"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
			}
		]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ko",
		className: "dark",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatedWithGrokBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$10 = () => import("./routes-DyWzJV3o.mjs");
var Route$11 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$10, "component"),
	head: () => ({ meta: [{ title: "대시보드 · Korea Equity Command Center" }] })
});
var $$splitComponentImporter$9 = () => import("./disclosures-BeSMb63l.mjs");
var Route$10 = createFileRoute("/disclosures")({
	component: lazyRouteComponent($$splitComponentImporter$9, "component"),
	head: () => ({ meta: [{ title: "KRX 공시 데스크 · Korea Equity Command Center" }] })
});
var $$splitComponentImporter$8 = () => import("./etfs-BLEOHP_a.mjs");
var Route$9 = createFileRoute("/etfs")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./export-desk-D7co2ABQ.mjs");
var Route$8 = createFileRoute("/export-desk")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	head: () => ({ meta: [{ title: "Export × KOSPI · Korea Equity Command Center" }] })
});
var $$splitComponentImporter$6 = () => import("./research-wGlPcxRd.mjs");
var Route$7 = createFileRoute("/research")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	validateSearch: (s) => {
		const tab = s.tab;
		if (tab === "industry" || tab === "market" || tab === "economy" || tab === "featured") return {
			tab,
			sector: typeof s.sector === "string" ? s.sector : void 0
		};
		return {
			tab: "industry",
			sector: typeof s.sector === "string" ? s.sector : void 0
		};
	},
	head: () => ({ meta: [{ title: "리서치 데스크 · Korea Equity Command Center" }] })
});
var $$splitComponentImporter$5 = () => import("./us-link-DZRUbsrr.mjs");
var Route$6 = createFileRoute("/us-link")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	head: () => ({ meta: [{ title: "미국 연계 · 미중 AI 패권 전쟁 · Korea Equity" }] })
});
var $$splitComponentImporter$4 = () => import("./watchlist-BFSvjhMt.mjs");
var Route$5 = createFileRoute("/watchlist")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [{ title: "관심종목 · Korea Equity Command Center" }] })
});
var APPROVAL_URL = process.env.KIS_APPROVAL_URL ?? "https://openapi.koreainvestment.com:9443/oauth2/approval";
var WS_URL = process.env.KIS_WS_URL ?? "ws://ops.koreainvestment.com:21000";
var TR_ID = "H0STCNT0";
var APPROVAL_TTL_MS = 432e5;
function n(v) {
	const out = Number(String(v ?? "").replace(/,/g, ""));
	return Number.isFinite(out) ? out : 0;
}
function enabled() {
	return Boolean(process.env.KIS_APP_KEY && process.env.KIS_APP_SECRET);
}
var approvalCache = null;
async function getApprovalKey() {
	if (!enabled()) throw new Error("KIS credentials are not configured");
	if (approvalCache && Date.now() - approvalCache.at < APPROVAL_TTL_MS) return approvalCache.key;
	const res = await fetch(APPROVAL_URL, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			grant_type: "client_credentials",
			appkey: process.env.KIS_APP_KEY,
			secretkey: process.env.KIS_APP_SECRET
		})
	});
	if (!res.ok) throw new Error(`KIS approval HTTP ${res.status}`);
	const json = await res.json();
	if (!json.approval_key) throw new Error("KIS approval_key missing");
	approvalCache = {
		key: json.approval_key,
		at: Date.now()
	};
	return json.approval_key;
}
function parseTradePayload(payload) {
	const f = payload.split("^");
	if (f.length < 46) return null;
	const code = f[0]?.trim();
	if (!code || !/^\d{6}$/.test(code)) return null;
	const signCode = f[3] ?? "3";
	const direction = signCode === "4" || signCode === "5" ? -1 : signCode === "3" ? 0 : 1;
	const change = direction * Math.abs(n(f[4]));
	const changePct = direction * Math.abs(n(f[5]));
	return {
		code,
		tradeTime: f[1] ?? "",
		price: n(f[2]),
		change,
		changePct,
		open: n(f[7]),
		high: n(f[8]),
		low: n(f[9]),
		ask: n(f[10]),
		bid: n(f[11]),
		tradeVolume: n(f[12]),
		accumulatedVolume: n(f[13]),
		accumulatedValue: n(f[14]),
		tradeStrength: n(f[18]),
		businessDate: f[33] ?? "",
		marketControlCode: f[44] ?? "",
		source: "kis-krx-websocket",
		receivedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
var KisRealtimeHub = class {
	socket = null;
	listeners = /* @__PURE__ */ new Map();
	statusListeners = /* @__PURE__ */ new Set();
	approvalKey = null;
	connectPromise = null;
	reconnectTimer = null;
	reconnectAttempt = 0;
	getStatus() {
		return {
			enabled: enabled(),
			connected: this.socket?.readyState === wrapper_default.OPEN,
			provider: "kis",
			source: "kis-krx-websocket",
			message: enabled() ? void 0 : "KIS_APP_KEY / KIS_APP_SECRET 미설정 — 스냅샷 모드"
		};
	}
	onStatus(listener) {
		this.statusListeners.add(listener);
		listener(this.getStatus());
		return () => {
			this.statusListeners.delete(listener);
		};
	}
	async subscribe(code, listener) {
		if (!/^\d{6}$/.test(code)) throw new Error("Invalid KRX code");
		const set = this.listeners.get(code) ?? /* @__PURE__ */ new Set();
		const first = set.size === 0;
		set.add(listener);
		this.listeners.set(code, set);
		if (enabled()) {
			const wasOpen = this.socket?.readyState === wrapper_default.OPEN;
			await this.ensureConnected();
			if (first && wasOpen) this.sendSubscription(code, "1");
		}
		return () => {
			const current = this.listeners.get(code);
			if (!current) return;
			current.delete(listener);
			if (current.size === 0) {
				this.listeners.delete(code);
				this.sendSubscription(code, "0");
			}
		};
	}
	emitStatus(message) {
		const status = {
			...this.getStatus(),
			message: message ?? this.getStatus().message
		};
		for (const listener of this.statusListeners) listener(status);
	}
	async ensureConnected() {
		if (!enabled()) return;
		if (this.socket?.readyState === wrapper_default.OPEN) return;
		if (this.connectPromise) return this.connectPromise;
		this.connectPromise = (async () => {
			this.approvalKey = await getApprovalKey();
			await new Promise((resolve, reject) => {
				const ws = new wrapper_default(WS_URL);
				this.socket = ws;
				const timeout = setTimeout(() => reject(/* @__PURE__ */ new Error("KIS WebSocket connect timeout")), 1e4);
				ws.once("open", () => {
					clearTimeout(timeout);
					this.reconnectAttempt = 0;
					this.emitStatus("KRX 실시간 연결");
					for (const code of this.listeners.keys()) this.sendSubscription(code, "1");
					resolve();
				});
				ws.once("error", () => {
					clearTimeout(timeout);
					this.emitStatus("KIS WebSocket 오류");
					reject(/* @__PURE__ */ new Error("KIS WebSocket error"));
				});
				ws.on("close", () => {
					clearTimeout(timeout);
					this.socket = null;
					this.connectPromise = null;
					this.emitStatus("KIS 연결 끊김 — 재연결 대기");
					this.scheduleReconnect();
				});
				ws.on("message", (data) => {
					const text = typeof data === "string" ? data : Buffer.isBuffer(data) ? data.toString("utf8") : Buffer.from(data).toString("utf8");
					this.handleMessage(text);
				});
			});
		})().finally(() => {
			this.connectPromise = null;
		});
		return this.connectPromise;
	}
	scheduleReconnect() {
		if (!enabled() || this.listeners.size === 0 || this.reconnectTimer) return;
		const delay = Math.min(3e4, 1e3 * 2 ** this.reconnectAttempt++);
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			this.ensureConnected().catch(() => this.scheduleReconnect());
		}, delay);
	}
	sendSubscription(code, trType) {
		if (!this.approvalKey || this.socket?.readyState !== wrapper_default.OPEN) return;
		this.socket.send(JSON.stringify({
			header: {
				approval_key: this.approvalKey,
				custtype: "P",
				tr_type: trType,
				"content-type": "utf-8"
			},
			body: { input: {
				tr_id: TR_ID,
				tr_key: code
			} }
		}));
	}
	handleMessage(raw) {
		if (!raw) return;
		if (raw.startsWith("0|") || raw.startsWith("1|")) {
			const parts = raw.split("|");
			if (parts[1] !== TR_ID) return;
			const trade = parseTradePayload(parts[3] ?? "");
			if (!trade) return;
			for (const listener of this.listeners.get(trade.code) ?? []) listener(trade);
			return;
		}
		try {
			const msg = JSON.parse(raw);
			if (msg.header?.tr_id === "PINGPONG") {
				if (this.socket?.readyState === wrapper_default.OPEN) this.socket.pong(raw);
				return;
			}
			if (msg.body?.rt_cd === "1" && !String(msg.body.msg1 ?? "").includes("ALREADY IN SUBSCRIBE")) this.emitStatus(msg.body.msg1 ?? "KIS subscription error");
		} catch {}
	}
};
var kisRealtimeHub = new KisRealtimeHub();
var encoder = new TextEncoder();
function sse(event, data) {
	return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
var Route$4 = createFileRoute("/api/market-stream")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const codes = [...new Set((url.searchParams.get("codes") ?? "").split(",").map((x) => normalizeKrTicker(x)).filter((x) => isDigitTicker(x)))].slice(0, 40);
	if (!codes.length) return Response.json({ error: "codes_required" }, { status: 400 });
	let cleanup = [];
	let heartbeat = null;
	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(sse("status", kisRealtimeHub.getStatus()));
			const offStatus = kisRealtimeHub.onStatus((status) => {
				try {
					controller.enqueue(sse("status", status));
				} catch {}
			});
			cleanup.push(offStatus);
			Promise.all(codes.map((code) => kisRealtimeHub.subscribe(code, (trade) => {
				try {
					controller.enqueue(sse("trade", trade));
				} catch {}
			}))).then((offs) => cleanup.push(...offs)).catch((error) => {
				try {
					controller.enqueue(sse("status", {
						...kisRealtimeHub.getStatus(),
						connected: false,
						message: error instanceof Error ? error.message : "KIS stream error"
					}));
				} catch {}
			});
			heartbeat = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(": heartbeat\n\n"));
				} catch {}
			}, 15e3);
			request.signal.addEventListener("abort", () => {
				if (heartbeat) clearInterval(heartbeat);
				for (const off of cleanup.splice(0)) off();
				try {
					controller.close();
				} catch {}
			}, { once: true });
		},
		cancel() {
			if (heartbeat) clearInterval(heartbeat);
			for (const off of cleanup.splice(0)) off();
		}
	});
	return new Response(stream, { headers: {
		"content-type": "text/event-stream; charset=utf-8",
		"cache-control": "no-cache, no-transform",
		connection: "keep-alive",
		"x-accel-buffering": "no"
	} });
} } } });
var $$splitComponentImporter$3 = () => import("./etfs.index-CpmmWusE.mjs");
var Route$3 = createFileRoute("/etfs/")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: "ETF 데스크 · Korea Equity Command Center" }] })
});
var $$splitComponentImporter$2 = () => import("./etfs._code-Cs5D28LH.mjs");
var Route$2 = createFileRoute("/etfs/$code")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: ({ params }) => ({ meta: [{ title: `${params.code} · ETF · Korea Equity` }] })
});
var $$splitComponentImporter$1 = () => import("./industry._sectorId-DmycOp79.mjs");
var Route$1 = createFileRoute("/industry/$sectorId")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: ({ params }) => {
		const s = SECTOR_BY_ID[params.sectorId];
		return { meta: [{ title: s ? `${s.nameKo} · Korea Equity Command Center` : "산업 · Korea Equity" }] };
	}
});
var $$splitComponentImporter = () => import("./stock._ticker-COfdxQZZ.mjs");
var Route = createFileRoute("/stock/$ticker")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: ({ params }) => {
		const st = getUniverseItem(params.ticker);
		return { meta: [{ title: st ? `${st.nameKo} ${st.code} · Korea Equity` : "종목 · Korea Equity" }] };
	}
});
var IndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$12
});
var DisclosuresRoute = Route$10.update({
	id: "/disclosures",
	path: "/disclosures",
	getParentRoute: () => Route$12
});
var EtfsRoute = Route$9.update({
	id: "/etfs",
	path: "/etfs",
	getParentRoute: () => Route$12
});
var ExportDeskRoute = Route$8.update({
	id: "/export-desk",
	path: "/export-desk",
	getParentRoute: () => Route$12
});
var ResearchRoute = Route$7.update({
	id: "/research",
	path: "/research",
	getParentRoute: () => Route$12
});
var UsLinkRoute = Route$6.update({
	id: "/us-link",
	path: "/us-link",
	getParentRoute: () => Route$12
});
var WatchlistRoute = Route$5.update({
	id: "/watchlist",
	path: "/watchlist",
	getParentRoute: () => Route$12
});
var ApiMarketStreamRoute = Route$4.update({
	id: "/api/market-stream",
	path: "/api/market-stream",
	getParentRoute: () => Route$12
});
var EtfsIndexRoute = Route$3.update({
	id: "/",
	path: "/",
	getParentRoute: () => EtfsRoute
});
var EtfsCodeRoute = Route$2.update({
	id: "/$code",
	path: "/$code",
	getParentRoute: () => EtfsRoute
});
var IndustrySectorIdRoute = Route$1.update({
	id: "/industry/$sectorId",
	path: "/industry/$sectorId",
	getParentRoute: () => Route$12
});
var StockTickerRoute = Route.update({
	id: "/stock/$ticker",
	path: "/stock/$ticker",
	getParentRoute: () => Route$12
});
var EtfsRouteChildren = {
	EtfsCodeRoute,
	EtfsIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	DisclosuresRoute,
	EtfsRoute: EtfsRoute._addFileChildren(EtfsRouteChildren),
	ExportDeskRoute,
	ResearchRoute,
	UsLinkRoute,
	WatchlistRoute,
	ApiMarketStreamRoute,
	IndustrySectorIdRoute,
	StockTickerRoute
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultPreload: "intent"
	});
}
//#endregion
export { getKrxDisclosureDesk as A, formatPrice as B, useMarketQuotes as C, useStockBundle as D, useResearchDesk as E, sectorStatsFromQuotes as F, relativeTime as G, formatVolume as H, formatHoldingPrice as I, cn as J, useAppStore as K, formatIsoDate as L, getStocksBySector as M, marketMoversFromQuotes as N, useUsLinkDesk as O, mergeQuote as P, formatMarketCap as R, useIndustryResearch as S, useQuotesByCodes as T, formatWeight as U, formatQty as V, kstYmd as W, createSsrRpc as Y, Switch as _, Route$7 as a, useEtfListingNews as b, SheetDescription as c, Button as d, Input as f, DATA_LABEL as g, DATA_DELAY_NOTE as h, Route$2 as i, getResearchPdf as j, getDisclosureDetail as k, SheetHeader as l, PriceValue as m, Route as n, Sheet as o, PriceChange as p, usePriceColors as q, Route$1 as r, SheetContent as s, router_exports as t, SheetTitle as u, useChartData as v, useQuoteMap as w, useEtfMarket as x, useEtfBundle as y, formatPct as z };
