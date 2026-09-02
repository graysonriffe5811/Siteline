import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Crosshair, i as List, n as Radio, o as Compass, r as Map$1, s as Aperture } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { A as Sprite, C as PlaneGeometry, D as SRGBColorSpace, E as RepeatWrapping, M as TextureLoader, N as Vector2, O as Scene, P as Vector3, S as PerspectiveCamera, T as Raycaster, _ as Matrix4, a as CircleGeometry, b as MeshLambertMaterial, c as ConeGeometry, d as Fog, f as Group, g as LineBasicMaterial, h as Line, i as CanvasTexture, j as SpriteMaterial, k as SphereGeometry, l as CylinderGeometry, m as InstancedMesh, n as BoxGeometry, o as ClampToEdgeWrapping, p as HemisphereLight, r as BufferGeometry, s as Color, t as WebGLRenderer, u as DirectionalLight, v as Mesh, w as Quaternion, x as MeshPhongMaterial, y as MeshBasicMaterial } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ca8t1Mct.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-opacity duration-150 select-none disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			ghost: "bg-raised text-fg hover:bg-line",
			outline: "border border-border bg-transparent text-fg hover:bg-raised",
			readout: "bg-raised text-readout font-mono",
			danger: "bg-hazard text-bg hover:opacity-90",
			subtle: "text-muted hover:text-fg hover:bg-raised"
		},
		size: {
			sm: "h-9 rounded-sm px-3 text-sm",
			md: "h-11 rounded-md px-4 text-sm",
			lg: "h-12 rounded-md px-5 text-base",
			xl: "h-14 rounded-lg px-6 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = (0, import_react.forwardRef)(function Button({ className, variant, size, type = "button", ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
});
var Input = (0, import_react.forwardRef)(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		className: cn("h-11 w-full rounded-md border border-border bg-bg px-3 text-base text-fg placeholder:text-subtle", "font-mono tabular-nums", "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-readout", className),
		...props
	});
});
function Field({ label, children, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-w-0 flex-col gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium tracking-[0.14em] text-muted uppercase",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-subtle",
				children: hint
			}) : null
		]
	});
}
var DEG = Math.PI / 180;
var RAD = 180 / Math.PI;
function normalizeDeg(deg) {
	let x = deg % 360;
	if (x < 0) x += 360;
	return x;
}
function clampZenith(deg) {
	if (!Number.isFinite(deg)) return 90;
	return Math.min(179.999, Math.max(.001, deg));
}
function pad2(n, decimals = 0) {
	const [whole, frac] = (decimals > 0 ? n.toFixed(decimals) : String(Math.round(n))).split(".");
	const body = whole.padStart(2, "0");
	return frac != null ? `${body}.${frac}` : body;
}
/** Format a decimal-degree angle as DDD°MM'SS" (seconds to `secDecimals`). */
function formatDms(deg, secDecimals = 0) {
	if (!Number.isFinite(deg)) return "—";
	const wrapped = normalizeDeg(deg);
	const factor = 10 ** secDecimals;
	let totalSeconds = Math.round(wrapped * 3600 * factor) / factor;
	if (totalSeconds >= 1296e3) totalSeconds = 0;
	let d = Math.floor(totalSeconds / 3600);
	let rem = totalSeconds - d * 3600;
	let m = Math.floor(rem / 60);
	let s = rem - m * 60;
	if (s >= 60 - 1e-9) {
		s = 0;
		m += 1;
	}
	if (m >= 60) {
		m = 0;
		d += 1;
	}
	if (d >= 360) d = 0;
	return `${d}°${pad2(m)}'${pad2(s, secDecimals)}"`;
}
/** Parse 45.21052, 45 12 38, or 45°12'38" into decimal degrees. */
function parseAngle(input) {
	const raw = input.trim();
	if (!raw) return null;
	const parts = raw.replace(/[°º]/g, " ").replace(/[′']/g, " ").replace(/[″"]/g, " ").replace(/,/g, " ").split(/\s+/).filter(Boolean);
	if (parts.length === 1) {
		const n = Number(parts[0]);
		return Number.isFinite(n) ? n : null;
	}
	if (parts.length >= 2) {
		const d = Number(parts[0]);
		const m = Number(parts[1]);
		const s = parts.length >= 3 ? Number(parts[2]) : 0;
		if (![
			d,
			m,
			s
		].every(Number.isFinite)) return null;
		return (d < 0 || raw.trim().startsWith("-") ? -1 : 1) * (Math.abs(d) + Math.abs(m) / 60 + Math.abs(s) / 3600);
	}
	return null;
}
function toBearing(azDeg) {
	const a = normalizeDeg(azDeg);
	const close = (x) => Math.abs(a - x) < 1 / 3600;
	if (close(0) || close(360)) return "Due N";
	if (close(90)) return "Due E";
	if (close(180)) return "Due S";
	if (close(270)) return "Due W";
	if (a < 90) return `N ${formatDms(a)} E`;
	if (a < 180) return `S ${formatDms(180 - a)} E`;
	if (a < 270) return `S ${formatDms(a - 180)} W`;
	return `N ${formatDms(360 - a)} W`;
}
/** Survey azimuth: north = 0, east = 90, clockwise. */
function azimuthFromDeltas(dN, dE) {
	return normalizeDeg(Math.atan2(dE, dN) * RAD);
}
function zenithFromDeltas(hd, dZ) {
	return normalizeDeg(Math.atan2(hd, dZ) * RAD);
}
function doe() {
	return DeviceOrientationEvent;
}
async function requestOrientationPermission() {
	if (typeof window === "undefined") return false;
	const ctor = doe();
	if (typeof ctor.requestPermission === "function") try {
		return await ctor.requestPermission() === "granted";
	} catch {
		return false;
	}
	return true;
}
function portrait() {
	if (typeof window === "undefined") return true;
	if ((window.screen?.orientation?.type ?? "").includes("landscape")) return false;
	return window.innerHeight >= window.innerWidth;
}
/**
* Back-camera zenith angle (0 = zenith, 90 = horizon) from W3C deviceorientation.
* Portrait: ZA ≈ 180 − beta. Landscape uses gamma as the camera pitch proxy.
*/
function readingFromEvent(ev) {
	const beta = ev.beta ?? 90;
	const gamma = ev.gamma ?? 0;
	const ios = ev;
	const magAz = typeof ios.webkitCompassHeading === "number" && Number.isFinite(ios.webkitCompassHeading) ? ios.webkitCompassHeading : typeof ev.alpha === "number" ? (360 - ev.alpha) % 360 : null;
	const isPortrait = portrait();
	let za;
	let roll;
	if (isPortrait) {
		za = 180 - beta;
		roll = gamma;
	} else {
		za = 90 - gamma;
		roll = beta - 90;
	}
	za = Math.min(179.9, Math.max(.1, za));
	const compassAccuracy = typeof ios.webkitCompassAccuracy === "number" ? ios.webkitCompassAccuracy : null;
	return {
		magAz,
		za,
		roll,
		compassAccuracy
	};
}
var INITIAL = {
	ha: 90,
	za: 90,
	magAz: null,
	roll: 0,
	source: "manual",
	compassAccuracy: null,
	sensorsOn: false,
	held: false,
	holdHa: null,
	holdZa: null,
	permission: "idle"
};
function useInstrument() {
	const [state, setState] = (0, import_react.useState)(INITIAL);
	const live = (0, import_react.useRef)({
		ha: 90,
		za: 90,
		magAz: null,
		roll: 0
	});
	const heldRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!state.sensorsOn) return;
		const onOrient = (ev) => {
			const sample = readingFromEvent(ev);
			const ha = sample.magAz ?? live.current.ha;
			live.current = {
				ha,
				za: sample.za,
				magAz: sample.magAz,
				roll: sample.roll
			};
			if (heldRef.current) return;
			setState((s) => ({
				...s,
				ha,
				za: sample.za,
				magAz: sample.magAz,
				roll: sample.roll,
				source: "sensors",
				compassAccuracy: sample.compassAccuracy
			}));
		};
		window.addEventListener("deviceorientation", onOrient, true);
		return () => window.removeEventListener("deviceorientation", onOrient, true);
	}, [state.sensorsOn]);
	const enableSensors = (0, import_react.useCallback)(async () => {
		const ok = await requestOrientationPermission();
		setState((s) => ({
			...s,
			permission: ok ? "granted" : "denied",
			sensorsOn: ok,
			source: ok ? "sensors" : "manual"
		}));
		return ok;
	}, []);
	const addDelta = (0, import_react.useCallback)((dHa, dZa) => {
		setState((s) => {
			if (s.held) return s;
			const ha = normalizeDeg(s.ha + dHa);
			const za = clampZenith(s.za + dZa);
			live.current.ha = ha;
			live.current.za = za;
			return {
				...s,
				ha,
				za,
				source: "manual",
				sensorsOn: false
			};
		});
	}, []);
	const setManual = (0, import_react.useCallback)((patch) => {
		setState((s) => {
			const ha = patch.ha != null ? normalizeDeg(patch.ha) : s.ha;
			const za = patch.za != null ? clampZenith(patch.za) : s.za;
			live.current.ha = ha;
			live.current.za = za;
			return {
				...s,
				ha,
				za,
				source: "manual",
				sensorsOn: false
			};
		});
	}, []);
	const nudge = (0, import_react.useCallback)((axis, delta) => {
		setState((s) => {
			if (axis === "ha") {
				const ha = normalizeDeg(s.ha + delta);
				live.current.ha = ha;
				return {
					...s,
					ha,
					source: "manual"
				};
			}
			const za = clampZenith(s.za + delta);
			live.current.za = za;
			return {
				...s,
				za,
				source: "manual"
			};
		});
	}, []);
	const hold = (0, import_react.useCallback)((on) => {
		setState((s) => {
			const next = on ?? !s.held;
			heldRef.current = next;
			return {
				...s,
				held: next,
				holdHa: next ? s.ha : null,
				holdZa: next ? s.za : null
			};
		});
	}, []);
	const reading = () => {
		if (state.held && state.holdHa != null && state.holdZa != null) return {
			ha: state.holdHa,
			za: state.holdZa,
			magAz: state.magAz,
			roll: state.roll
		};
		return {
			ha: state.ha,
			za: state.za,
			magAz: state.magAz,
			roll: state.roll
		};
	};
	return {
		...state,
		enableSensors,
		setManual,
		addDelta,
		nudge,
		hold,
		reading
	};
}
function useCamera() {
	const videoRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const [status, setStatus] = (0, import_react.useState)("off");
	const start = (0, import_react.useCallback)(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: { ideal: "environment" },
					width: { ideal: 1280 },
					height: { ideal: 720 }
				},
				audio: false
			});
			streamRef.current = stream;
			const video = videoRef.current;
			if (video) {
				video.srcObject = stream;
				await video.play().catch(() => void 0);
			}
			setStatus("on");
			return true;
		} catch {
			setStatus("denied");
			return false;
		}
	}, []);
	const stop = (0, import_react.useCallback)(() => {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		if (videoRef.current) videoRef.current.srcObject = null;
		setStatus("off");
	}, []);
	(0, import_react.useEffect)(() => () => stop(), [stop]);
	return {
		videoRef,
		status,
		start,
		stop
	};
}
function useGps() {
	const [fix, setFix] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("off");
	const watchRef = (0, import_react.useRef)(null);
	const start = (0, import_react.useCallback)(() => {
		if (!navigator.geolocation) {
			setStatus("denied");
			return;
		}
		watchRef.current = navigator.geolocation.watchPosition((pos) => {
			setFix({
				lat: pos.coords.latitude,
				lon: pos.coords.longitude,
				alt: pos.coords.altitude,
				accuracy: pos.coords.accuracy,
				heading: pos.coords.heading,
				stamp: pos.timestamp
			});
			setStatus("on");
		}, () => setStatus("denied"), {
			enableHighAccuracy: true,
			maximumAge: 1e3,
			timeout: 15e3
		});
	}, []);
	const stop = (0, import_react.useCallback)(() => {
		if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
		watchRef.current = null;
		setStatus("off");
	}, []);
	(0, import_react.useEffect)(() => () => stop(), [stop]);
	return {
		fix,
		status,
		start,
		stop
	};
}
/** True telescope field. Typical 30× total station is 1°30′. */
var SCOPE_HFOV = 1.5;
/** Half-angle of stadia hairs for k = 100 (staff intercept × 100 ≈ HD). */
var STADIA_HALF_DEG = 1 / 200 * (180 / Math.PI);
function clampHfov(h) {
	return Math.min(16, Math.max(SCOPE_HFOV, h));
}
/** PerspectiveCamera.fov is vertical; convert from a locked horizontal FOV. */
function verticalFovDeg(hFovDeg, aspect) {
	const h = hFovDeg * Math.PI / 180;
	return 2 * Math.atan(Math.tan(h / 2) / Math.max(aspect, .2)) * 180 / Math.PI;
}
function magLabel(hFovDeg) {
	if (hFovDeg <= 1.65) return "30×";
	if (hFovDeg >= 15.8) return "FIND";
	return `${(16 / hFovDeg).toFixed(0)}×`;
}
/** Meters per unit. US survey foot is 1200/3937 m. */
var METERS_PER = {
	m: 1,
	ift: .3048,
	usft: 1200 / 3937
};
var UNIT_LABEL = {
	m: "m",
	ift: "ft",
	usft: "sft"
};
var UNIT_NAME = {
	m: "Meters",
	ift: "International feet",
	usft: "US survey feet"
};
function toMeters(value, units) {
	return value * METERS_PER[units];
}
function fromMeters(meters, units) {
	return meters / METERS_PER[units];
}
function convert(value, from, to) {
	if (from === to) return value;
	return fromMeters(toMeters(value, from), to);
}
function formatCoord(value, units) {
	if (!Number.isFinite(value)) return "—";
	const d = units === "m" ? 3 : 4;
	return value.toFixed(d);
}
function inverse(from, to) {
	const dN = to.n - from.n;
	const dE = to.e - from.e;
	const dZ = to.z - from.z;
	const hd = Math.hypot(dN, dE);
	const sd = Math.hypot(hd, dZ);
	const az = azimuthFromDeltas(dN, dE);
	const za = zenithFromDeltas(hd, dZ);
	return {
		n: to.n,
		e: to.e,
		z: to.z,
		dN,
		dE,
		dZ,
		hd,
		sd,
		az,
		za
	};
}
function radiation(args) {
	const za = clampZenith(args.za);
	const sinZ = Math.sin(za * DEG);
	const cosZ = Math.cos(za * DEG);
	let sd;
	let hd;
	if (args.distIsHd) {
		hd = args.distance;
		sd = sinZ === 0 ? args.distance : args.distance / sinZ;
	} else {
		sd = args.distance;
		hd = sd * sinZ;
	}
	const vd = sd * cosZ;
	const az = normalizeDeg(args.az) * DEG;
	return {
		nez: {
			n: args.station.n + hd * Math.cos(az),
			e: args.station.e + hd * Math.sin(az),
			z: args.station.z + args.hi + vd - args.ht
		},
		hd,
		sd,
		vd
	};
}
function depressionHd(hi, za) {
	const zenith = clampZenith(za);
	if (zenith <= 90 + 1e-6 || hi <= 0) return null;
	const vaDown = (zenith - 90) * DEG;
	const hd = hi / Math.tan(vaDown);
	return Number.isFinite(hd) && hd > 0 ? hd : null;
}
function liveAzimuth(station, ha, magAz, declination) {
	if (!station) {
		if (magAz != null) return normalizeDeg(magAz + declination);
		return normalizeDeg(ha);
	}
	if (station.orientationMode === "compass") return normalizeDeg((magAz ?? ha) + declination);
	return normalizeDeg(station.azAtZero + ha);
}
function buildObservation(args) {
	return {
		stationName: args.stationName,
		ha: args.ha,
		za: args.za,
		az: args.az,
		hd: args.hd,
		sd: args.sd,
		vd: args.vd,
		hi: args.hi,
		ht: args.ht,
		method: args.method,
		gpsAccuracyM: args.gpsAccuracyM
	};
}
/**
* Distance-distance intersection in the NE plane.
* `left` is the solution to the left of directed line A→B.
*/
function distanceDistance(a, b, rA, rB) {
	const dN = b.n - a.n;
	const dE = b.e - a.e;
	const d = Math.hypot(dN, dE);
	if (d < 1e-9) return null;
	if (d > rA + rB + 1e-9) return null;
	if (d < Math.abs(rA - rB) - 1e-9) return null;
	const aa = (rA * rA - rB * rB + d * d) / (2 * d);
	const h2 = rA * rA - aa * aa;
	const h = h2 <= 0 ? 0 : Math.sqrt(h2);
	const nHat = dN / d;
	const eHat = dE / d;
	const midN = a.n + aa * nHat;
	const midE = a.e + aa * eHat;
	return {
		left: {
			n: midN + h * eHat,
			e: midE - h * nHat,
			z: (a.z + b.z) / 2
		},
		right: {
			n: midN - h * eHat,
			e: midE + h * nHat,
			z: (a.z + b.z) / 2
		}
	};
}
function stationZFromSight(targetZ, hi, ht, vd) {
	return targetZ - hi - vd + ht;
}
function gpsDeltaMeters(lat, lon, originLat, originLon) {
	const mPerDegLat = 111320;
	const mPerDegLon = 111320 * Math.cos(originLat * DEG);
	return {
		dN: (lat - originLat) * mPerDegLat,
		dE: (lon - originLon) * mPerDegLon
	};
}
function gpsToLocal(lat, lon, origin, units) {
	const { dN, dE } = gpsDeltaMeters(lat, lon, origin.lat, origin.lon);
	return {
		n: origin.n + fromMeters(dN, units),
		e: origin.e + fromMeters(dE, units)
	};
}
function nextPointName(current) {
	const match = current.match(/^(.*?)(\d+)$/);
	if (!match) return current + "1";
	const [, prefix, digits] = match;
	return `${prefix}${String(Number(digits) + 1).padStart(digits.length, "0")}`;
}
function findPoint(points, id) {
	if (!id) return void 0;
	return points.find((p) => p.id === id);
}
function extents(points) {
	if (points.length === 0) return null;
	let minN = Infinity, maxN = -Infinity, minE = Infinity, maxE = -Infinity;
	for (const p of points) {
		if (p.n < minN) minN = p.n;
		if (p.n > maxN) maxN = p.n;
		if (p.e < minE) minE = p.e;
		if (p.e > maxE) maxE = p.e;
	}
	return {
		minN,
		maxN,
		minE,
		maxE
	};
}
var T0 = 1725e9;
function pt(id, name, n, e, z, code, desc, kind) {
	return {
		id,
		name,
		n,
		e,
		z,
		code,
		desc,
		kind,
		createdAt: T0
	};
}
/** A closed lot around station 100, US survey feet, already occupied and oriented. */
function createDemoJob() {
	const p100 = pt("pt-100", "100", 1e4, 5e3, 850, "CP", "Occupy — iron pin", "control");
	const p101 = pt("pt-101", "101", 10200, 5e3, 851.2, "CP", "Backsight — mag nail N", "control");
	const station = {
		pointId: p100.id,
		hi: 5.15,
		ht: 5,
		orientationMode: "circle",
		azAtZero: 0,
		backsightId: p101.id,
		bsHa: 0,
		setupAt: T0
	};
	const hi = station.hi;
	const ht = station.ht;
	const sta = {
		n: p100.n,
		e: p100.e,
		z: p100.z
	};
	return {
		id: "job-demo",
		name: "Demo — Lot 12",
		units: "usft",
		declination: 0,
		gpsOrigin: null,
		points: [
			p100,
			p101,
			...[
				{
					id: "pt-201",
					name: "201",
					n: 1e4,
					e: 5350,
					z: 849.42,
					code: "PIN",
					desc: "NE lot corner"
				},
				{
					id: "pt-202",
					name: "202",
					n: 9760,
					e: 5350,
					z: 848.9,
					code: "PIN",
					desc: "SE lot corner"
				},
				{
					id: "pt-203",
					name: "203",
					n: 9760,
					e: 5e3,
					z: 849.15,
					code: "TP",
					desc: "S property line"
				},
				{
					id: "pt-204",
					name: "204",
					n: 9760,
					e: 4620,
					z: 850.35,
					code: "PIN",
					desc: "SW lot corner"
				},
				{
					id: "pt-205",
					name: "205",
					n: 1e4,
					e: 4620,
					z: 850.88,
					code: "PIN",
					desc: "NW lot corner"
				},
				{
					id: "pt-206",
					name: "206",
					n: 9880,
					e: 5180,
					z: 849.2,
					code: "FH",
					desc: "Fire hydrant"
				},
				{
					id: "pt-207",
					name: "207",
					n: 9925,
					e: 4888,
					z: 850.05,
					code: "POLE",
					desc: "Power pole"
				}
			].map((r) => {
				const inv = inverse(sta, r);
				const shot = radiation({
					station: sta,
					hi,
					ht,
					az: inv.az,
					za: inv.za,
					distance: inv.sd,
					distIsHd: false
				});
				const hd = inv.hd;
				const sd = inv.sd;
				const vd = inv.sd * Math.cos(inv.za * Math.PI / 180);
				return {
					id: r.id,
					name: r.name,
					n: shot.nez.n,
					e: shot.nez.e,
					z: r.z,
					code: r.code,
					desc: r.desc,
					kind: "topo",
					createdAt: T0,
					obs: {
						stationName: "100",
						ha: inv.az,
						za: inv.za,
						az: inv.az,
						hd,
						sd,
						vd,
						hi,
						ht,
						method: "edm"
					}
				};
			})
		],
		station,
		nextName: "208",
		createdAt: T0
	};
}
function createBlankJob(name) {
	return {
		id: `job-${Math.random().toString(36).slice(2, 8)}`,
		name: name.trim() || "Untitled job",
		units: "usft",
		declination: 0,
		gpsOrigin: null,
		points: [],
		station: null,
		nextName: "1",
		createdAt: Date.now()
	};
}
function patchJob(jobs, id, fn) {
	if (!id) return jobs;
	return jobs.map((j) => j.id === id ? fn(j) : j);
}
var demoJob = createDemoJob();
var useSurvey = create()(persist((set, get) => ({
	jobs: [demoJob],
	currentJobId: demoJob.id,
	seeded: true,
	hydrated: true,
	setHydrated: () => {
		const s = get();
		if (!s.seeded && s.jobs.length === 0) {
			const demo = createDemoJob();
			set({
				jobs: [demo],
				currentJobId: demo.id,
				seeded: true,
				hydrated: true
			});
			return;
		}
		set({ hydrated: true });
	},
	currentJob: () => {
		const { jobs, currentJobId } = get();
		return jobs.find((j) => j.id === currentJobId) ?? null;
	},
	createJob: (name) => {
		const job = createBlankJob(name);
		set((s) => ({
			jobs: [job, ...s.jobs],
			currentJobId: job.id
		}));
		return job.id;
	},
	deleteJob: (id) => {
		set((s) => {
			const jobs = s.jobs.filter((j) => j.id !== id);
			return {
				jobs,
				currentJobId: s.currentJobId === id ? jobs[0]?.id ?? null : s.currentJobId
			};
		});
	},
	renameJob: (id, name) => {
		set((s) => ({ jobs: patchJob(s.jobs, id, (j) => ({
			...j,
			name: name.trim() || j.name
		})) }));
	},
	selectJob: (id) => set({ currentJobId: id }),
	setUnits: (units) => {
		const job = get().currentJob();
		if (!job || job.units === units) return;
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			units,
			points: j.points.map((p) => ({
				...p,
				n: convert(p.n, j.units, units),
				e: convert(p.e, j.units, units),
				z: convert(p.z, j.units, units),
				obs: p.obs ? {
					...p.obs,
					sd: convert(p.obs.sd, j.units, units),
					hd: convert(p.obs.hd, j.units, units),
					vd: convert(p.obs.vd, j.units, units),
					hi: convert(p.obs.hi, j.units, units),
					ht: convert(p.obs.ht, j.units, units)
				} : p.obs
			})),
			station: j.station ? {
				...j.station,
				hi: convert(j.station.hi, j.units, units),
				ht: convert(j.station.ht, j.units, units)
			} : j.station
		})) }));
	},
	setDeclination: (deg) => {
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			declination: deg
		})) }));
	},
	setNextName: (name) => {
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			nextName: name
		})) }));
	},
	addPoint: (partial) => {
		const point = {
			id: partial.id ?? uid("pt"),
			createdAt: Date.now(),
			name: partial.name,
			n: partial.n,
			e: partial.e,
			z: partial.z,
			code: partial.code,
			desc: partial.desc,
			kind: partial.kind,
			obs: partial.obs
		};
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			points: [...j.points, point],
			nextName: nextPointName(point.name)
		})) }));
		return point;
	},
	updatePoint: (id, patch) => {
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			points: j.points.map((p) => p.id === id ? {
				...p,
				...patch
			} : p)
		})) }));
	},
	deletePoint: (id) => {
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			points: j.points.filter((p) => p.id !== id),
			station: j.station?.pointId === id ? null : j.station
		})) }));
	},
	occupy: ({ pointId, hi, ht, mode, azAtZero, backsightId, bsHa }) => {
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			station: {
				pointId,
				hi,
				ht,
				orientationMode: mode,
				azAtZero,
				backsightId,
				bsHa,
				setupAt: Date.now()
			}
		})) }));
	},
	clearStation: () => {
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			station: null
		})) }));
	},
	storeShot: ({ name, code, desc, ha, za, magAz, distance, mode, ht, gps }) => {
		const job = get().currentJob();
		if (!job) return { error: "No job open." };
		let shotName = name.trim() || job.nextName;
		while (job.points.some((p) => p.name.trim().toLowerCase() === shotName.toLowerCase())) shotName = nextPointName(shotName);
		const stationPt = job.station ? findPoint(job.points, job.station.pointId) : void 0;
		if (mode === "gps") {
			if (!gps) return { error: "No GPS fix." };
			let origin = job.gpsOrigin;
			if (!origin && stationPt) return { error: "Set GPS origin at the station first (Station → GPS lock)." };
			if (!origin) {
				origin = {
					lat: gps.lat,
					lon: gps.lon,
					n: 1e4,
					e: 5e3
				};
				set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
					...j,
					gpsOrigin: origin
				})) }));
			}
			const liveOrigin = get().currentJob()?.gpsOrigin ?? origin;
			if (!liveOrigin) return { error: "No GPS origin." };
			const local = gpsToLocal(gps.lat, gps.lon, liveOrigin, job.units);
			let elev = stationPt?.z ?? 0;
			let hd = 0;
			let sd = 0;
			let vd = 0;
			let az = 0;
			if (stationPt && job.station) {
				const inv = inverse(stationPt, {
					n: local.n,
					e: local.e,
					z: stationPt.z
				});
				hd = inv.hd;
				az = inv.az;
				const shot = radiation({
					station: stationPt,
					hi: job.station.hi,
					ht: job.station.ht,
					az,
					za,
					distance: hd,
					distIsHd: true
				});
				elev = shot.nez.z;
				sd = shot.sd;
				vd = shot.vd;
			} else {
				az = liveAzimuth(null, ha, magAz, job.declination);
				elev = 0;
			}
			return get().addPoint({
				name: shotName,
				n: local.n,
				e: local.e,
				z: elev,
				code,
				desc,
				kind: "topo",
				obs: stationPt ? buildObservation({
					stationName: stationPt.name,
					ha,
					za,
					az,
					hd,
					sd,
					vd,
					hi: job.station?.hi ?? 0,
					ht: job.station?.ht ?? 0,
					method: "gps",
					gpsAccuracyM: gps.accuracy
				}) : void 0
			});
		}
		if (!job.station || !stationPt) return { error: "Occupy a station first." };
		const az = liveAzimuth(job.station, ha, magAz, job.declination);
		let dist = distance;
		let distIsHd = mode === "hd" || mode === "ground";
		if (mode === "ground") {
			const hd = depressionHd(job.station.hi, za);
			if (hd == null) return { error: "Aim below horizon and set HI to use ground ranging." };
			dist = hd;
			distIsHd = true;
		}
		if (mode !== "ground" && !(dist > 0)) return { error: "Enter a distance greater than zero." };
		const rod = ht ?? job.station.ht;
		const shot = radiation({
			station: stationPt,
			hi: job.station.hi,
			ht: rod,
			az,
			za,
			distance: dist,
			distIsHd
		});
		return get().addPoint({
			name: shotName,
			n: shot.nez.n,
			e: shot.nez.e,
			z: shot.nez.z,
			code,
			desc,
			kind: "topo",
			obs: buildObservation({
				stationName: stationPt.name,
				ha,
				za,
				az,
				hd: shot.hd,
				sd: shot.sd,
				vd: shot.vd,
				hi: job.station.hi,
				ht: rod,
				method: mode
			})
		});
	},
	keyInPoint: ({ name, n, e, z, code, desc, kind }) => {
		const job = get().currentJob();
		if (!job) return { error: "No job open." };
		if (job.points.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())) return { error: `Point ${name.trim()} already exists.` };
		return get().addPoint({
			name: name.trim(),
			n,
			e,
			z,
			code,
			desc,
			kind
		});
	},
	resect: ({ aId, bId, hdA, hdB, zaA, zaB, sdA, sdB, side, hi, ht, name }) => {
		const job = get().currentJob();
		if (!job) return { error: "No job open." };
		const a = findPoint(job.points, aId);
		const b = findPoint(job.points, bId);
		if (!a || !b) return { error: "Pick two known points." };
		if (a.id === b.id) return { error: "Known points must be different." };
		const ix = distanceDistance(a, b, hdA, hdB);
		if (!ix) return { error: "No intersection — check the two distances." };
		const pick = side === "left" ? ix.left : ix.right;
		const vdA = sdA * Math.cos(zaA * Math.PI / 180);
		const vdB = sdB * Math.cos(zaB * Math.PI / 180);
		const z = (stationZFromSight(a.z, hi, ht, vdA) + stationZFromSight(b.z, hi, ht, vdB)) / 2;
		const nez = {
			n: pick.n,
			e: pick.e,
			z
		};
		if (job.points.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())) return { error: `Point ${name.trim()} already exists.` };
		const point = get().addPoint({
			name: name.trim(),
			n: nez.n,
			e: nez.e,
			z: nez.z,
			code: "STA",
			desc: `Resection from ${a.name} & ${b.name}`,
			kind: "calc"
		});
		const invB = inverse(nez, b);
		get().occupy({
			pointId: point.id,
			hi,
			ht,
			mode: "circle",
			azAtZero: invB.az,
			backsightId: b.id,
			bsHa: 0
		});
		return point;
	},
	setGpsOrigin: (lat, lon) => {
		const job = get().currentJob();
		const sta = job?.station ? findPoint(job.points, job.station.pointId) : void 0;
		const n = sta?.n ?? 1e4;
		const e = sta?.e ?? 5e3;
		set((s) => ({ jobs: patchJob(s.jobs, s.currentJobId, (j) => ({
			...j,
			gpsOrigin: {
				lat,
				lon,
				n,
				e
			}
		})) }));
	}
}), {
	name: "sightline-ts",
	skipHydration: true,
	partialize: (s) => ({
		jobs: s.jobs,
		currentJobId: s.currentJobId,
		seeded: s.seeded
	})
}));
function useJob() {
	return useSurvey((s) => s.jobs.find((j) => j.id === s.currentJobId) ?? null);
}
var FIELD_CODES = [
	"CP",
	"TP",
	"BM",
	"IP",
	"FS",
	"BS",
	"STA",
	"EOP",
	"CL",
	"TOE",
	"TOP",
	"FL",
	"FH",
	"INV",
	"GRATE",
	"POLE",
	"FENCE",
	"TREE",
	"WALK",
	"BLDG",
	"COR",
	"PIN",
	"MON"
];
function Gm50Panel({ v, hr, sd, hd, distMode, prism, held, measuring, units, levelOk, hit, onMeas, onToggleDist, onZero, onHold, onBs, onEnter, enterDisabled }) {
	const u = UNIT_LABEL[units];
	const shown = distMode === "hd" ? hd : sd;
	const tag = distMode === "hd" ? "HD" : "SD";
	const star = measuring || shown != null && !held ? "*" : " ";
	const mode = prism ? "P" : "NP";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-[#1a1c1b] bg-[#141618] px-2 pt-1.5 pb-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[2px] border-2 border-[#3a3d38] px-3 py-1.5 font-mono",
				style: {
					background: "linear-gradient(#2c332c, #232824)",
					boxShadow: "inset 0 0 0 1px #4a5248, inset 0 8px 18px rgba(0,0,0,0.35)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcdLine, {
						k: "V",
						v: formatDms(v, 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LcdLine, {
						k: "HR",
						v: formatDms(hr, 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between text-[15px] leading-tight text-[#d7e6d4]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							tag,
							star,
							" ",
							shown != null && shown > 0 ? shown.toFixed(3) : "———.---",
							" ",
							u
						] }), !levelOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-[#d07a6a]",
							children: "TILT"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center justify-between text-[11px] tracking-wide text-[#a8b8a6]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["MEAS MODE ", mode] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							prism ? "P↓" : "NP",
							hit ? `  ${hit.label}` : "",
							held ? "  HOLD" : ""
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 grid grid-cols-4 gap-1 text-center text-[10px] tracking-wide text-[#c4d4c2]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "MEAS" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HD/SD" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0SET" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HOLD" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-4 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftKey, {
						label: "F1",
						onClick: onMeas
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftKey, {
						label: "F2",
						onClick: onToggleDist
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftKey, {
						label: "F3",
						onClick: onZero
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftKey, {
						label: "F4",
						onClick: onHold,
						active: held
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 grid grid-cols-4 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardKey, { label: "ESC" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardKey, {
						label: "B.S.",
						accent: "yellow",
						onClick: onBs
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardKey, { label: "FUNC" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardKey, {
						label: "STORE",
						accent: "cyan",
						onClick: onEnter,
						disabled: enterDisabled
					})
				]
			})
		]
	});
}
function LcdLine({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex items-baseline gap-2 text-[15px] leading-tight text-[#d7e6d4] tabular-nums",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-7 text-[#9aab98]",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ":" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: v })
		]
	});
}
function SoftKey({ label, onClick, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-8 rounded-sm border text-[11px] font-semibold tracking-wide outline-none select-none", "[-webkit-tap-highlight-color:transparent]", active ? "border-[#8a6a18] bg-[#f0c040] text-[#2a2208]" : "border-[#6a5a18] bg-[#d4a428] text-[#2a2208]"),
		children: label
	});
}
function HardKey({ label, onClick, accent, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled,
		onClick,
		className: cn("h-9 rounded-sm border text-[11px] font-semibold tracking-wide outline-none select-none disabled:opacity-40", "[-webkit-tap-highlight-color:transparent]", accent === "cyan" ? "border-[#1a7a88] bg-[#2eb8d4] text-[#062026]" : accent === "yellow" ? "border-[#6a5a18] bg-[#d4a428] text-[#2a2208]" : "border-[#3a3e3c] bg-[#2a2e2c] text-[#d0d4d0]"),
		children: label
	});
}
function JobsSheet({ onClose }) {
	const jobs = useSurvey((s) => s.jobs);
	const current = useSurvey((s) => s.currentJobId);
	const selectJob = useSurvey((s) => s.selectJob);
	const createJob = useSurvey((s) => s.createJob);
	const deleteJob = useSurvey((s) => s.deleteJob);
	const renameJob = useSurvey((s) => s.renameJob);
	const [name, setName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-muted uppercase",
					children: "Field book"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Jobs"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onClose,
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: jobs.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 border-b border-border px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-w-0 flex-1 text-left",
							onClick: () => {
								selectJob(j.id);
								onClose();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-medium",
								children: j.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									j.points.length,
									" pts · ",
									UNIT_NAME[j.units],
									current === j.id ? " · open" : ""
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "subtle",
							size: "sm",
							onClick: () => {
								const next = window.prompt("Rename job", j.name);
								if (next) renameJob(j.id, next);
							},
							children: "Rename"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "subtle",
							size: "sm",
							onClick: () => deleteJob(j.id),
							children: "Delete"
						})
					]
				}, j.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2 border-t border-border p-4",
				onSubmit: (e) => {
					e.preventDefault();
					createJob(name.trim() || "New job");
					setName("");
					onClose();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "New job name",
					value: name,
					onChange: (e) => setName(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Create"
				})]
			})
		]
	});
}
function NumPad({ label, value, onChange, onCommit, angle }) {
	const [err, setErr] = (0, import_react.useState)(null);
	function key(k) {
		setErr(null);
		if (k === "⌫") {
			onChange(value.slice(0, -1));
			return;
		}
		if (k === "C") {
			onChange("");
			return;
		}
		if (k === "±") {
			if (value.startsWith("-")) onChange(value.slice(1));
			else onChange("-" + value);
			return;
		}
		onChange(value + k);
	}
	function commit() {
		const n = angle ? parseAngle(value) : Number(value.replace(/,/g, ""));
		if (n == null || !Number.isFinite(n)) {
			setErr("Not a number");
			return;
		}
		onCommit(n);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-[0.14em] text-muted uppercase",
					children: label
				}), err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-hazard",
					children: err
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border border-border bg-bg px-3 py-3 font-mono text-2xl text-readout tabular-nums",
				children: value || "0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-2",
				children: [
					"7",
					"8",
					"9",
					"⌫",
					"4",
					"5",
					"6",
					"C",
					"1",
					"2",
					"3",
					"±",
					"0",
					".",
					angle ? "°" : "00",
					"OK"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: k === "OK" ? "primary" : "ghost",
					size: "lg",
					className: cn("h-12 font-mono text-lg", k === "OK" && "col-span-1"),
					onClick: () => {
						if (k === "OK") commit();
						else if (k === "°") onChange(value + " ");
						else key(k);
					},
					children: k === "00" ? "00" : k
				}, k))
			})
		]
	});
}
var LOT_ORDER = [
	"205",
	"201",
	"202",
	"204"
];
function PlanMap({ job, selectedId, onSelect, preview }) {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const [view, setView] = (0, import_react.useState)(null);
	const [pair, setPair] = (0, import_react.useState)(null);
	const drag = (0, import_react.useRef)(null);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pinch = (0, import_react.useRef)(null);
	const stationPt = job.station ? findPoint(job.points, job.station.pointId) : void 0;
	const selected = findPoint(job.points, selectedId);
	const bsPt = job.station?.backsightId ? findPoint(job.points, job.station.backsightId) : void 0;
	const invSel = (0, import_react.useMemo)(() => {
		if (!stationPt || !selected || selected.id === stationPt.id) return null;
		return inverse(stationPt, selected);
	}, [stationPt, selected]);
	const pairInv = (0, import_react.useMemo)(() => {
		if (!pair) return null;
		const a = findPoint(job.points, pair[0]);
		const b = findPoint(job.points, pair[1]);
		if (!a || !b) return null;
		return {
			a,
			b,
			inv: inverse(a, b)
		};
	}, [pair, job.points]);
	function fit() {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const box = extents(job.points);
		const w = wrap.clientWidth;
		const h = wrap.clientHeight;
		if (!box || w < 8 || h < 8) {
			setView({
				scale: 1,
				e0: 5e3,
				n0: 1e4
			});
			return;
		}
		const spanE = Math.max(20, box.maxE - box.minE);
		const spanN = Math.max(20, box.maxN - box.minN);
		const scale = Math.min((w - 112) / spanE, (h - 112) / spanN);
		const cx = (box.minE + box.maxE) / 2;
		const cy = (box.minN + box.maxN) / 2;
		setView({
			scale,
			e0: cx - w / 2 / scale,
			n0: cy + h / 2 / scale
		});
	}
	function zoomAt(factor) {
		if (!view) return;
		const wrap = wrapRef.current;
		if (!wrap) return;
		const w = wrap.clientWidth;
		const h = wrap.clientHeight;
		const newScale = Math.max(.002, Math.min(400, view.scale * factor));
		const eAt = view.e0 + w / 2 / view.scale;
		const nAt = view.n0 - h / 2 / view.scale;
		setView({
			scale: newScale,
			e0: eAt - w / 2 / newScale,
			n0: nAt + h / 2 / newScale
		});
	}
	(0, import_react.useEffect)(() => {
		fit();
	}, [job.id]);
	(0, import_react.useEffect)(() => {
		const wrap = wrapRef.current;
		if (!wrap || !view || !selected) return;
		const x = (selected.e - view.e0) * view.scale;
		const y = (view.n0 - selected.n) * view.scale;
		const w = wrap.clientWidth;
		const h = wrap.clientHeight;
		const m = 48;
		if (x >= m && y >= m && x <= w - m && y <= h - m) return;
		setView({
			...view,
			e0: selected.e - w / 2 / view.scale,
			n0: selected.n + h / 2 / view.scale
		});
	}, [selectedId]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap || !view) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const paint = () => {
			const dpr = window.devicePixelRatio || 1;
			const w = wrap.clientWidth;
			const h = wrap.clientHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.fillStyle = "#f4f5f2";
			ctx.fillRect(0, 0, w, h);
			const toX = (e) => (e - view.e0) * view.scale;
			const toY = (n) => (view.n0 - n) * view.scale;
			drawGrid(ctx, w, h, view, job.units === "m" ? 10 : 50);
			if (stationPt && bsPt) {
				ctx.strokeStyle = "#c45c1a";
				ctx.lineWidth = 1.5;
				ctx.setLineDash([7, 4]);
				ctx.beginPath();
				ctx.moveTo(toX(stationPt.e), toY(stationPt.n));
				ctx.lineTo(toX(bsPt.e), toY(bsPt.n));
				ctx.stroke();
				ctx.setLineDash([]);
			}
			if (stationPt) {
				ctx.strokeStyle = "rgba(80,90,88,0.28)";
				ctx.lineWidth = 1;
				for (const p of job.points) {
					if (!p.obs) continue;
					ctx.beginPath();
					ctx.moveTo(toX(stationPt.e), toY(stationPt.n));
					ctx.lineTo(toX(p.e), toY(p.n));
					ctx.stroke();
				}
			}
			const byName = new Map(job.points.map((p) => [p.name, p]));
			const lot = LOT_ORDER.map((n) => byName.get(n)).filter(Boolean);
			if (lot.length >= 3) {
				ctx.strokeStyle = "#1a1a1a";
				ctx.lineWidth = 1.6;
				ctx.beginPath();
				lot.forEach((p, i) => {
					const x = toX(p.e);
					const y = toY(p.n);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				});
				ctx.closePath();
				ctx.stroke();
			}
			drawBuilding(ctx, toX, toY, stationPt);
			if (pairInv) {
				ctx.strokeStyle = "#1565c0";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(toX(pairInv.a.e), toY(pairInv.a.n));
				ctx.lineTo(toX(pairInv.b.e), toY(pairInv.b.n));
				ctx.stroke();
			}
			for (const p of job.points) {
				const x = toX(p.e);
				const y = toY(p.n);
				const isSta = stationPt?.id === p.id;
				const isSel = selectedId === p.id;
				const isBs = bsPt?.id === p.id;
				drawSymbol(ctx, x, y, p, isSta, isBs, isSel);
				ctx.font = "600 11px 'Barlow', sans-serif";
				ctx.fillStyle = "#111";
				ctx.textAlign = "left";
				ctx.textBaseline = "bottom";
				ctx.fillText(p.name, x + 8, y - 3);
				ctx.font = "400 9px 'Barlow', sans-serif";
				ctx.fillStyle = "#4a4a4a";
				ctx.fillText(p.code, x + 8, y + 10);
			}
			if (preview && stationPt) {
				const px = toX(preview.e);
				const py = toY(preview.n);
				ctx.strokeStyle = "#c45c1a";
				ctx.setLineDash([4, 3]);
				ctx.lineWidth = 1.4;
				ctx.beginPath();
				ctx.moveTo(toX(stationPt.e), toY(stationPt.n));
				ctx.lineTo(px, py);
				ctx.stroke();
				ctx.setLineDash([]);
				ctx.fillStyle = "#ff8a00";
				ctx.strokeStyle = "#111";
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				ctx.moveTo(px, py - 8);
				ctx.lineTo(px + 8, py);
				ctx.lineTo(px, py + 8);
				ctx.lineTo(px - 8, py);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.font = "600 11px 'Barlow', sans-serif";
				ctx.fillStyle = "#c45c1a";
				ctx.textAlign = "left";
				ctx.textBaseline = "bottom";
				ctx.fillText(preview.label || "SHOT", px + 10, py - 4);
			}
			drawNorth(ctx, w - 28, 36);
			drawScale(ctx, w, h, view, job.units);
		};
		paint();
		const ro = new ResizeObserver(paint);
		ro.observe(wrap);
		return () => ro.disconnect();
	}, [
		view,
		job,
		selectedId,
		stationPt,
		bsPt,
		pairInv,
		preview
	]);
	function hit(clientX, clientY) {
		const wrap = wrapRef.current;
		if (!wrap || !view) return null;
		const r = wrap.getBoundingClientRect();
		const x = clientX - r.left;
		const y = clientY - r.top;
		let best = null;
		let bestD = 18;
		for (const p of job.points) {
			const px = (p.e - view.e0) * view.scale;
			const py = (view.n0 - p.n) * view.scale;
			const d = Math.hypot(px - x, py - y);
			if (d < bestD) {
				bestD = d;
				best = p;
			}
		}
		return best;
	}
	const u = UNIT_LABEL[job.units];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col bg-[#ececec] text-[#1a1a1a]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-b border-[#c8c8c8] bg-[#e8eaed] px-2 py-1.5 text-[11px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold tracking-wide text-[#333]",
						children: "MAP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[#666]",
						children: "Drag to pan · pinch to zoom"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto font-mono text-[#333]",
						children: job.station && stationPt ? `Occ ${stationPt.name}  HI ${job.station.hi.toFixed(2)}  HT ${job.station.ht.toFixed(2)}` : "No station"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				className: "relative min-h-0 flex-1 touch-none overflow-hidden bg-[#f4f5f2]",
				onPointerDown: (e) => {
					if (!view) return;
					pointers.current.set(e.pointerId, {
						x: e.clientX,
						y: e.clientY
					});
					e.currentTarget.setPointerCapture(e.pointerId);
					if (pointers.current.size === 2) {
						const [a, b] = [...pointers.current.values()];
						const wrap = wrapRef.current;
						if (!wrap) return;
						const r = wrap.getBoundingClientRect();
						const mx = (a.x + b.x) / 2 - r.left;
						const my = (a.y + b.y) / 2 - r.top;
						pinch.current = {
							dist: Math.hypot(b.x - a.x, b.y - a.y),
							scale: view.scale,
							eAt: view.e0 + mx / view.scale,
							nAt: view.n0 - my / view.scale
						};
						drag.current = null;
					} else drag.current = {
						x: e.clientX,
						y: e.clientY,
						e0: view.e0,
						n0: view.n0
					};
				},
				onPointerMove: (e) => {
					if (!view) return;
					if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, {
						x: e.clientX,
						y: e.clientY
					});
					if (pointers.current.size >= 2 && pinch.current) {
						const pts = [...pointers.current.values()];
						const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
						if (pinch.current.dist < 8) return;
						const wrap = wrapRef.current;
						if (!wrap) return;
						const r = wrap.getBoundingClientRect();
						const mx = (pts[0].x + pts[1].x) / 2 - r.left;
						const my = (pts[0].y + pts[1].y) / 2 - r.top;
						const newScale = Math.max(.002, Math.min(400, pinch.current.scale * (dist / pinch.current.dist)));
						setView({
							scale: newScale,
							e0: pinch.current.eAt - mx / newScale,
							n0: pinch.current.nAt + my / newScale
						});
						return;
					}
					if (!drag.current) return;
					const dx = e.clientX - drag.current.x;
					const dy = e.clientY - drag.current.y;
					setView({
						...view,
						e0: drag.current.e0 - dx / view.scale,
						n0: drag.current.n0 + dy / view.scale
					});
				},
				onPointerUp: (e) => {
					pointers.current.delete(e.pointerId);
					if (pointers.current.size < 2) pinch.current = null;
					const start = drag.current;
					drag.current = null;
					if (!start || pointers.current.size > 0) return;
					if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
					const p = hit(e.clientX, e.clientY);
					if (p) {
						if (selectedId && selectedId !== p.id && e.shiftKey) setPair([selectedId, p.id]);
						else onSelect(p.id);
					} else {
						onSelect(null);
						setPair(null);
					}
				},
				onPointerCancel: (e) => {
					pointers.current.delete(e.pointerId);
					pinch.current = null;
					drag.current = null;
				},
				onWheel: (e) => {
					if (!view) return;
					e.preventDefault();
					const wrap = wrapRef.current;
					if (!wrap) return;
					const r = wrap.getBoundingClientRect();
					const mx = e.clientX - r.left;
					const my = e.clientY - r.top;
					const factor = e.deltaY > 0 ? .9 : 1.1;
					const newScale = Math.max(.002, Math.min(400, view.scale * factor));
					const eAt = view.e0 + mx / view.scale;
					const nAt = view.n0 - my / view.scale;
					setView({
						scale: newScale,
						e0: eAt - mx / newScale,
						n0: nAt + my / newScale
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "absolute inset-0 size-full"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-2 left-2 flex flex-col overflow-hidden rounded-sm border border-[#c0c0c0] bg-white shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
							label: "+",
							onClick: () => zoomAt(1.25)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
							label: "−",
							onClick: () => zoomAt(.8)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolBtn, {
							label: "Fit",
							onClick: fit
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-[#c8c8c8] bg-white px-3 py-1.5 font-mono text-[11px] text-[#333] tabular-nums",
				children: pairInv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Inverse ",
					pairInv.a.name,
					"→",
					pairInv.b.name,
					": HD ",
					pairInv.inv.hd.toFixed(3),
					" ",
					u,
					" · AZ ",
					formatDms(pairInv.inv.az, 0),
					" ",
					toBearing(pairInv.inv.az),
					" · ΔZ ",
					pairInv.inv.dZ.toFixed(3)
				] }) : invSel && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					stationPt?.name,
					"→",
					selected.name,
					": HD ",
					invSel.hd.toFixed(3),
					" ",
					u,
					" · AZ ",
					formatDms(invSel.az, 0),
					" ",
					toBearing(invSel.az),
					" · N",
					" ",
					formatCoord(selected.n, job.units),
					" E ",
					formatCoord(selected.e, job.units)
				] }) : selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					selected.name,
					" · N ",
					formatCoord(selected.n, job.units),
					" · E ",
					formatCoord(selected.e, job.units),
					" · Z",
					" ",
					formatCoord(selected.z, job.units),
					" · ",
					selected.code
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Drag to pan · pinch (or +/−) to zoom · Fit shows the whole lot · tap a point for inverse" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-4 bg-[#2c2f36] text-center text-[11px] font-medium tracking-wide text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "py-2.5 hover:bg-[#3a3e46]",
						onClick: () => onSelect(null),
						children: "Esc"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "py-2.5 hover:bg-[#3a3e46]",
						onClick: () => zoomAt(1.25),
						children: "Zoom+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "py-2.5 hover:bg-[#3a3e46]",
						onClick: () => zoomAt(.8),
						children: "Zoom−"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "bg-[#1565c0] py-2.5 font-semibold",
						onClick: fit,
						children: "Fit"
					})
				]
			})
		]
	});
}
function ToolBtn({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "h-8 w-10 border-b border-[#e0e0e0] text-xs font-semibold text-[#222] last:border-b-0 hover:bg-[#fff8d0]",
		children: label
	});
}
function drawGrid(ctx, w, h, view, step) {
	const startE = Math.floor(view.e0 / step) * step;
	const startN = Math.floor((view.n0 - h / view.scale) / step) * step;
	const endE = view.e0 + w / view.scale;
	const endN = view.n0;
	const major = step * 4;
	for (let e = startE; e <= endE; e += step) {
		const x = (e - view.e0) * view.scale;
		ctx.strokeStyle = Math.abs(e % major) < .001 ? "#d0d2cc" : "#e6e7e2";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h);
		ctx.stroke();
	}
	for (let n = startN; n <= endN; n += step) {
		const y = (view.n0 - n) * view.scale;
		ctx.strokeStyle = Math.abs(n % major) < .001 ? "#d0d2cc" : "#e6e7e2";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
		ctx.stroke();
	}
}
function drawBuilding(ctx, toX, toY, stationPt) {
	if (!stationPt) return;
	const cn = stationPt.n - 145;
	const ce = stationPt.e + 200;
	const hw = 21;
	const hd = 14;
	const corners = [
		[cn + hd, ce - hw],
		[cn + hd, ce + hw],
		[cn - hd, ce + hw],
		[cn - hd, ce - hw]
	];
	ctx.fillStyle = "rgba(200,198,188,0.55)";
	ctx.strokeStyle = "#5a5854";
	ctx.lineWidth = 1.2;
	ctx.beginPath();
	corners.forEach(([n, e], i) => {
		const x = toX(e);
		const y = toY(n);
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	});
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}
function drawSymbol(ctx, x, y, p, isSta, isBs, isSel) {
	if (isSta) {
		ctx.strokeStyle = "#1a1a1a";
		ctx.fillStyle = "#ffcd00";
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.arc(x, y, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(x, y, 3.5, 0, Math.PI * 2);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x - 11, y);
		ctx.lineTo(x + 11, y);
		ctx.moveTo(x, y - 11);
		ctx.lineTo(x, y + 11);
		ctx.stroke();
		return;
	}
	if (p.kind === "control" || isBs) {
		ctx.fillStyle = isBs ? "#c45c1a" : "#111";
		ctx.beginPath();
		ctx.moveTo(x, y - 7);
		ctx.lineTo(x + 6.5, y + 5);
		ctx.lineTo(x - 6.5, y + 5);
		ctx.closePath();
		ctx.fill();
	} else {
		ctx.strokeStyle = "#111";
		ctx.fillStyle = "#fff";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.arc(x, y, 4.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x - 3, y);
		ctx.lineTo(x + 3, y);
		ctx.moveTo(x, y - 3);
		ctx.lineTo(x, y + 3);
		ctx.stroke();
	}
	if (isSel) {
		ctx.strokeStyle = "#1565c0";
		ctx.lineWidth = 1.5;
		ctx.strokeRect(x - 11, y - 11, 22, 22);
	}
}
function drawNorth(ctx, x, y) {
	ctx.fillStyle = "#111";
	ctx.beginPath();
	ctx.moveTo(x, y - 16);
	ctx.lineTo(x + 6, y + 8);
	ctx.lineTo(x, y + 3);
	ctx.lineTo(x - 6, y + 8);
	ctx.closePath();
	ctx.fill();
	ctx.font = "700 11px 'Barlow', sans-serif";
	ctx.fillStyle = "#111";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.fillText("N", x, y + 10);
}
function drawScale(ctx, w, h, view, units) {
	const nice = niceLength(80 / view.scale);
	const px = nice * view.scale;
	const x = w - px - 18;
	const y = h - 18;
	ctx.strokeStyle = "#111";
	ctx.fillStyle = "#111";
	ctx.lineWidth = 1.4;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + px, y);
	ctx.moveTo(x, y - 4);
	ctx.lineTo(x, y + 4);
	ctx.moveTo(x + px, y - 4);
	ctx.lineTo(x + px, y + 4);
	ctx.stroke();
	ctx.font = "500 10px 'Barlow', sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	ctx.fillText(`${nice} ${UNIT_LABEL[units]}`, x + px / 2, y - 4);
}
function niceLength(raw) {
	const pow = Math.pow(10, Math.floor(Math.log10(raw)));
	const n = raw / pow;
	return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}
function pnezdCsv(job) {
	return ["Point,Northing,Easting,Elevation,Description", ...job.points.map((p) => {
		const desc = [p.code, p.desc].filter(Boolean).join(" ").replace(/,/g, " ");
		return [
			p.name,
			p.n.toFixed(4),
			p.e.toFixed(4),
			p.z.toFixed(4),
			desc
		].join(",");
	})].join("\n") + "\n";
}
function fieldBookText(job) {
	const u = UNIT_LABEL[job.units];
	const lines = [
		`SIGHTLINE  ${job.name}`,
		`Units: ${u}    Declination: ${job.declination.toFixed(2)}°`,
		"",
		"POINT     NORTHING        EASTING         ELEV            CODE   DESC"
	];
	for (const p of job.points) lines.push(`${p.name.padEnd(9)}${p.n.toFixed(4).padStart(14)}  ${p.e.toFixed(4).padStart(14)}  ${p.z.toFixed(4).padStart(12)}    ${p.code.padEnd(6)}${p.desc}`);
	lines.push("", "OBSERVATIONS");
	for (const p of job.points) {
		if (!p.obs) continue;
		const o = p.obs;
		lines.push(`  ${p.name} from ${o.stationName}  HA ${formatDms(o.ha, 1)}  AZ ${formatDms(o.az, 1)} (${toBearing(o.az)})  ZA ${formatDms(o.za, 1)}  SD ${o.sd.toFixed(3)}  HD ${o.hd.toFixed(3)}  ${o.method}`);
	}
	return lines.join("\n") + "\n";
}
function downloadText(filename, text, mime = "text/plain") {
	const blob = new Blob([text], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function PointsPanel({ selectedId, onSelect }) {
	const job = useJob();
	const keyInPoint = useSurvey((s) => s.keyInPoint);
	const deletePoint = useSurvey((s) => s.deletePoint);
	const [name, setName] = (0, import_react.useState)("301");
	const [n, setN] = (0, import_react.useState)("");
	const [e, setE] = (0, import_react.useState)("");
	const [z, setZ] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("CP");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const rows = (0, import_react.useMemo)(() => {
		if (!job) return [];
		const query = q.trim().toLowerCase();
		return job.points.filter((p) => {
			if (!query) return true;
			return `${p.name} ${p.code} ${p.desc}`.toLowerCase().includes(query);
		}).slice().sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true }));
	}, [job, q]);
	if (!job) return null;
	const u = UNIT_LABEL[job.units];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-muted uppercase",
					children: "Coordinate list"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-lg font-semibold",
					children: [job.points.length, " points"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => downloadText(`${slug(job.name)}.csv`, pnezdCsv(job), "text/csv"),
						children: "CSV"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => downloadText(`${slug(job.name)}-book.txt`, fieldBookText(job)),
						children: "Book"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search name, code, desc",
					value: q,
					onChange: (ev) => setQ(ev.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-8 text-sm text-muted",
					children: "No points yet. Key in control or store a shot."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: rows.map((p) => {
					const active = p.id === selectedId;
					const isSta = job.station?.pointId === p.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSelect(active ? null : p.id),
						className: `flex w-full items-start justify-between gap-3 border-b border-border px-4 py-3 text-left ${active ? "bg-raised" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-sm text-readout",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs tracking-wide text-muted",
								children: p.code
							}),
							isSta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs text-warn",
								children: "STA"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-subtle",
								children: p.desc || "—"
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-xs text-muted tabular-nums",
							children: [
								"N ",
								formatCoord(p.n, job.units),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"E ",
								formatCoord(p.e, job.units),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Z ",
								formatCoord(p.z, job.units)
							]
						})]
					}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 border-b border-border bg-bg px-4 py-3",
						children: [p.obs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-muted",
							children: [
								"From ",
								p.obs.stationName,
								" · HA ",
								formatDms(p.obs.ha, 0),
								" · AZ ",
								formatDms(p.obs.az, 0),
								" ",
								toBearing(p.obs.az),
								" · ZA ",
								formatDms(p.obs.za, 0),
								" · SD ",
								p.obs.sd.toFixed(3),
								" · HD",
								" ",
								p.obs.hd.toFixed(3),
								" · ",
								p.obs.method
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: "Keyed-in coordinate — no observation."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "danger",
							size: "sm",
							onClick: () => {
								deletePoint(p.id);
								onSelect(null);
							},
							children: ["Delete ", p.name]
						})]
					}) : null] }, p.id);
				}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid grid-cols-2 gap-2 border-t border-border p-4",
				onSubmit: (ev) => {
					ev.preventDefault();
					const res = keyInPoint({
						name: name.trim(),
						n: Number(n),
						e: Number(e),
						z: Number(z),
						code,
						desc,
						kind: "control"
					});
					if ("error" in res) setMsg(res.error);
					else {
						setMsg(`Stored ${res.name}`);
						setName(String(Number(name.replace(/\D/g, "")) + 1 || name));
						setN("");
						setE("");
						setZ("");
						setDesc("");
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "col-span-2 text-xs font-medium tracking-[0.14em] text-muted uppercase",
						children: "Key in control"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Point",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (ev) => setName(ev.target.value),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Code",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: code,
							onChange: (ev) => setCode(ev.target.value),
							className: "h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg",
							children: FIELD_CODES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c,
								children: c
							}, c))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `N ${u}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: n,
							onChange: (ev) => setN(ev.target.value),
							inputMode: "decimal",
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `E ${u}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: e,
							onChange: (ev) => setE(ev.target.value),
							inputMode: "decimal",
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `Z ${u}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: z,
							onChange: (ev) => setZ(ev.target.value),
							inputMode: "decimal",
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Desc",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: desc,
							onChange: (ev) => setDesc(ev.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "col-span-2",
						children: "Store control"
					}),
					msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "col-span-2 text-sm text-readout",
						children: msg
					}) : null
				]
			})
		]
	});
}
function slug(name) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "job";
}
function StationPanel({ gps }) {
	const job = useJob();
	const occupy = useSurvey((s) => s.occupy);
	const keyInPoint = useSurvey((s) => s.keyInPoint);
	const resect = useSurvey((s) => s.resect);
	const clearStation = useSurvey((s) => s.clearStation);
	const setDeclination = useSurvey((s) => s.setDeclination);
	const setUnits = useSurvey((s) => s.setUnits);
	const setGpsOrigin = useSurvey((s) => s.setGpsOrigin);
	const [mode, setMode] = (0, import_react.useState)("occupy");
	const [msg, setMsg] = (0, import_react.useState)(null);
	if (!job) return null;
	const u = UNIT_LABEL[job.units];
	const stationPt = job.station ? findPoint(job.points, job.station.pointId) : void 0;
	const bsPt = job.station?.backsightId ? findPoint(job.points, job.station.backsightId) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-muted uppercase",
					children: "Station setup"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-xl font-semibold tracking-tight",
					children: "Occupy or resect"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "One known point + backsight, compass north, or free-station from two knowns."
				})
			] }),
			stationPt && job.station ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-raised p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.14em] text-muted uppercase",
						children: "Occupied"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-lg text-readout",
						children: stationPt.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-sm text-fg",
						children: [
							"N ",
							formatCoord(stationPt.n, job.units),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"E ",
							formatCoord(stationPt.e, job.units),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Z ",
							formatCoord(stationPt.z, job.units)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"HI ",
							job.station.hi.toFixed(3),
							" ",
							u,
							" · HT ",
							job.station.ht.toFixed(3),
							" ",
							u,
							bsPt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"BS ",
								bsPt.name,
								" · circle 0 = ",
								formatDms(job.station.azAtZero, 0),
								" ",
								toBearing(job.station.azAtZero)
							] }) : job.station.orientationMode === "compass" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"Compass + decl ",
								job.declination.toFixed(2),
								"°"
							] }) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						className: "mt-3",
						onClick: () => clearStation(),
						children: "Break station"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted",
				children: "No station occupied."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: mode === "occupy" ? "primary" : "ghost",
					onClick: () => setMode("occupy"),
					children: "Known point"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: mode === "resect" ? "primary" : "ghost",
					onClick: () => setMode("resect"),
					children: "Two knowns"
				})]
			}),
			mode === "occupy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OccupyForm, {
				units: u,
				onOccupy: (args) => {
					occupy(args);
					setMsg(`Occupied ${findPoint(job.points, args.pointId)?.name ?? ""}`);
				},
				onKeyIn: keyInPoint,
				onError: setMsg
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResectForm, {
				units: u,
				onGo: (args) => {
					const res = resect(args);
					if ("error" in res) setMsg(res.error);
					else setMsg(`Free station ${res.name} stored and occupied`);
				}
			}),
			msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-readout",
				children: msg
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-muted uppercase",
						children: "Job"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-3 gap-2",
						children: [
							"usft",
							"ift",
							"m"
						].map((uOpt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: job.units === uOpt ? "primary" : "ghost",
							size: "sm",
							onClick: () => setUnits(uOpt),
							children: uOpt === "usft" ? "US ft" : uOpt === "ift" ? "Int ft" : "m"
						}, uOpt))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Magnetic declination (E+)",
							hint: "Added to compass heading for true/grid azimuth",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								defaultValue: String(job.declination),
								onBlur: (e) => {
									const n = parseAngle(e.target.value);
									if (n != null) setDeclination(n);
								}
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => {
								if (gps.status !== "on") gps.start();
								if (gps.fix) setGpsOrigin(gps.fix.lat, gps.fix.lon);
							},
							children: job.gpsOrigin ? "GPS origin set" : "GPS lock at station"
						}), gps.fix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-muted",
							children: [
								gps.fix.lat.toFixed(6),
								", ",
								gps.fix.lon.toFixed(6),
								" ±",
								gps.fix.accuracy.toFixed(0),
								" m"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: "Phone GPS is typically 3–8 m. Use for reconnaissance, not boundary."
						})]
					})
				]
			})
		]
	});
}
function OccupyForm({ units, onOccupy, onKeyIn, onError }) {
	const job = useJob();
	const [pointName, setPointName] = (0, import_react.useState)("100");
	const [n, setN] = (0, import_react.useState)("10000");
	const [e, setE] = (0, import_react.useState)("5000");
	const [z, setZ] = (0, import_react.useState)("850");
	const [hi, setHi] = (0, import_react.useState)("5.15");
	const [ht, setHt] = (0, import_react.useState)("5.00");
	const [orient, setOrient] = (0, import_react.useState)("circle");
	const [bsName, setBsName] = (0, import_react.useState)("101");
	const [azIn, setAzIn] = (0, import_react.useState)("0");
	const existing = job?.points.find((p) => p.name.trim() === pointName.trim());
	const bs = job?.points.find((p) => p.name.trim() === bsName.trim());
	const previewAz = (0, import_react.useMemo)(() => {
		if (!existing || !bs) return null;
		return inverse(existing, bs).az;
	}, [existing, bs]);
	if (!job) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Occupy point",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: pointName,
					onChange: (ev) => setPointName(ev.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `N ${units}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: n,
							onChange: (ev) => setN(ev.target.value),
							inputMode: "decimal"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `E ${units}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: e,
							onChange: (ev) => setE(ev.target.value),
							inputMode: "decimal"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `Z ${units}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: z,
							onChange: (ev) => setZ(ev.target.value),
							inputMode: "decimal"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: `HI ${units}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: hi,
						onChange: (ev) => setHi(ev.target.value),
						inputMode: "decimal"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: `HT ${units}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ht,
						onChange: (ev) => setHt(ev.target.value),
						inputMode: "decimal"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-muted uppercase",
				children: "Orientation"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: orient === "circle" ? "primary" : "ghost",
						size: "sm",
						onClick: () => setOrient("circle"),
						children: "Backsight"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: orient === "compass" ? "primary" : "ghost",
						size: "sm",
						onClick: () => setOrient("compass"),
						children: "Compass"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: orient === "azimuth" ? "primary" : "ghost",
						size: "sm",
						onClick: () => setOrient("azimuth"),
						children: "Set AZ"
					})
				]
			}),
			orient === "circle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Backsight point",
				hint: previewAz != null ? `Computed AZ ${formatDms(previewAz, 0)} ${toBearing(previewAz)}` : "Key in a second known, or pick an existing name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: bsName,
					onChange: (ev) => setBsName(ev.target.value)
				})
			}) : null,
			orient === "azimuth" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Azimuth at circle 0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: azIn,
					onChange: (ev) => setAzIn(ev.target.value)
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				onClick: () => {
					const nn = Number(n);
					const ee = Number(e);
					const zz = Number(z);
					const hiN = Number(hi);
					const htN = Number(ht);
					if (![
						nn,
						ee,
						zz,
						hiN,
						htN
					].every(Number.isFinite)) {
						onError("Check N/E/Z/HI/HT.");
						return;
					}
					let pointId = existing?.id;
					if (!pointId) {
						const created = onKeyIn({
							name: pointName.trim(),
							n: nn,
							e: ee,
							z: zz,
							code: "STA",
							desc: "Occupied station",
							kind: "control"
						});
						if ("error" in created) {
							onError(created.error);
							return;
						}
						pointId = created.id;
					}
					let azAtZero = 0;
					let backsightId = null;
					let mode = "circle";
					if (orient === "compass") {
						mode = "compass";
						azAtZero = 0;
					} else if (orient === "azimuth") {
						const a = parseAngle(azIn);
						if (a == null) {
							onError("Bad azimuth.");
							return;
						}
						azAtZero = a;
					} else {
						const jobNow = useSurvey.getState().currentJob();
						const occ = jobNow?.points.find((p) => p.id === pointId);
						const back = jobNow?.points.find((p) => p.name.trim() === bsName.trim());
						if (!back) {
							onError("Backsight point not in the job — add it on Points first.");
							return;
						}
						if (!occ) {
							onError("Occupy point missing.");
							return;
						}
						azAtZero = inverse(occ, back).az;
						backsightId = back.id;
					}
					onOccupy({
						pointId,
						hi: hiN,
						ht: htN,
						mode,
						azAtZero,
						backsightId,
						bsHa: 0
					});
				},
				children: "Occupy"
			})
		]
	});
}
function ResectForm({ units, onGo }) {
	const job = useJob();
	const [aName, setAName] = (0, import_react.useState)("100");
	const [bName, setBName] = (0, import_react.useState)("101");
	const [hdA, setHdA] = (0, import_react.useState)("200");
	const [hdB, setHdB] = (0, import_react.useState)("350");
	const [zaA, setZaA] = (0, import_react.useState)("90");
	const [zaB, setZaB] = (0, import_react.useState)("90");
	const [hi, setHi] = (0, import_react.useState)("5.15");
	const [ht, setHt] = (0, import_react.useState)("5.00");
	const [name, setName] = (0, import_react.useState)("300");
	const [side, setSide] = (0, import_react.useState)("left");
	const a = job?.points.find((p) => p.name.trim() === aName.trim());
	const b = job?.points.find((p) => p.name.trim() === bName.trim());
	const preview = (0, import_react.useMemo)(() => {
		if (!a || !b) return null;
		const hd1 = Number(hdA);
		const hd2 = Number(hdB);
		if (![hd1, hd2].every((x) => x > 0)) return null;
		return distanceDistance(a, b, hd1, hd2);
	}, [
		a,
		b,
		hdA,
		hdB
	]);
	if (!job) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Measure horizontal distance to two knowns (tape, EDM, or GPS). Pick the solution left or right of A→B."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Known A",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: aName,
							onChange: (ev) => setAName(ev.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `HD A ${units}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: hdA,
							onChange: (ev) => setHdA(ev.target.value),
							inputMode: "decimal"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Known B",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: bName,
							onChange: (ev) => setBName(ev.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `HD B ${units}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: hdB,
							onChange: (ev) => setHdB(ev.target.value),
							inputMode: "decimal"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ZA to A",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: zaA,
							onChange: (ev) => setZaA(ev.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ZA to B",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: zaB,
							onChange: (ev) => setZaB(ev.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `HI ${units}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: hi,
							onChange: (ev) => setHi(ev.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `HT ${units}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: ht,
							onChange: (ev) => setHt(ev.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "New station name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (ev) => setName(ev.target.value)
				})
			}),
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted",
				children: [
					"Left N ",
					preview.left.n.toFixed(3),
					" E ",
					preview.left.e.toFixed(3),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"Right N ",
					preview.right.n.toFixed(3),
					" E ",
					preview.right.e.toFixed(3)
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "Need two known points and valid distances."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: side === "left" ? "primary" : "ghost",
					onClick: () => setSide("left"),
					children: "Left of A→B"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: side === "right" ? "primary" : "ghost",
					onClick: () => setSide("right"),
					children: "Right of A→B"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				disabled: !a || !b,
				onClick: () => {
					if (!a || !b) return;
					const za1 = parseAngle(zaA) ?? 90;
					const za2 = parseAngle(zaB) ?? 90;
					const hd1 = Number(hdA);
					const hd2 = Number(hdB);
					const sin1 = Math.sin(za1 * Math.PI / 180);
					const sin2 = Math.sin(za2 * Math.PI / 180);
					onGo({
						aId: a.id,
						bId: b.id,
						hdA: hd1,
						hdB: hd2,
						zaA: za1,
						zaB: za2,
						sdA: sin1 === 0 ? hd1 : hd1 / sin1,
						sdB: sin2 === 0 ? hd2 : hd2 / sin2,
						side,
						hi: Number(hi) || 0,
						ht: Number(ht) || 0,
						name: name.trim() || "STA"
					});
				},
				children: "Compute & occupy"
			})
		]
	});
}
function rng(seed) {
	return function next() {
		seed = seed + 1831565813 | 0;
		let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var SiteScene = class {
	renderer;
	scene;
	camera;
	raycaster = new Raycaster();
	disposables = [];
	mats = {};
	origin;
	groundY;
	targets = new Group();
	clouds = new Group();
	pointKey = "";
	sun;
	sunGlow;
	t = 0;
	hfov = 16;
	marks = [];
	jobMarks = [];
	beam;
	beamLife = 0;
	lastHit = null;
	constructor(canvas, origin, groundY) {
		this.origin = origin;
		this.groundY = groundY;
		this.renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			alpha: false,
			powerPreference: "high-performance"
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = 4;
		this.renderer.toneMappingExposure = 1.12;
		this.renderer.shadowMap.enabled = false;
		this.scene = new Scene();
		this.scene.fog = new Fog(12042414, 380, 2600);
		this.scene.background = new Color(8888498);
		this.camera = new PerspectiveCamera(28, 1, .35, 5e3);
		this.scene.add(this.camera);
		this.buildSky();
		this.buildLights();
		this.buildTerrain();
		this.buildHills();
		this.buildHorizon();
		this.buildForest();
		this.buildLot();
		this.scene.add(this.targets);
		this.scene.add(this.clouds);
		this.buildClouds();
		this.seedMarks();
		const beamMat = new LineBasicMaterial({
			color: 16726831,
			transparent: true,
			opacity: .95,
			blending: 2,
			depthWrite: false
		});
		this.beam = new Line(new BufferGeometry(), beamMat);
		this.beam.visible = false;
		this.beam.frustumCulled = false;
		this.scene.add(this.beam);
		this.disposables.push(beamMat);
	}
	toVec(n, e, z, out = new Vector3()) {
		return out.set(e - this.origin.e, z, -(n - this.origin.n));
	}
	fromVec(v) {
		return {
			n: this.origin.n - v.z,
			e: this.origin.e + v.x,
			z: v.y
		};
	}
	resize(w, h) {
		if (w < 2 || h < 2) return;
		this.renderer.setSize(w, h, false);
		this.setHfov(this.hfov, w / h);
	}
	setHfov(hFovDeg, aspect) {
		this.hfov = hFovDeg;
		this.camera.aspect = aspect;
		this.camera.fov = verticalFovDeg(hFovDeg, aspect);
		this.camera.updateProjectionMatrix();
	}
	setView(azDeg, zaDeg, rollDeg, n, e, z) {
		const pos = this.toVec(n, e, z);
		this.camera.position.copy(pos);
		const az = azDeg * Math.PI / 180;
		const za = zaDeg * Math.PI / 180;
		const forward = new Vector3(Math.sin(az) * Math.sin(za), Math.cos(za), -Math.cos(az) * Math.sin(za)).normalize();
		const worldUp = new Vector3(0, 1, 0);
		const xAxis = new Vector3().crossVectors(forward, worldUp);
		if (xAxis.lengthSq() < 1e-8) xAxis.set(1, 0, 0);
		else xAxis.normalize();
		const yAxis = new Vector3().crossVectors(xAxis, forward).normalize();
		const m = new Matrix4();
		m.makeBasis(xAxis, yAxis, forward.clone().negate());
		this.camera.quaternion.setFromRotationMatrix(m);
		if (Math.abs(rollDeg) > .05) this.camera.rotateZ(-rollDeg * Math.PI / 180);
		this.sun.position.copy(pos).add(new Vector3(820, 340, 180));
		this.sun.lookAt(pos);
		this.sunGlow.position.copy(this.sun.position);
		this.sunGlow.lookAt(pos);
	}
	syncPoints(points, occupiedId) {
		const key = points.map((p) => `${p.id}:${p.n}:${p.e}:${p.z}:${p.code}:${p.name}`).join("|") + occupiedId;
		if (key === this.pointKey) return;
		this.pointKey = key;
		while (this.targets.children.length) {
			const ch = this.targets.children.pop();
			ch.traverse((obj) => {
				const mesh = obj;
				if (mesh.geometry && mesh.userData.ownGeo) mesh.geometry.dispose();
			});
			this.targets.remove(ch);
		}
		for (const p of points) {
			if (p.id === occupiedId) continue;
			this.targets.add(this.makeTarget(p));
		}
		this.jobMarks = points.filter((p) => p.id !== occupiedId).map((p) => ({
			label: p.name,
			code: p.code,
			n: p.n,
			e: p.e,
			z: p.z + (p.code === "PIN" || p.code === "CP" || p.code === "FS" || p.code === "MON" ? 5 : 2)
		}));
	}
	range() {
		this.raycaster.setFromCamera(new Vector2(0, 0), this.camera);
		this.raycaster.far = 2500;
		const hits = this.raycaster.intersectObjects(this.scene.children, true);
		const wp = new Vector3();
		for (const h of hits) {
			if (!h.object.userData.target) continue;
			const label = String(h.object.userData.label ?? "ground");
			const code = String(h.object.userData.code ?? "TP");
			const kind = h.object.userData.kind ?? (label === "ground" ? "ground" : "feature");
			if (kind === "prism") {
				const g = h.object.parent;
				if (g) {
					g.getWorldPosition(wp);
					wp.y += 5;
				} else h.object.getWorldPosition(wp);
				const sd = this.camera.position.distanceTo(wp);
				if (sd > .5) {
					const nez = this.fromVec(wp);
					this.lastHit = {
						sd,
						label,
						code,
						n: nez.n,
						e: nez.e,
						z: nez.z,
						kind
					};
					return this.lastHit;
				}
				continue;
			}
			let sd = h.distance;
			if (kind !== "ground") {
				h.object.getWorldPosition(wp);
				sd = this.camera.position.distanceTo(wp);
			}
			if (!(sd > .5)) continue;
			const world = kind === "ground" ? h.point : wp;
			const nez = this.fromVec(world);
			this.lastHit = {
				sd,
				label,
				code,
				n: nez.n,
				e: nez.e,
				z: nez.z,
				kind
			};
			return this.lastHit;
		}
		this.lastHit = null;
		return null;
	}
	fire() {
		const hit = this.range();
		if (!hit) {
			this.beam.visible = false;
			return null;
		}
		const from = this.camera.position.clone();
		const to = this.toVec(hit.n, hit.e, hit.z);
		this.beam.geometry.dispose();
		this.beam.geometry = new BufferGeometry().setFromPoints([from, to]);
		const mat = this.beam.material;
		mat.opacity = 1;
		this.beam.visible = true;
		this.beamLife = .38;
		return hit;
	}
	nearest(azDeg, zaDeg, maxDeg) {
		let best = null;
		let bestAng = maxDeg;
		const cam = this.camera.position;
		const all = this.marks.concat(this.jobMarks);
		for (const m of all) {
			this.toVec(m.n, m.e, m.z);
			const dN = m.n - this.fromVec(cam).n;
			const dE = m.e - this.fromVec(cam).e;
			const dZ = m.z - cam.y;
			const hd = Math.hypot(dN, dE);
			const sd = Math.hypot(hd, dZ);
			if (sd < 2) continue;
			const az = (Math.atan2(dE, dN) * 180 / Math.PI + 360) % 360;
			const za = Math.atan2(hd, dZ) * 180 / Math.PI;
			let dAz = az - azDeg;
			while (dAz > 180) dAz -= 360;
			while (dAz < -180) dAz += 360;
			const dZa = za - zaDeg;
			const ang = Math.hypot(dAz, dZa);
			if (ang < bestAng) {
				bestAng = ang;
				best = {
					label: m.label,
					dAz,
					dZa,
					sd
				};
			}
		}
		return best;
	}
	tick(dt) {
		this.t += dt;
		this.clouds.position.x = Math.sin(this.t * .012) * 40;
		this.clouds.position.z = Math.cos(this.t * .008) * 18;
		if (this.beamLife > 0) {
			this.beamLife -= dt;
			const mat = this.beam.material;
			mat.opacity = Math.max(0, this.beamLife / .38);
			this.beam.visible = this.beamLife > 0;
		}
		this.renderer.render(this.scene, this.camera);
	}
	seedMarks() {
		const o = this.origin;
		const g = this.groundY;
		const add = (label, code, n, e, z) => {
			this.marks.push({
				label,
				code,
				n,
				e,
				z
			});
		};
		add("FS", "FS", o.n - 16, o.e + 82, g + 5);
		add("house", "BLDG", o.n - 145, o.e + 200, g + 10);
		add("barn", "BLDG", o.n - 118, o.e + 310, g + 8);
		add("silo", "BLDG", o.n + 18, o.e + 620, g + 18);
		add("mailbox", "TP", o.n - 238, o.e + 8, g + 4);
		add("gate", "FENCE", o.n - 18, o.e + 348, g + 3);
		add("shed", "BLDG", o.n - 110, o.e + 290, g + 6);
		add("tree", "TREE", o.n - 48, o.e + 92, g + 12);
		add("hydrant", "FH", o.n - 120, o.e + 180, g + 2.5);
		add("power pole", "POLE", o.n - 75, o.e - 112, g + 20);
	}
	dispose() {
		this.scene.traverse((obj) => {
			const mesh = obj;
			if (mesh.geometry) mesh.geometry.dispose();
		});
		for (const m of Object.values(this.mats)) m.dispose();
		for (const d of this.disposables) d.dispose();
		this.renderer.dispose();
	}
	track(name, m) {
		const existing = this.mats[name];
		if (existing) {
			m.dispose();
			return existing;
		}
		this.mats[name] = m;
		return m;
	}
	loadTex(url, apply) {
		new TextureLoader().load(url, (tex) => {
			tex.colorSpace = SRGBColorSpace;
			tex.anisotropy = 4;
			this.disposables.push(tex);
			apply(tex);
		});
	}
	buildLights() {
		const hemi = new HemisphereLight(12899040, 4870976, 1.05);
		this.scene.add(hemi);
		const sun = new DirectionalLight(16770756, 1.55);
		sun.position.set(480, 260, 80);
		this.scene.add(sun);
		const fill = new DirectionalLight(8295334, .32);
		fill.position.set(-160, 90, -160);
		this.scene.add(fill);
	}
	buildSky() {
		const c = document.createElement("canvas");
		c.width = 8;
		c.height = 256;
		const ctx = c.getContext("2d");
		const g = ctx.createLinearGradient(0, 0, 0, 256);
		g.addColorStop(0, "#2f5070");
		g.addColorStop(.38, "#7ea0b8");
		g.addColorStop(.5, "#e4d2ae");
		g.addColorStop(.56, "#b7bea8");
		g.addColorStop(1, "#6a7564");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 8, 256);
		const tex = new CanvasTexture(c);
		tex.colorSpace = SRGBColorSpace;
		this.disposables.push(tex);
		const mat = this.track("sky", new MeshBasicMaterial({
			map: tex,
			side: 1,
			fog: false,
			depthWrite: false
		}));
		const sky = new Mesh(new SphereGeometry(3200, 24, 16), mat);
		sky.renderOrder = -10;
		sky.frustumCulled = false;
		this.scene.add(sky);
		const sunGeo = new CircleGeometry(10, 24);
		const sunMat = this.track("sun", new MeshBasicMaterial({
			color: 15918264,
			fog: false,
			transparent: true,
			opacity: .95
		}));
		this.sun = new Mesh(sunGeo, sunMat);
		this.sun.position.set(-900, 420, 380);
		this.scene.add(this.sun);
		const glowMat = this.track("sunGlow", new MeshBasicMaterial({
			color: 16244904,
			fog: false,
			transparent: true,
			opacity: .18,
			depthWrite: false
		}));
		this.sunGlow = new Mesh(new CircleGeometry(42, 24), glowMat);
		this.sunGlow.position.copy(this.sun.position);
		this.scene.add(this.sunGlow);
	}
	sidingTexture() {
		const c = document.createElement("canvas");
		c.width = 128;
		c.height = 128;
		const ctx = c.getContext("2d");
		ctx.fillStyle = "#d4ccbe";
		ctx.fillRect(0, 0, 128, 128);
		ctx.strokeStyle = "rgba(90,82,70,0.28)";
		ctx.lineWidth = 1;
		for (let y = 8; y < 128; y += 10) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(128, y);
			ctx.stroke();
		}
		const tex = new CanvasTexture(c);
		tex.wrapS = tex.wrapT = RepeatWrapping;
		tex.repeat.set(6, 4);
		tex.colorSpace = SRGBColorSpace;
		this.disposables.push(tex);
		return tex;
	}
	poleTexture() {
		const c = document.createElement("canvas");
		c.width = 32;
		c.height = 256;
		const ctx = c.getContext("2d");
		for (let i = 0; i < 8; i++) {
			ctx.fillStyle = i % 2 === 0 ? "#c24f22" : "#f3efe6";
			ctx.fillRect(0, i * 32, 32, 32);
		}
		const tex = new CanvasTexture(c);
		tex.colorSpace = SRGBColorSpace;
		this.disposables.push(tex);
		return tex;
	}
	buildTerrain() {
		const grass = this.track("grass", new MeshLambertMaterial({ color: 10136456 }));
		const ground = new Mesh(new CircleGeometry(2200, 64), grass);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = this.groundY;
		ground.userData = {
			target: true,
			label: "ground",
			code: "TP",
			kind: "ground"
		};
		this.scene.add(ground);
		this.loadTex("/site/grass.jpg", (tex) => {
			tex.wrapS = tex.wrapT = RepeatWrapping;
			tex.repeat.set(22, 22);
			grass.map = tex;
			grass.color.set(16777215);
			grass.needsUpdate = true;
		});
		const dirt = this.track("dirt", new MeshLambertMaterial({ color: 6970440 }));
		const pad = new Mesh(new CircleGeometry(6, 20), dirt);
		pad.rotation.x = -Math.PI / 2;
		pad.position.y = this.groundY + .04;
		this.scene.add(pad);
		const tracks = this.track("tracks", new MeshLambertMaterial({ color: 7234388 }));
		for (const nOff of [-1.1, 1.1]) {
			const strip = new Mesh(new BoxGeometry(320, .05, .7), tracks);
			strip.position.copy(this.toVec(this.origin.n + nOff, this.origin.e + 170, this.groundY + .03));
			this.scene.add(strip);
		}
	}
	buildHills() {
		const hill = this.track("hill", new MeshLambertMaterial({ color: 6056020 }));
		const far = this.track("farHill", new MeshLambertMaterial({ color: 7240296 }));
		const rnd = rng(4);
		for (let i = 0; i < 14; i++) {
			const az = i / 14 * Math.PI * 2 + rnd() * .3;
			const dist = 900 + rnd() * 700;
			const mesh = new Mesh(new SphereGeometry(180 + rnd() * 160, 10, 8), i % 2 ? hill : far);
			mesh.scale.y = .22 + rnd() * .12;
			mesh.position.set(Math.sin(az) * dist, this.groundY + 10, -Math.cos(az) * dist);
			this.scene.add(mesh);
		}
	}
	buildHorizon() {
		const mat = this.track("treeline", new MeshBasicMaterial({
			color: 13950152,
			transparent: true,
			opacity: .95,
			side: 1,
			depthWrite: false,
			fog: true
		}));
		const mesh = new Mesh(new CylinderGeometry(1480, 1480, 240, 48, 1, true), mat);
		mesh.position.y = this.groundY + 95;
		mesh.renderOrder = -6;
		mesh.frustumCulled = false;
		this.scene.add(mesh);
		this.loadTex("/site/treeline.png", (tex) => {
			tex.wrapS = RepeatWrapping;
			tex.wrapT = ClampToEdgeWrapping;
			tex.repeat.set(4, 1);
			mat.map = tex;
			mat.color.set(16777215);
			mat.needsUpdate = true;
		});
	}
	buildForest() {
		const trunkMat = this.track("trunk", new MeshLambertMaterial({ color: 4864812 }));
		const leafMat = this.track("leaf", new MeshLambertMaterial({ color: 4151868 }));
		const leaf2 = this.track("leaf2", new MeshLambertMaterial({ color: 5139012 }));
		const trunkGeo = new CylinderGeometry(.32, .55, 14, 6);
		const crownGeo = new ConeGeometry(3.6, 16, 7);
		const crownGeo2 = new ConeGeometry(2.6, 11, 7);
		const roundGeo = new SphereGeometry(4.4, 7, 5);
		const rnd = rng(11);
		const count = 140;
		const trunks = new InstancedMesh(trunkGeo, trunkMat, count);
		const crowns = new InstancedMesh(crownGeo, leafMat, count);
		const crowns2 = new InstancedMesh(crownGeo2, leaf2, count);
		const rounds = new InstancedMesh(roundGeo, leaf2, 50);
		const m = new Matrix4();
		const q = new Quaternion();
		const s = new Vector3();
		const p = new Vector3();
		let i = 0;
		let r = 0;
		while (i < count) {
			const az = rnd() * Math.PI * 2;
			const dist = 90 + rnd() * 980;
			const nOff = Math.cos(az) * dist;
			const eOff = Math.sin(az) * dist;
			if (Math.abs(eOff) < 420 && nOff < 50 && nOff > -300) {
				if (rnd() > .08) continue;
			}
			if (Math.abs(nOff) < 18 && eOff > 10 && eOff < 700) continue;
			const scale = .85 + rnd() * 1.15;
			p.set(eOff, this.groundY + 7 * scale, -nOff);
			s.set(scale, scale, scale);
			q.identity();
			m.compose(p, q, s);
			trunks.setMatrixAt(i, m);
			if (rnd() > .62 && r < 50) {
				p.y = this.groundY + 12 * scale;
				s.set(scale * 1.1, scale * .9, scale * 1.1);
				m.compose(p, q, s);
				rounds.setMatrixAt(r, m);
				r++;
				s.set(0, 0, 0);
				m.compose(p, q, s);
				crowns.setMatrixAt(i, m);
				crowns2.setMatrixAt(i, m);
			} else {
				p.y = this.groundY + 16 * scale;
				s.set(scale, scale, scale);
				m.compose(p, q, s);
				crowns.setMatrixAt(i, m);
				p.y = this.groundY + 22 * scale;
				s.set(scale * .78, scale * .85, scale * .78);
				m.compose(p, q, s);
				crowns2.setMatrixAt(i, m);
			}
			i++;
		}
		rounds.count = r;
		this.scene.add(trunks, crowns, crowns2, rounds);
	}
	buildLot() {
		const wood = this.track("fence", new MeshLambertMaterial({ color: 8022610 }));
		const railMat = this.track("rail", new MeshLambertMaterial({ color: 7168076 }));
		const posts = [
			[0, 350],
			[-240, 350],
			[-240, -380],
			[0, -380]
		];
		const loop = [...posts, posts[0]];
		for (let i = 0; i < loop.length - 1; i++) {
			const a = loop[i];
			const b = loop[i + 1];
			const len = Math.hypot(b[1] - a[1], b[0] - a[0]);
			const segs = Math.max(2, Math.round(len / 8));
			const keep = [];
			for (let s = 0; s <= segs; s++) {
				const t = s / segs;
				const n = a[0] + (b[0] - a[0]) * t;
				const e = a[1] + (b[1] - a[1]) * t;
				if (n * n + e * e < 484) continue;
				keep.push([n, e]);
				const post = new Mesh(new BoxGeometry(.33, 4.5, .33), wood);
				const v = this.toVec(this.origin.n + n, this.origin.e + e, this.groundY + 2.25);
				post.position.copy(v);
				post.userData = {
					target: true,
					label: "fence",
					code: "FENCE",
					kind: "feature"
				};
				this.scene.add(post);
			}
			if (keep.length >= 2) {
				const first = keep[0];
				const last = keep[keep.length - 1];
				const span = Math.hypot(last[1] - first[1], last[0] - first[0]);
				if (span > 10) for (const railY of [1.5, 3.15]) {
					const rail = new Mesh(new BoxGeometry(span, .12, .08), railMat);
					const mid = this.toVec(this.origin.n + (first[0] + last[0]) / 2, this.origin.e + (first[1] + last[1]) / 2, this.groundY + railY);
					rail.position.copy(mid);
					rail.rotation.y = Math.atan2(last[1] - first[1], -(last[0] - first[0]));
					this.scene.add(rail);
				}
			}
		}
		this.buildHouse(this.origin.n - 145, this.origin.e + 200, this.groundY);
		this.buildDriveway();
		this.buildShed(this.origin.n - 110, this.origin.e + 290, this.groundY);
		this.buildMailbox(this.origin.n - 238, this.origin.e + 8, this.groundY);
		this.buildYardTrees();
		this.buildForesight();
		this.buildSilo();
		this.buildGate();
	}
	addGable(cx, cy, cz, width, depth, rise, mat, userData) {
		const len = Math.hypot(width / 2, rise);
		const tilt = Math.atan2(rise, width / 2);
		for (const side of [-1, 1]) {
			const plane = new Mesh(new BoxGeometry(len, .28, depth + .6), mat);
			plane.position.set(cx + side * (width / 4), cy + rise / 2, cz);
			plane.rotation.z = -side * tilt;
			if (userData) plane.userData = userData;
			this.scene.add(plane);
		}
	}
	buildHouse(n, e, z) {
		const siding = this.track("siding", new MeshLambertMaterial({
			map: this.sidingTexture(),
			color: 14209218
		}));
		const roof = this.track("roof", new MeshLambertMaterial({ color: 4999492 }));
		const trim = this.track("trim", new MeshLambertMaterial({ color: 15196886 }));
		const dark = this.track("win", new MeshLambertMaterial({ color: 3028280 }));
		const brick = this.track("brick", new MeshLambertMaterial({ color: 6968134 }));
		const body = new Mesh(new BoxGeometry(42, 10, 28), siding);
		const p = this.toVec(n, e, z + 5);
		body.position.copy(p);
		body.userData = {
			target: true,
			label: "house",
			code: "BLDG",
			kind: "feature"
		};
		this.scene.add(body);
		this.addGable(p.x, z + 10, p.z, 42, 28, 6.5, roof, {
			target: true,
			label: "roof",
			code: "BLDG",
			kind: "feature"
		});
		const chimney = new Mesh(new BoxGeometry(1.6, 4.2, 1.6), brick);
		chimney.position.set(p.x + 10, z + 14.5, p.z - 4);
		this.scene.add(chimney);
		const porch = new Mesh(new BoxGeometry(8, .28, 6), trim);
		porch.position.set(p.x, z + .22, p.z + 17);
		this.scene.add(porch);
		const door = new Mesh(new BoxGeometry(3.2, 6.8, .18), dark);
		door.position.set(p.x, z + 3.6, p.z + 14.1);
		this.scene.add(door);
		for (const ox of [-12, 12]) {
			const frame = new Mesh(new BoxGeometry(3.4, 4, .12), trim);
			frame.position.set(p.x + ox, z + 6.2, p.z + 14.06);
			this.scene.add(frame);
			const w = new Mesh(new BoxGeometry(2.7, 3.2, .1), dark);
			w.position.set(p.x + ox, z + 6.2, p.z + 14.14);
			this.scene.add(w);
		}
		const invis = this.track("invis", new MeshBasicMaterial({ visible: false }));
		const corners = [
			[
				n + 14,
				e + 21,
				"NE house"
			],
			[
				n + 14,
				e - 21,
				"NW house"
			],
			[
				n - 14,
				e + 21,
				"SE house"
			],
			[
				n - 14,
				e - 21,
				"SW house"
			]
		];
		for (const [cn, ce, label] of corners) {
			const hit = new Mesh(new CylinderGeometry(1, 1, 10, 8), invis);
			hit.position.copy(this.toVec(cn, ce, z + 5));
			hit.userData = {
				target: true,
				label,
				code: "BLDG",
				kind: "feature"
			};
			this.scene.add(hit);
		}
	}
	buildDriveway() {
		const gravel = this.track("gravel", new MeshLambertMaterial({ color: 7235420 }));
		const drive = new Mesh(new BoxGeometry(10, .06, 120), gravel);
		drive.position.copy(this.toVec(this.origin.n - 80, this.origin.e + 200, this.groundY + .05));
		drive.userData = {
			target: true,
			label: "driveway",
			code: "CL",
			kind: "feature"
		};
		this.scene.add(drive);
	}
	buildShed(n, e, z) {
		const mat = this.track("shed", new MeshLambertMaterial({ color: 7035460 }));
		const roof = this.track("shedRoof", new MeshLambertMaterial({ color: 4144184 }));
		const body = new Mesh(new BoxGeometry(12, 8, 16), mat);
		const p = this.toVec(n, e, z + 4);
		body.position.copy(p);
		body.userData = {
			target: true,
			label: "shed",
			code: "BLDG",
			kind: "feature"
		};
		this.scene.add(body);
		this.addGable(p.x, z + 8, p.z, 12, 16, 3.2, roof, body.userData);
	}
	buildMailbox(n, e, z) {
		const post = new Mesh(new CylinderGeometry(.12, .12, 4, 6), this.track("mbpost", new MeshLambertMaterial({ color: 3815992 })));
		post.position.copy(this.toVec(n, e, z + 2));
		const box = new Mesh(new BoxGeometry(1.4, .9, .7), this.track("mb", new MeshLambertMaterial({ color: 4871520 })));
		box.position.copy(this.toVec(n, e, z + 4.1));
		box.userData = {
			target: true,
			label: "mailbox",
			code: "TP",
			kind: "feature"
		};
		post.userData = box.userData;
		this.scene.add(post, box);
	}
	makeTarget(p) {
		const g = new Group();
		const base = this.toVec(p.n, p.e, p.z);
		g.position.copy(base);
		const code = p.code;
		if (code === "FH") g.add(this.hydrant(p.name));
		else if (code === "POLE") g.add(this.powerPole(p.name));
		else if (code === "TREE") g.add(this.singleTree());
		else if (code === "PIN" || code === "CP" || code === "MON" || code === "COR") g.add(this.rangePole(p.name, code));
		else g.add(this.hubStake(p.name, code));
		return g;
	}
	hydrant(name) {
		const g = new Group();
		const red = this.track("hydrant", new MeshLambertMaterial({ color: 9124402 }));
		const silver = this.track("cap", new MeshLambertMaterial({ color: 9080716 }));
		const barrel = new Mesh(new CylinderGeometry(.28, .34, 2.5, 10), red);
		barrel.position.y = 1.25;
		barrel.userData = {
			target: true,
			label: name,
			code: "FH",
			kind: "feature"
		};
		const cap = new Mesh(new SphereGeometry(.26, 10, 8), silver);
		cap.position.y = 2.6;
		cap.userData = barrel.userData;
		const arm = new Mesh(new CylinderGeometry(.1, .1, 1.1, 8), red);
		arm.rotation.z = Math.PI / 2;
		arm.position.y = 1.7;
		arm.userData = barrel.userData;
		g.add(barrel, cap, arm);
		const spr = this.labelSprite(name);
		spr.position.y = 3.4;
		g.add(spr);
		return g;
	}
	powerPole(name) {
		const g = new Group();
		const wood = this.track("ppole", new MeshLambertMaterial({ color: 5916212 }));
		const pole = new Mesh(new CylinderGeometry(.38, .48, 38, 8), wood);
		pole.position.y = 19;
		pole.userData = {
			target: true,
			label: name,
			code: "POLE",
			kind: "feature"
		};
		const arm = new Mesh(new BoxGeometry(10, .28, .28), wood);
		arm.position.y = 36;
		arm.userData = pole.userData;
		g.add(pole, arm);
		const ins = this.track("ins", new MeshLambertMaterial({ color: 13617336 }));
		for (const x of [
			-4.2,
			0,
			4.2
		]) {
			const i = new Mesh(new CylinderGeometry(.12, .12, .4, 6), ins);
			i.position.set(x, 36.35, 0);
			g.add(i);
		}
		const tag = this.labelSprite(name);
		tag.position.y = 39.2;
		g.add(tag);
		return g;
	}
	singleTree() {
		const g = new Group();
		const trunk = new Mesh(new CylinderGeometry(.38, .55, 12, 6), this.mats.trunk ?? this.track("trunk", new MeshLambertMaterial({ color: 4864812 })));
		trunk.position.y = 6;
		trunk.userData = {
			target: true,
			label: "tree",
			code: "TREE",
			kind: "feature"
		};
		const crown = new Mesh(new ConeGeometry(4.4, 16, 7), this.mats.leaf ?? this.track("leaf", new MeshLambertMaterial({ color: 4151868 })));
		crown.position.y = 16;
		crown.userData = trunk.userData;
		g.add(trunk, crown);
		return g;
	}
	rangePole(name, code) {
		const g = new Group();
		const h = 8.2;
		const poleMat = this.mats.poleTex ?? this.track("poleTex", new MeshLambertMaterial({ map: this.poleTexture() }));
		const pole = new Mesh(new CylinderGeometry(.16, .18, h, 12), poleMat);
		pole.position.y = h / 2;
		pole.userData = {
			target: true,
			label: name,
			code,
			kind: "pole"
		};
		g.add(pole);
		const hub = new Mesh(new CylinderGeometry(.22, .28, .14, 8), this.track("hub", new MeshLambertMaterial({ color: 13616816 })));
		hub.position.y = .07;
		hub.userData = pole.userData;
		g.add(hub);
		const can = new Mesh(new CylinderGeometry(.18, .18, .32, 16), this.track("prismCan", new MeshLambertMaterial({
			color: 14715176,
			emissive: 4858376,
			emissiveIntensity: .35
		})));
		can.position.y = 5;
		can.userData = {
			target: true,
			label: name,
			code,
			kind: "prism"
		};
		g.add(can);
		const glassMat = this.track("prismGlass", new MeshPhongMaterial({
			color: 13625582,
			shininess: 140,
			transparent: true,
			opacity: .82,
			specular: 16777215
		}));
		for (let i = 0; i < 8; i++) {
			const cube = new Mesh(new BoxGeometry(.1, .12, .1), glassMat);
			const a = i / 8 * Math.PI * 2;
			cube.position.set(Math.cos(a) * .16, 5, Math.sin(a) * .16);
			cube.rotation.y = a;
			cube.userData = can.userData;
			g.add(cube);
		}
		const flag = new Mesh(new PlaneGeometry(2.4, 1.5), this.track("flag", new MeshLambertMaterial({
			color: 14834202,
			side: 2,
			emissive: 5904392,
			emissiveIntensity: .25
		})));
		flag.position.set(1.2, 7.35, 0);
		flag.userData = pole.userData;
		g.add(flag);
		const tag = this.labelSprite(name);
		tag.position.y = 8.6;
		g.add(tag);
		const hit = new Mesh(new CylinderGeometry(3.2, 3.2, 10.2, 8), this.track("hit", new MeshBasicMaterial({ visible: false })));
		hit.position.y = h / 2;
		hit.userData = {
			target: true,
			label: name,
			code,
			kind: "prism"
		};
		g.add(hit);
		return g;
	}
	hubStake(name, code) {
		const g = new Group();
		const wood = this.track("lath", new MeshLambertMaterial({ color: 12363130 }));
		const lath = new Mesh(new BoxGeometry(.1, 4.2, .28), wood);
		lath.position.y = 2.1;
		lath.userData = {
			target: true,
			label: name,
			code,
			kind: "feature"
		};
		const hub = new Mesh(new CylinderGeometry(.2, .24, .14, 8), this.track("hub2", new MeshLambertMaterial({ color: 14209212 })));
		hub.position.y = .07;
		hub.userData = lath.userData;
		const flag = new Mesh(new PlaneGeometry(1.8, 1.1), this.track("flag", new MeshLambertMaterial({
			color: 14834202,
			side: 2,
			emissive: 5904392,
			emissiveIntensity: .25
		})));
		flag.position.set(.95, 3.9, 0);
		flag.userData = lath.userData;
		const label = this.labelSprite(name);
		label.position.y = 5.1;
		g.add(lath, hub, flag, label);
		const hit = new Mesh(new CylinderGeometry(2.4, 2.4, 5, 8), this.track("hit", new MeshBasicMaterial({ visible: false })));
		hit.position.y = 2.2;
		hit.userData = lath.userData;
		g.add(hit);
		return g;
	}
	labelSprite(text) {
		const c = document.createElement("canvas");
		c.width = 384;
		c.height = 96;
		const ctx = c.getContext("2d");
		ctx.clearRect(0, 0, 384, 96);
		ctx.fillStyle = "rgba(11,13,12,0.88)";
		ctx.fillRect(8, 12, 368, 72);
		ctx.strokeStyle = "#e25a1a";
		ctx.lineWidth = 4;
		ctx.strokeRect(10, 14, 364, 68);
		ctx.fillStyle = "#f4f1ea";
		ctx.font = "700 52px 'IBM Plex Mono', monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(text, 192, 50);
		const tex = new CanvasTexture(c);
		tex.colorSpace = SRGBColorSpace;
		this.disposables.push(tex);
		const mat = new SpriteMaterial({
			map: tex,
			transparent: true,
			depthTest: true,
			sizeAttenuation: true
		});
		this.disposables.push(mat);
		const s = new Sprite(mat);
		s.scale.set(8.5, 2.15, 1);
		s.center.set(.5, 0);
		s.raycast = () => void 0;
		return s;
	}
	buildForesight() {
		const pole = this.rangePole("FS", "FS");
		pole.position.copy(this.toVec(this.origin.n - 16, this.origin.e + 82, this.groundY));
		this.scene.add(pole);
		const barn = this.track("barn", new MeshLambertMaterial({ color: 9067072 }));
		const roof = this.track("barnRoof", new MeshLambertMaterial({ color: 3815476 }));
		const body = new Mesh(new BoxGeometry(48, 16, 32), barn);
		const p = this.toVec(this.origin.n - 118, this.origin.e + 310, this.groundY + 8);
		body.position.copy(p);
		body.userData = {
			target: true,
			label: "barn",
			code: "BLDG",
			kind: "feature"
		};
		this.scene.add(body);
		this.addGable(p.x, this.groundY + 16, p.z, 48, 32, 10, roof, body.userData);
	}
	buildSilo() {
		const metal = this.track("silo", new MeshLambertMaterial({ color: 9080980 }));
		const cap = this.track("siloCap", new MeshLambertMaterial({ color: 6975088 }));
		const body = new Mesh(new CylinderGeometry(8, 8.4, 36, 14), metal);
		const p = this.toVec(this.origin.n + 18, this.origin.e + 620, this.groundY + 18);
		body.position.copy(p);
		body.userData = {
			target: true,
			label: "silo",
			code: "BLDG",
			kind: "feature"
		};
		const roof = new Mesh(new ConeGeometry(8.8, 6, 14), cap);
		roof.position.set(p.x, this.groundY + 39, p.z);
		roof.userData = body.userData;
		this.scene.add(body, roof);
	}
	buildGate() {
		const steel = this.track("gate", new MeshLambertMaterial({ color: 6052438 }));
		const n = this.origin.n - 18;
		const e = this.origin.e + 348;
		const postL = new Mesh(new BoxGeometry(.28, 5.2, .28), steel);
		postL.position.copy(this.toVec(n - 6, e, this.groundY + 2.6));
		const postR = new Mesh(new BoxGeometry(.28, 5.2, .28), steel);
		postR.position.copy(this.toVec(n + 6, e, this.groundY + 2.6));
		const rail = new Mesh(new BoxGeometry(12, .12, .12), steel);
		rail.position.copy(this.toVec(n, e, this.groundY + 4.4));
		for (const obj of [
			postL,
			postR,
			rail
		]) {
			obj.userData = {
				target: true,
				label: "gate",
				code: "FENCE",
				kind: "feature"
			};
			this.scene.add(obj);
		}
		for (let i = 0; i < 6; i++) {
			const bar = new Mesh(new BoxGeometry(.08, 4.2, .08), steel);
			bar.position.copy(this.toVec(n - 5 + i * 2, e, this.groundY + 2.2));
			bar.userData = {
				target: true,
				label: "gate",
				code: "FENCE",
				kind: "feature"
			};
			this.scene.add(bar);
		}
	}
	buildYardTrees() {
		const spots = [
			[this.origin.n - 48, this.origin.e + 92],
			[this.origin.n - 78, this.origin.e - 150],
			[this.origin.n - 190, this.origin.e + 130],
			[this.origin.n - 30, this.origin.e - 250]
		];
		for (const [n, e] of spots) {
			const t = this.singleTree();
			t.position.copy(this.toVec(n, e, this.groundY));
			this.scene.add(t);
		}
	}
	buildClouds() {
		const mat = this.track("cloud", new MeshLambertMaterial({
			color: 15197404,
			transparent: true,
			opacity: .55
		}));
		const rnd = rng(21);
		for (let i = 0; i < 8; i++) {
			const puff = new Mesh(new SphereGeometry(40 + rnd() * 50, 8, 6), mat);
			puff.scale.y = .28;
			puff.position.set((rnd() - .5) * 1400, this.groundY + 220 + rnd() * 80, (rnd() - .5) * 1400);
			this.clouds.add(puff);
		}
	}
};
function Viewfinder({ videoRef, cameraOn, ha, za, az, roll, held, job, stationPt, hi, hfov, onHfov, onAim, onRange, fireNonce = 0, firing = false, preview = null }) {
	const hudRef = (0, import_react.useRef)(null);
	const worldRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const [hit, setHit] = (0, import_react.useState)(null);
	const view = (0, import_react.useRef)({
		az,
		za,
		roll,
		n: 0,
		e: 0,
		z: 0,
		hi,
		hfov,
		points: job.points,
		occ: stationPt?.id ?? null
	});
	view.current = {
		az,
		za,
		roll,
		n: stationPt?.n ?? 1e4,
		e: stationPt?.e ?? 5e3,
		z: stationPt?.z ?? 850,
		hi,
		hfov,
		points: job.points,
		occ: stationPt?.id ?? null
	};
	const onRangeRef = (0, import_react.useRef)(onRange);
	onRangeRef.current = onRange;
	const onHfovRef = (0, import_react.useRef)(onHfov);
	onHfovRef.current = onHfov;
	const onAimRef = (0, import_react.useRef)(onAim);
	onAimRef.current = onAim;
	const siteRef = (0, import_react.useRef)(null);
	const dragging = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (cameraOn) return;
		const canvas = worldRef.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap) return;
		const site = new SiteScene(canvas, {
			n: view.current.n,
			e: view.current.e
		}, view.current.z);
		siteRef.current = site;
		let lastKey = "";
		let raf = 0;
		let last = performance.now();
		const resize = () => {
			site.resize(wrap.clientWidth, wrap.clientHeight);
			site.setHfov(view.current.hfov, wrap.clientWidth / Math.max(wrap.clientHeight, 1));
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(wrap);
		const loop = (now) => {
			const dt = Math.min(.1, (now - last) / 1e3);
			last = now;
			const v = view.current;
			const aspect = wrap.clientWidth / Math.max(wrap.clientHeight, 1);
			site.setHfov(v.hfov, aspect);
			site.setView(v.az, v.za, v.roll, v.n, v.e, v.z + v.hi);
			site.syncPoints(v.points, v.occ);
			site.tick(dt);
			const ranged = site.range();
			if (!dragging.current) {
				const pull = site.nearest(v.az, v.za, Math.min(.85, v.hfov * .08));
				if (pull && Math.hypot(pull.dAz, pull.dZa) > .03) onAimRef.current(pull.dAz * Math.min(.08, dt * 2.2), pull.dZa * Math.min(.08, dt * 2.2));
			}
			const key = ranged ? `${ranged.label}:${ranged.kind}:${ranged.sd.toFixed(2)}` : "";
			if (key !== lastKey) {
				lastKey = key;
				setHit(ranged);
				onRangeRef.current(ranged);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			siteRef.current = null;
			site.dispose();
		};
	}, [
		cameraOn,
		stationPt?.id,
		job.id
	]);
	(0, import_react.useEffect)(() => {
		if (!fireNonce) return;
		siteRef.current?.fire();
	}, [fireNonce]);
	(0, import_react.useEffect)(() => {
		const canvas = hudRef.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const draw = () => {
			const dpr = window.devicePixelRatio || 1;
			const w = wrap.clientWidth;
			const h = wrap.clientHeight;
			if (w < 2 || h < 2) return;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
			drawHud(ctx, w, h, {
				ha,
				za,
				az,
				roll,
				held,
				units: UNIT_LABEL[job.units],
				hit,
				hfov,
				firing,
				points: job.points,
				station: stationPt,
				preview
			});
		};
		draw();
		const ro = new ResizeObserver(draw);
		ro.observe(wrap);
		return () => ro.disconnect();
	}, [
		ha,
		za,
		az,
		roll,
		held,
		job.units,
		hit,
		hfov,
		firing,
		job.points,
		stationPt,
		preview
	]);
	const ptr = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "relative min-h-64 flex-1 touch-none overflow-hidden bg-bg select-none",
		style: { touchAction: "none" },
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			ptr.current = {
				x: e.clientX,
				y: e.clientY
			};
			dragging.current = true;
		},
		onPointerMove: (e) => {
			if (!ptr.current) return;
			const wrap = wrapRef.current;
			if (!wrap) return;
			const degPerPx = hfov / Math.max(wrap.clientWidth, 1);
			const dx = e.clientX - ptr.current.x;
			const dy = e.clientY - ptr.current.y;
			ptr.current = {
				x: e.clientX,
				y: e.clientY
			};
			onAim(dx * degPerPx, dy * degPerPx);
		},
		onPointerUp: () => {
			ptr.current = null;
			dragging.current = false;
		},
		onPointerCancel: () => {
			ptr.current = null;
			dragging.current = false;
		},
		onWheel: (e) => {
			e.preventDefault();
			const next = clampHfov(hfov * (e.deltaY > 0 ? 1.12 : .89));
			onHfovRef.current(next);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				className: cameraOn ? "pointer-events-none absolute inset-0 size-full object-cover opacity-100" : "pointer-events-none absolute inset-0 size-full object-cover opacity-0",
				playsInline: true,
				muted: true,
				autoPlay: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: worldRef,
				className: cameraOn ? "hidden" : "pointer-events-none absolute inset-0 size-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: hudRef,
				className: "pointer-events-none absolute inset-0 size-full"
			})
		]
	});
}
function wrapDelta(a, b) {
	let d = a - b;
	while (d > 180) d -= 360;
	while (d < -180) d += 360;
	return d;
}
function drawHud(ctx, w, h, args) {
	const { az, roll, held, units, hit, hfov, firing, points, station, preview } = args;
	const cx = w / 2;
	const cy = h / 2;
	const r = Math.min(w, h) * .48;
	ctx.fillStyle = "rgba(6, 8, 7, 0.92)";
	ctx.beginPath();
	ctx.rect(0, 0, w, h);
	ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
	ctx.fill();
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, w, h);
	ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
	ctx.clip();
	ctx.fillStyle = "rgba(11,13,12,0.55)";
	ctx.fillRect(0, 0, w, 32);
	ctx.font = "500 11px 'IBM Plex Mono', monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	const px = w / hfov;
	for (let deg = Math.floor(az - hfov / 2 - 2); deg <= az + hfov / 2 + 2; deg++) {
		const d = (deg % 360 + 360) % 360;
		const x = cx + wrapDelta(d, az) * px;
		const major = d % 10 === 0;
		ctx.strokeStyle = major ? "rgba(183,224,196,0.7)" : "rgba(183,224,196,0.28)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x, 4);
		ctx.lineTo(x, major ? 15 : 10);
		ctx.stroke();
		if (d % 30 === 0) {
			const label = d === 0 ? "N" : d === 90 ? "E" : d === 180 ? "S" : d === 270 ? "W" : String(d);
			ctx.fillStyle = "#b7e0c4";
			ctx.fillText(label, x, 16);
		}
	}
	ctx.restore();
	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.clip();
	const vg = ctx.createRadialGradient(cx, cy, r * .38, cx, cy, r);
	vg.addColorStop(0, "rgba(0,0,0,0)");
	vg.addColorStop(.7, "rgba(10,14,12,0.06)");
	vg.addColorStop(1, "rgba(4,6,5,0.55)");
	ctx.fillStyle = vg;
	ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
	ctx.restore();
	ctx.strokeStyle = "rgba(183,224,196,0.22)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.stroke();
	ctx.strokeStyle = "rgba(11,13,12,0.92)";
	ctx.lineWidth = 12;
	ctx.beginPath();
	ctx.arc(cx, cy, r + 7, 0, Math.PI * 2);
	ctx.stroke();
	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
	ctx.clip();
	ctx.translate(cx, cy);
	ctx.rotate(-roll * Math.PI / 180);
	const stadia = STADIA_HALF_DEG * (r * 2 / hfov);
	const arm = r * .72;
	const gap = 7;
	ctx.strokeStyle = "rgba(12,14,13,0.92)";
	ctx.lineWidth = 1.35;
	ctx.beginPath();
	ctx.moveTo(-arm, 0);
	ctx.lineTo(-7, 0);
	ctx.moveTo(gap, 0);
	ctx.lineTo(arm, 0);
	ctx.moveTo(0, -arm);
	ctx.lineTo(0, -7);
	ctx.moveTo(0, gap);
	ctx.lineTo(0, arm);
	ctx.stroke();
	ctx.strokeStyle = "rgba(183,224,196,0.35)";
	ctx.lineWidth = .7;
	ctx.beginPath();
	ctx.moveTo(-arm, 0);
	ctx.lineTo(-7, 0);
	ctx.moveTo(gap, 0);
	ctx.lineTo(arm, 0);
	ctx.moveTo(0, -arm);
	ctx.lineTo(0, -7);
	ctx.moveTo(0, gap);
	ctx.lineTo(0, arm);
	ctx.stroke();
	const tick = 9;
	ctx.strokeStyle = "rgba(12,14,13,0.9)";
	ctx.lineWidth = 1.2;
	for (const s of [-stadia, stadia]) {
		ctx.beginPath();
		ctx.moveTo(-9, s);
		ctx.lineTo(tick, s);
		ctx.stroke();
	}
	ctx.fillStyle = hit?.kind === "prism" ? "rgba(208,90,70,0.95)" : "#b7e0c4";
	ctx.beginPath();
	ctx.arc(0, 0, hit?.kind === "prism" ? 2.2 : 1.2, 0, Math.PI * 2);
	ctx.fill();
	if (hit?.kind === "prism") {
		ctx.fillStyle = "rgba(208,90,70,0.22)";
		ctx.beginPath();
		ctx.arc(0, 0, 7, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
	const vialW = 64;
	const vialX = cx + r - 16;
	const vialY = cy;
	const rollPx = Math.max(-22, Math.min(22, roll * 1.8));
	ctx.strokeStyle = "rgba(183,224,196,0.4)";
	ctx.lineWidth = 1;
	ctx.strokeRect(vialX - 5, vialY - vialW / 2, 10, vialW);
	ctx.beginPath();
	ctx.moveTo(vialX - 7, vialY);
	ctx.lineTo(vialX + 7, vialY);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(vialX, vialY + rollPx, 3.5, 0, Math.PI * 2);
	ctx.fillStyle = Math.abs(roll) > 4 ? "#d07a6a" : "#7dba8c";
	ctx.fill();
	ctx.textAlign = "center";
	ctx.font = "600 11px 'IBM Plex Mono', monospace";
	ctx.fillStyle = held ? "#c4b07a" : "rgba(183,224,196,0.85)";
	ctx.fillText(held ? "HOLD" : magLabel(hfov), cx, cy - r + 20);
	ctx.textAlign = "left";
	ctx.font = "500 10px 'IBM Plex Mono', monospace";
	ctx.fillStyle = "#8b948c";
	ctx.fillText(units, 12, 50);
	if (hit) {
		ctx.textAlign = "center";
		ctx.font = "500 12px 'IBM Plex Mono', monospace";
		ctx.fillStyle = hit.kind === "prism" ? "#b7e0c4" : "#c4b07a";
		const mode = hit.kind === "prism" ? "IR" : hit.kind === "ground" ? "RL" : "IR";
		ctx.fillText(`${mode}  ${hit.label}  ${hit.sd.toFixed(3)} ${units}`, cx, cy + r - 26);
		if (hit.kind === "prism") {
			ctx.font = "700 11px 'Barlow', sans-serif";
			ctx.fillStyle = "#7dba8c";
			ctx.fillText("LOCK", cx, cy + r - 12);
		}
	}
	if (hit && hit.kind !== "ground") {
		const s = 18;
		ctx.strokeStyle = hit.kind === "prism" ? "#ff4d3a" : "#ffcd00";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(cx - s, cy - s + 8);
		ctx.lineTo(cx - s, cy - s);
		ctx.lineTo(cx - s + 8, cy - s);
		ctx.moveTo(cx + s - 8, cy - s);
		ctx.lineTo(cx + s, cy - s);
		ctx.lineTo(cx + s, cy - s + 8);
		ctx.moveTo(cx + s, cy + s - 8);
		ctx.lineTo(cx + s, cy + s);
		ctx.lineTo(cx + s - 8, cy + s);
		ctx.moveTo(cx - s + 8, cy + s);
		ctx.lineTo(cx - s, cy + s);
		ctx.lineTo(cx - s, cy + s - 8);
		ctx.stroke();
	}
	if (firing) {
		ctx.strokeStyle = "rgba(183,224,196,0.85)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(cx, cy, 16, 0, Math.PI * 2);
		ctx.stroke();
	}
	drawMinimap(ctx, w - 96, 38, 78, points, station, az, preview);
}
function drawMinimap(ctx, x, y, size, points, station, az, preview) {
	const r = size / 2;
	const cx = x + r;
	const cy = y + r;
	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fillStyle = "rgba(12,16,14,0.72)";
	ctx.fill();
	ctx.strokeStyle = "rgba(183,224,196,0.45)";
	ctx.lineWidth = 1.2;
	ctx.stroke();
	ctx.clip();
	const sc = size / 420;
	const n0 = station?.n ?? 1e4;
	const e0 = station?.e ?? 5e3;
	const toX = (e) => cx + (e - e0) * sc;
	const toY = (n) => cy - (n - n0) * sc;
	ctx.strokeStyle = "rgba(255,255,255,0.08)";
	ctx.beginPath();
	ctx.moveTo(cx - r, cy);
	ctx.lineTo(cx + r, cy);
	ctx.moveTo(cx, cy - r);
	ctx.lineTo(cx, cy + r);
	ctx.stroke();
	for (const p of points) {
		ctx.fillStyle = p.kind === "control" ? "#ffcd00" : "#e8ece8";
		ctx.beginPath();
		ctx.arc(toX(p.e), toY(p.n), p.kind === "control" ? 2.4 : 1.6, 0, Math.PI * 2);
		ctx.fill();
	}
	if (preview) {
		ctx.fillStyle = "#ff8a00";
		ctx.beginPath();
		ctx.arc(toX(preview.e), toY(preview.n), 2.6, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.fillStyle = "#7dba8c";
	ctx.beginPath();
	ctx.arc(cx, cy, 3, 0, Math.PI * 2);
	ctx.fill();
	const rad = (az - 90) * Math.PI / 180;
	ctx.strokeStyle = "#b7e0c4";
	ctx.lineWidth = 1.4;
	ctx.beginPath();
	ctx.moveTo(cx, cy);
	ctx.lineTo(cx + Math.cos(rad) * (r - 6), cy + Math.sin(rad) * (r - 6));
	ctx.stroke();
	ctx.restore();
	ctx.font = "600 9px 'Barlow', sans-serif";
	ctx.fillStyle = "#b7e0c4";
	ctx.textAlign = "center";
	ctx.fillText("N", cx, y - 2);
}
var TABS = [
	{
		id: "sight",
		label: "Meas",
		icon: Crosshair
	},
	{
		id: "station",
		label: "Station",
		icon: Compass
	},
	{
		id: "map",
		label: "Map",
		icon: Map$1
	},
	{
		id: "points",
		label: "Points",
		icon: List
	}
];
function FieldApp() {
	const hydrated = useSurvey((s) => s.hydrated);
	const job = useJob();
	const storeShot = useSurvey((s) => s.storeShot);
	const occupy = useSurvey((s) => s.occupy);
	const inst = useInstrument();
	const cam = useCamera();
	const gps = useGps();
	const [tab, setTab] = (0, import_react.useState)("sight");
	const [jobsOpen, setJobsOpen] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("edm");
	const [distStr, setDistStr] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("TP");
	const [desc, setDesc] = (0, import_react.useState)("");
	const [ptName, setPtName] = (0, import_react.useState)("");
	const [padOpen, setPadOpen] = (0, import_react.useState)(false);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [laser, setLaser] = (0, import_react.useState)(null);
	const [hfov, setHfov] = (0, import_react.useState)(16);
	const [distMode, setDistMode] = (0, import_react.useState)("sd");
	const [measuring, setMeasuring] = (0, import_react.useState)(false);
	const [helpOpen, setHelpOpen] = (0, import_react.useState)(false);
	const [firing, setFiring] = (0, import_react.useState)(false);
	const [fireNonce, setFireNonce] = (0, import_react.useState)(0);
	const [floatText, setFloatText] = (0, import_react.useState)(null);
	const [score, setScore] = (0, import_react.useState)(0);
	const nudgeRef = (0, import_react.useRef)(inst.addDelta);
	nudgeRef.current = (dHa, dZa) => inst.addDelta(dHa, dZa);
	(0, import_react.useEffect)(() => {
		if (job) setPtName(job.nextName);
	}, [job?.id, job?.nextName]);
	(0, import_react.useEffect)(() => {
		try {
			if (sessionStorage.getItem("sightline-help") !== "1") setHelpOpen(true);
		} catch {
			setHelpOpen(true);
		}
	}, []);
	const stationPt = job?.station ? findPoint(job.points, job.station.pointId) : void 0;
	const reading = inst.reading();
	const az = job ? liveAzimuth(job.station, reading.ha, reading.magAz, job.declination) : reading.ha;
	const preview = (0, import_react.useMemo)(() => {
		if (!job?.station || !stationPt) return null;
		let dist = Number(distStr);
		let distIsHd = mode === "hd" || mode === "ground";
		if (mode === "ground") {
			const hd = depressionHd(job.station.hi, reading.za);
			if (hd == null) return null;
			dist = hd;
			distIsHd = true;
		}
		if (!(dist > 0) && mode !== "ground") return null;
		return radiation({
			station: stationPt,
			hi: job.station.hi,
			ht: laser?.kind === "prism" || laser?.kind === "pole" ? job.station.ht : 0,
			az,
			za: reading.za,
			distance: dist,
			distIsHd
		});
	}, [
		job,
		stationPt,
		distStr,
		mode,
		az,
		reading.za,
		laser?.kind
	]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReticleMark, { className: "size-16 text-readout" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-[0.28em] text-muted uppercase",
			children: "Sightline"
		})]
	});
	if (!job) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobsSheet, { onClose: () => void 0 })
	});
	const active = job;
	const u = UNIT_LABEL[active.units];
	const plateOff = Math.abs(inst.roll) > 6;
	function flash(text) {
		setToast(text);
		window.setTimeout(() => setToast(null), 2200);
	}
	function store() {
		if (mode === "gps" && gps.status !== "on") gps.start();
		const dist = Number(distStr) > 0 ? Number(distStr) : laser?.sd ?? 0;
		if (!(dist > 0) && mode !== "ground" && mode !== "gps") {
			flash("Aim at something in the scope first — wait for LOCK");
			return;
		}
		const prism = laser?.kind === "prism" || laser?.kind === "pole";
		const res = storeShot({
			name: ptName.trim() || active.nextName,
			code: laser?.code || code,
			desc: laser?.label || desc,
			ha: reading.ha,
			za: reading.za,
			magAz: reading.magAz,
			distance: dist,
			mode,
			ht: prism ? active.station?.ht : 0,
			gps: mode === "gps" && gps.fix ? {
				lat: gps.fix.lat,
				lon: gps.fix.lon,
				accuracy: gps.fix.accuracy,
				alt: gps.fix.alt
			} : void 0
		});
		if ("error" in res) {
			if (res.error.includes("distance")) setPadOpen(true);
			flash(res.error);
			return;
		}
		flash(`Meas ${res.name}  ${res.desc || res.code}  SD ${dist.toFixed(3)}`);
		setFloatText(`${res.name}  ${dist.toFixed(3)} ${u}`);
		window.setTimeout(() => setFloatText(null), 1400);
		setScore((s) => s + 1);
		setPtName(useSurvey.getState().currentJob()?.nextName ?? "");
		setDesc("");
		setSelectedId(res.id);
	}
	function fire() {
		if (firing) return;
		if (!laser) {
			flash("Nothing in the beam — point the crosshair at an object");
			return;
		}
		setFiring(true);
		setMeasuring(true);
		setFireNonce((n) => n + 1);
		window.setTimeout(() => {
			store();
			setFiring(false);
			setMeasuring(false);
		}, 220);
	}
	const pane = tab === "station" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationPanel, { gps }) : tab === "points" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PointsPanel, {
		selectedId,
		onSelect: setSelectedId
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanMap, {
		job,
		selectedId,
		onSelect: setSelectedId,
		preview: preview ? {
			n: preview.nez.n,
			e: preview.nez.e,
			label: laser?.label || ptName || "SHOT"
		} : null
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-dvh flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-2 border-b border-border bg-[#e8eaed] px-3 py-1.5 pt-[max(0.4rem,env(safe-area-inset-top))] text-[#1a1a1a]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setJobsOpen(true),
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-8 items-center justify-center rounded-sm bg-[#ffcd00] text-xs font-bold",
						children: "☰"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[10px] font-semibold tracking-[0.14em] text-[#555] uppercase",
							children: "Trimble Access · Meas"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block max-w-[11rem] truncate text-sm font-semibold",
							children: job.name
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-3 font-mono text-[11px] text-[#333]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GM-50" }),
						job.station ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"HI ",
							job.station.hi.toFixed(2),
							" · HT ",
							job.station.ht.toFixed(2)
						] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[#2e7d32]",
							children: "● TS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-8 items-center justify-center rounded-sm border border-[#c8c8c8] bg-white text-sm font-bold text-[#333]",
							"aria-label": "How to use",
							onClick: () => setHelpOpen(true),
							children: "?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Enable compass",
							onClick: () => void inst.enableSensors(),
							className: inst.sensorsOn ? "text-[#1565c0]" : "text-[#777]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Open telescope camera",
							onClick: () => cam.status === "on" ? cam.stop() : void cam.start(),
							className: cam.status === "on" ? "text-[#1565c0]" : "text-[#777]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Aperture, { className: "size-4" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: cn("flex min-h-0 min-w-0 flex-col", tab === "sight" ? "flex-1" : "hidden md:flex md:w-1/2 md:flex-none lg:w-5/12"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-h-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewfinder, {
										videoRef: cam.videoRef,
										cameraOn: cam.status === "on",
										ha: reading.ha,
										za: reading.za,
										az,
										roll: inst.roll,
										held: inst.held,
										job,
										stationPt: stationPt ?? null,
										hi: job.station?.hi ?? 5.15,
										hfov,
										onHfov: setHfov,
										onAim: (dHa, dZa) => inst.addDelta(dHa, dZa),
										fireNonce,
										firing,
										preview: preview ? {
											n: preview.nez.n,
											e: preview.nez.e
										} : null,
										onRange: (hit) => {
											setLaser(hit);
											if (hit && (mode === "edm" || mode === "hd")) {
												const sd = hit.sd;
												const zaRad = reading.za * Math.PI / 180;
												setDistStr((mode === "hd" ? sd * Math.sin(zaRad) : sd).toFixed(3));
											}
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "absolute top-2 left-2 z-10 h-9 rounded-md border border-border bg-glass px-3 font-mono text-xs tracking-wide text-readout outline-none select-none [-webkit-tap-highlight-color:transparent]",
										onClick: () => setHfov(hfov <= 1.7 ? 16 : SCOPE_HFOV),
										children: hfov <= 1.7 ? "FIND" : "30×"
									}),
									floatText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "pointer-events-none absolute inset-x-0 top-1/3 z-20 text-center font-mono text-lg font-semibold text-[#ffcd00] drop-shadow",
										children: floatText
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Objectives, { points: job.points }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LookStick, {
										nudgeRef,
										hfov
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeasButton, {
										locked: Boolean(laser),
										onMeas: fire
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gm50Panel, {
								v: reading.za,
								hr: reading.ha,
								sd: distStr ? Number(distStr) : laser?.sd ?? null,
								hd: preview?.hd ?? (distStr ? Number(distStr) * Math.sin(reading.za * Math.PI / 180) : laser ? laser.sd * Math.sin(reading.za * Math.PI / 180) : null),
								distMode,
								prism: laser?.kind === "prism",
								held: inst.held,
								measuring,
								units: job.units,
								levelOk: !plateOff,
								hit: laser,
								onMeas: fire,
								onToggleDist: () => {
									setDistMode((d) => d === "sd" ? "hd" : "sd");
									setMode((m) => m === "hd" ? "edm" : m);
								},
								onZero: () => {
									if (!job.station) {
										flash("Occupy first");
										return;
									}
									occupy({
										pointId: job.station.pointId,
										hi: job.station.hi,
										ht: job.station.ht,
										mode: job.station.orientationMode,
										azAtZero: az,
										backsightId: job.station.backsightId,
										bsHa: 0
									});
									inst.setManual({ ha: 0 });
									flash("0SET — HR 0°00'00\"");
								},
								onHold: () => inst.hold(),
								onBs: () => {
									const bs = job.station?.backsightId ? findPoint(job.points, job.station.backsightId) : void 0;
									flash(bs ? `B.S. ${bs.name}` : "No backsight");
								},
								onEnter: fire,
								enterDisabled: !job.station && mode !== "gps"
							}),
							preview && stationPt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "border-b border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted",
								children: [
									"AZ ",
									formatDms(az, 0),
									" ",
									toBearing(az),
									" · ΔZ ",
									preview.nez.z - stationPt.z >= 0 ? "+" : "",
									(preview.nez.z - stationPt.z).toFixed(3),
									" · N ",
									formatCoord(preview.nez.n, job.units),
									" E ",
									formatCoord(preview.nez.e, job.units)
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-12 gap-2 bg-surface px-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "col-span-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sr-only",
											children: "Point"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: ptName,
											onChange: (e) => setPtName(e.target.value),
											"aria-label": "Point number"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "col-span-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sr-only",
											children: "Code"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: code,
											onChange: (e) => setCode(e.target.value),
											className: "h-11 w-full rounded-md border border-border bg-bg px-2 text-sm text-fg",
											"aria-label": "Feature code",
											children: FIELD_CODES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: c,
												children: c
											}, c))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "primary",
										className: "col-span-4",
										onClick: fire,
										disabled: !job.station && mode !== "gps",
										children: "Meas"
									})
								]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: cn("min-h-0 min-w-0 flex-col bg-surface", tab === "sight" ? "hidden md:flex md:flex-1 md:border-l md:border-border" : "flex flex-1 md:border-l md:border-border"),
					children: pane
				})]
			}),
			tab === "sight" || tab === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-t border-border bg-raised px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "min-w-0 flex-1 font-mono text-xs text-readout",
					children: laser ? `EDM ${laser.kind === "prism" ? "IR" : "RL"}  ${laser.label}  SD ${laser.sd.toFixed(3)} ${u}` : "Point the gun at a pole, building, or ground — EDM ranges what you aim at"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					onClick: fire,
					disabled: !job.station && mode !== "gps",
					children: "Meas"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "grid grid-cols-4 border-t border-border bg-surface pb-[max(0.4rem,env(safe-area-inset-bottom))]",
				children: TABS.map((t) => {
					const Icon = t.icon;
					const on = tab === t.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						className: cn("flex flex-col items-center gap-0.5 py-2 text-xs tracking-wide uppercase", on ? "text-readout" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-5",
							strokeWidth: 1.75
						}), t.label]
					}, t.id);
				})
			}),
			jobsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-40 bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobsSheet, { onClose: () => setJobsOpen(false) })
			}) : null,
			padOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-30 flex items-end justify-center bg-glass p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-xl border border-border bg-surface p-4 shadow-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumPad, {
						label: mode === "hd" ? `Horizontal distance (${u})` : `Slope distance (${u})`,
						value: distStr,
						onChange: setDistStr,
						onCommit: (n) => {
							setDistStr(String(n));
							setPadOpen(false);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "subtle",
						className: "mt-2 w-full",
						onClick: () => setPadOpen(false),
						children: "Cancel"
					})]
				})
			}) : null,
			helpOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-50 flex items-end justify-center bg-black/55 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-xl border border-border bg-surface p-5 text-fg shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-[0.16em] text-muted uppercase",
							children: "How to run this gun"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-xl font-semibold",
							children: "Point, measure, store"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-4 space-y-3 text-sm leading-relaxed text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-readout",
									children: "1. Point the gun."
								}), " Drag the telescope or use the tangent stick until the crosshair is on the object — a prism pole, stake, house, hydrant, or the ground. Every pin on the map is a pole or stake out there."] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-readout",
									children: "2. Meas."
								}), " F1 / MEAS / the yellow button fires the EDM. Slope distance is to whatever is under the crosshair (IR to a prism, reflectorless to everything else)."] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-readout",
									children: "3. Store."
								}), " That reading becomes a point (HA, ZA, SD → NEZ) on the map and a new stake in the world. FIND is the collimator; 30× is the scope."] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							className: "mt-5 w-full",
							onClick: () => {
								try {
									sessionStorage.setItem("sightline-help", "1");
								} catch {}
								setHelpOpen(false);
							},
							children: "Got it — point the gun"
						})
					]
				})
			}) : null,
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-16 z-50 flex justify-center px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md border border-border bg-raised px-3 py-2 font-mono text-xs text-readout shadow-panel",
					children: toast
				})
			}) : null
		]
	});
}
var GOALS = [
	{
		id: "fs",
		label: "FS prism",
		test: (p) => p.code === "FS" || /fs/i.test(p.desc)
	},
	{
		id: "house",
		label: "House",
		test: (p) => p.code === "BLDG" && /house|roof/i.test(p.desc)
	},
	{
		id: "barn",
		label: "Barn",
		test: (p) => /barn/i.test(p.desc)
	},
	{
		id: "silo",
		label: "Silo",
		test: (p) => /silo/i.test(p.desc)
	},
	{
		id: "tree",
		label: "Tree",
		test: (p) => p.code === "TREE" || /tree/i.test(p.desc)
	},
	{
		id: "gate",
		label: "Gate",
		test: (p) => /gate/i.test(p.desc)
	},
	{
		id: "mail",
		label: "Mailbox",
		test: (p) => /mail/i.test(p.desc)
	}
];
function Objectives({ points }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute top-12 left-2 z-10 max-w-[11rem] rounded-md border border-border bg-glass px-2 py-1.5 text-[10px] text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold tracking-wide text-readout uppercase",
			children: "Lot points"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-1 space-y-0.5",
			children: GOALS.map((g) => {
				const done = points.some((p) => g.test(p));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: done ? "text-ok line-through" : "text-muted",
					children: [
						done ? "✓" : "○",
						" ",
						g.label
					]
				}, g.id);
			})
		})]
	});
}
function LookStick({ nudgeRef, hfov }) {
	const wrap = (0, import_react.useRef)(null);
	const vec = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const raf = (0, import_react.useRef)(0);
	const held = (0, import_react.useRef)(false);
	const last = (0, import_react.useRef)(0);
	const hfovRef = (0, import_react.useRef)(hfov);
	hfovRef.current = hfov;
	const [knob, setKnob] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	function tick(now) {
		const dt = Math.min(.05, (now - last.current) / 1e3);
		last.current = now;
		const { x, y } = vec.current;
		const mag = Math.hypot(x, y);
		if (held.current && mag > .04) {
			const curved = mag * mag;
			const nx = x / mag * curved;
			const ny = y / mag * curved;
			const fov = Math.max(.12, hfovRef.current / 16);
			nudgeRef.current(nx * 17.2 * fov * dt, ny * 12.8 * fov * dt);
		}
		if (held.current) raf.current = requestAnimationFrame(tick);
	}
	function at(e) {
		const el = wrap.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
		const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
		const mag = Math.hypot(dx, dy);
		const s = mag > 1 ? 1 / mag : 1;
		vec.current = {
			x: dx * s,
			y: dy * s
		};
		setKnob({
			x: dx * s,
			y: dy * s
		});
	}
	function end() {
		held.current = false;
		vec.current = {
			x: 0,
			y: 0
		};
		setKnob({
			x: 0,
			y: 0
		});
		cancelAnimationFrame(raf.current);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrap,
		className: "absolute bottom-3 left-3 z-10 size-[5.75rem] touch-none rounded-full border border-[#3a403c] bg-[rgba(18,22,20,0.72)] shadow-[inset_0_0_0_1px_rgba(183,224,196,0.12)] outline-none select-none [-webkit-tap-highlight-color:transparent]",
		onPointerDown: (e) => {
			e.preventDefault();
			e.stopPropagation();
			e.currentTarget.setPointerCapture(e.pointerId);
			at(e);
			held.current = true;
			last.current = performance.now();
			cancelAnimationFrame(raf.current);
			raf.current = requestAnimationFrame(tick);
		},
		onPointerMove: (e) => {
			if (!held.current) return;
			at(e);
		},
		onPointerUp: end,
		onPointerCancel: end,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-2 rounded-full border border-[rgba(183,224,196,0.16)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute top-1/2 left-2 right-2 h-px bg-[rgba(183,224,196,0.12)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute top-2 bottom-2 left-1/2 w-px bg-[rgba(183,224,196,0.12)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute size-7 rounded-full border border-[#8aa090] bg-[#c5d4c8] shadow-[0_1px_4px_rgba(0,0,0,0.45)]",
				style: {
					left: `calc(50% + ${knob.x * 24}px - 0.875rem)`,
					top: `calc(50% + ${knob.y * 24}px - 0.875rem)`
				}
			})
		]
	});
}
function MeasButton({ locked, onMeas }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": "Measure",
		onPointerDown: (e) => {
			e.preventDefault();
			e.stopPropagation();
			onMeas();
		},
		className: cn("absolute right-3 bottom-3 z-10 size-[4.4rem] rounded-full border-4 text-[12px] font-bold tracking-wide uppercase outline-none select-none", "[-webkit-tap-highlight-color:transparent]", locked ? "border-[#8a6a18] bg-[#d4a428] text-[#2a2208] shadow-[0_0_16px_rgba(212,164,40,0.45)]" : "border-[#5a5030] bg-[#8a7428] text-[#2a2208]"),
		children: "Meas"
	});
}
function ReticleMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "11",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "3",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M16 2.5v7M16 22.5v7M2.5 16h7M22.5 16h7",
				stroke: "currentColor",
				strokeWidth: "1.2"
			})
		]
	});
}
function Home() {
	(0, import_react.useEffect)(() => {
		Promise.resolve(useSurvey.persist.rehydrate()).then(() => {
			useSurvey.getState().setHydrated();
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldApp, {});
}
//#endregion
export { Home as component };
