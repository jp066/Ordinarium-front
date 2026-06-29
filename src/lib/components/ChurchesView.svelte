<script lang="ts">
	import { MapPin, Phone, Mail, X, Search, ChevronUp, ChevronDown, Info, Navigation } from '@lucide/svelte';
	import logo from '$lib/assets/logo-removebg.png';

	interface Church {
		id: string;
		name: string;
		address: string;
		phone: string;
		email: string;
		lat: number;
		lng: number;
		bgImage?: string;
		schedules: { type: string; day: string; time: string }[];
	}

	interface Schedule {
		id: string;
		type: string;
		weekday: string;
		dateStr: string;
		timeStr: string;
		churchName: string;
		churchId: string;
		notes: string;
		confidenceScore: number;
	}

	let { 
		churches, 
		schedules, 
		selectedChurchId = $bindable(), 
		getIcon 
	} = $props<{
		churches: Church[];
		schedules: Schedule[];
		selectedChurchId: string;
		getIcon: (type: string) => any;
	}>();

	let showMapDetails = $state(true);
	let showChurchSelector = $state(false);
	let searchFilterQuery = $state('');
	let geoLoading = $state(false);
	let geoError = $state<string | null>(null);

	function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 6371;
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLng = (lng2 - lng1) * Math.PI / 180;
		const a = Math.sin(dLat / 2) ** 2 +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLng / 2) ** 2;
		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	function goToNearestChurch() {
		if (!navigator.geolocation) {
			geoError = 'Geolocalização não suportada neste dispositivo.';
			return;
		}
		geoLoading = true;
		geoError = null;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				if (!churches.length) { geoLoading = false; return; }
				const nearest = churches.reduce((best: any, church: Church) => {
					const d = haversineDistance(latitude, longitude, church.lat, church.lng);
					return !best || d < best.dist ? { church, dist: d } : best;
				}, null as any);
				selectedChurchId = nearest.church.id;
				geoLoading = false;
				geoError = null;
			},
			(err) => {
				geoLoading = false;
				geoError = err.code === 1 ? 'Permissão de localização negada.' : 'Não foi possível obter sua localização.';
			},
			{ timeout: 8000, maximumAge: 60000 }
		);
	}

	let searchChurchesList = $derived(
		churches.filter((c: Church) => 
			c.name.toLowerCase().includes(searchFilterQuery.toLowerCase()) || 
			c.address.toLowerCase().includes(searchFilterQuery.toLowerCase())
		)
	);

	let filteredSchedules = $derived(
		schedules.filter((s: Schedule) => s.churchId === selectedChurchId)
	);

	let selectedChurch = $derived(
		churches.find((c: Church) => c.id === selectedChurchId) || churches[0]
	);

	// Leaflet map bindings
	let map = $state<any>(null);
	let L = $state<any>(null);
	let markers: any[] = [];
	let tileLayer: any;

	function updateMapTiles() {
		if (map && L) {
			if (tileLayer && map.hasLayer(tileLayer)) {
				map.removeLayer(tileLayer);
			}

			// We are always dark mode now
			const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

			tileLayer = L.tileLayer(tileUrl, {
				maxZoom: 20,
				subdomains: 'abcd'
			}).addTo(map);
		}
	}

	function updateMapMarkers() {
		if (map && L && churches) {
			// Clear all existing markers from Leaflet map
			markers.forEach((m: any) => {
				if (map.hasLayer(m)) {
					map.removeLayer(m);
				}
			});
			markers = [];

			// Place markers for all churches
			churches.forEach((church: Church) => {
				const isActive = church.id === selectedChurchId;
				const customIcon = L.divIcon({
					className: 'custom-leaflet-marker',
					html: isActive
						? `<div class="relative flex items-center justify-center">
							<div class="absolute h-8 w-8 animate-ping rounded-full bg-[#c9a84c]/25 opacity-75"></div>
							<div class="relative h-5 w-5 rounded-full border-2 border-bg-card bg-[#c9a84c] shadow-[0_0_12px_rgba(201,168,76,0.8)]"></div>
						</div>`
						: `<div class="relative flex items-center justify-center">
							<div class="absolute h-5 w-5 animate-ping rounded-full bg-[#c9a84c]/15 opacity-70"></div>
							<div class="relative h-3.5 w-3.5 rounded-full border border-bg-card bg-[#c9a84c]/80 shadow-[0_0_8px_rgba(201,168,76,0.5)]"></div>
						</div>`,
					iconSize: isActive ? [28, 28] : [20, 20],
					iconAnchor: isActive ? [14, 14] : [10, 10]
				});
				
				const m = L.marker([church.lat, church.lng], { icon: customIcon }).addTo(map);
				m.on('click', () => {
					selectedChurchId = church.id;
					showMapDetails = true;
					triggerMapResize();
				});
				markers.push(m);
			});
		}
	}

	// Leaflet initialization action for dynamic mounting
	function initMapAction(node: HTMLDivElement) {
		let mapInstance: any;

		const setup = async () => {
			if (typeof window !== 'undefined') {
				if (!L) {
					L = await import('leaflet');
				}

				mapInstance = L.map(node, {
					zoomControl: false,
					attributionControl: false
				}).setView([selectedChurch.lat, selectedChurch.lng], 14);

				map = mapInstance;

				updateMapTiles();
				updateMapMarkers();

				setTimeout(() => {
					if (mapInstance) {
						mapInstance.invalidateSize();
					}
				}, 150);
			}
		};

		setup();

		return {
			destroy() {
				if (mapInstance) {
					markers = [];
					tileLayer = null;
					mapInstance.remove();
					if (map === mapInstance) {
						map = null;
					}
				}
			}
		};
	}

	function triggerMapResize() {
		setTimeout(() => {
			if (map) {
				map.invalidateSize();
			}
		}, 350); // Match CSS transition duration
	}

	// Update markers and pan view when selectedChurchId changes
	$effect(() => {
		if (map && L && selectedChurch) {
			updateMapMarkers();
			map.setView([selectedChurch.lat, selectedChurch.lng], 14);
		}
	});
</script>

<div class="flex-1 flex overflow-hidden relative">
	<!-- Left detail panel (40% width) - Toggleable details -->
	{#if showMapDetails}
		<aside class="w-full md:w-[380px] h-full bg-bg-card border-r border-border-dark flex flex-col z-10 shadow-2xl relative shrink-0 transition-all duration-300">
			<!-- Toggle Close Button -->
			<button 
				onclick={() => {
					showMapDetails = false;
					triggerMapResize();
				}}
				class="absolute top-4 right-4 flex items-center justify-center h-8 w-8 rounded-full border border-border-dark bg-bg-card/90 backdrop-blur-sm hover:bg-bg-card text-text-muted hover:text-text-main hover:border-brand-gold/30 shadow-sm z-20"
				title="Fechar Detalhes"
			>
				<X size={14} />
			</button>

			<!-- Header Details -->
			<div class="p-6 pb-4 border-b border-border-dark/50 flex flex-col gap-4 font-sans select-none">
				<div class="flex items-center gap-3">
					<div class="h-10 w-10 flex items-center justify-center rounded-xl bg-bg-dark/40 border border-border-dark shrink-0">
						<img src={logo} alt="Logo" class="h-6 w-6 object-contain">
					</div>
					<div>
						<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold">Paróquia Selecionada</span>
						<h2 class="text-lg font-bold text-text-main tracking-tight leading-snug line-clamp-2">{selectedChurch.name}</h2>
					</div>
				</div>
				
				<!-- Address & Contact Info -->
				<div class="space-y-2 text-text-muted text-xs bg-bg-dark/40 p-3 rounded-xl border border-border-dark/60">
					<div class="flex items-start gap-2.5">
						<MapPin size={14} class="text-brand-gold shrink-0 mt-0.5" />
						<span class="leading-normal">{selectedChurch.address}</span>
					</div>
					<div class="flex items-center gap-2.5">
						<Phone size={14} class="text-brand-gold shrink-0" />
						<span class="font-mono">{selectedChurch.phone}</span>
					</div>
					<div class="flex items-center gap-2.5">
						<Mail size={14} class="text-brand-gold shrink-0" />
						<span class="truncate">{selectedChurch.email}</span>
					</div>
				</div>
			</div>

			<!-- Schedules List -->
			<div class="flex-1 overflow-y-auto p-6 font-sans">
				<h3 class="text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">Grade Semanal</h3>
				
				<div class="space-y-2">
					{#each filteredSchedules as item}
						{@const Icon = getIcon(item.type)}
						<div class="flex items-center justify-between text-xs py-2 px-3 rounded bg-bg-dark/40 border border-border-dark/50 hover:border-brand-gold/30 transition-colors">
							<div class="flex flex-col gap-0.5">
								<span class="font-bold text-text-main font-mono text-sm">{item.timeStr}</span>
								<span class="text-[10px] text-text-muted">{item.weekday} ({item.dateStr})</span>
							</div>
							<div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-card border border-border-dark/60 shadow-sm">
								<Icon size={12} class={item.type === 'Confissão' ? 'text-brand-wine' : 'text-brand-gold'} />
								<span class="text-text-main font-semibold text-[10px]">{item.type}</span>
							</div>
						</div>
					{:else}
						<span class="text-xs text-text-muted block text-center py-6">Nenhum horário cadastrado.</span>
					{/each}
				</div>
			</div>
		</aside>
	{/if}

	<!-- Map Container -->
	<section class="flex-1 h-full relative transition-all duration-300">
		<div 
			use:initMapAction
			class="w-full h-full"
		></div>

		<!-- floating paróquia dropdown card & info details trigger button -->
		<div class="absolute top-4 left-4 z-[1001] flex items-start gap-2.5 select-none">
			<!-- Dropdown Selector Wrapper -->
			<div class="flex flex-col items-start">
				<button
					onclick={() => {
						showChurchSelector = !showChurchSelector;
						if (showChurchSelector) showMapDetails = false;
					}}
					class="flex items-center gap-2.5 px-4 py-2 bg-bg-card/90 backdrop-blur-md border border-border-dark hover:border-brand-gold/40 shadow-xl rounded-full text-xs font-semibold text-text-main transition-colors duration-200 cursor-pointer"
				>
					<MapPin size={13} class="text-brand-gold" />
					<span>Paróquia</span>
					{#if showChurchSelector}
						<ChevronUp size={12} class="text-text-muted ml-0.5" />
					{:else}
						<ChevronDown size={12} class="text-text-muted ml-0.5" />
					{/if}
				</button>

				{#if showChurchSelector}
					<div class="w-72 max-h-72 flex flex-col bg-bg-card/90 backdrop-blur-md border border-border-dark shadow-2xl rounded-xl p-3 font-sans overflow-hidden transition-all duration-200 mt-2">
						<div class="flex items-center justify-between pb-1.5 border-b border-border-dark/60 mb-2">
							<span class="text-[10px] font-bold uppercase tracking-wider text-brand-gold">Selecione uma Paróquia</span>
							<span class="text-[9px] text-text-muted px-1.5 py-0.5 rounded bg-bg-dark border border-border-dark">{churches.length} total</span>
						</div>

						<div class="relative mb-2">
							<Search size={12} class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
							<input
								type="text"
								bind:value={searchFilterQuery}
								placeholder="Buscar igreja..."
								class="w-full pl-8 pr-6 py-1.5 text-[11px] rounded-md border border-border-dark bg-bg-dark/60 text-text-main placeholder-text-muted focus:border-brand-gold focus:outline-none transition-colors"
							/>
							{#if searchFilterQuery}
								<button 
									onclick={() => searchFilterQuery = ''}
									class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
								>
									<X size={12} />
								</button>
							{/if}
						</div>

						<div class="flex-1 overflow-y-auto space-y-1 pr-1">
							{#each searchChurchesList as item}
								<button
									onclick={() => {
										selectedChurchId = item.id;
										showChurchSelector = false;
										showMapDetails = true;
										triggerMapResize();
									}}
									class="w-full text-left text-xs py-1.5 px-2.5 rounded hover:bg-bg-dark transition-colors flex items-center justify-between cursor-pointer
									{item.id === selectedChurchId ? 'text-brand-gold font-bold bg-bg-dark/80' : 'text-text-muted hover:text-text-main'}"
								>
									<span class="truncate pr-2">{item.name}</span>
									{#if item.id === selectedChurchId}
										<div class="h-1.5 w-1.5 rounded-full bg-brand-gold"></div>
									{/if}
								</button>
							{:else}
								<span class="text-xs text-text-muted block text-center py-4">Nenhuma igreja encontrada.</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Show details button when drawer is closed -->
			{#if !showMapDetails && !showChurchSelector}
				<button
					onclick={() => {
						showMapDetails = true;
						triggerMapResize();
					}}
					class="flex items-center justify-center h-8 w-8 rounded-full border border-border-dark bg-bg-card/90 backdrop-blur-md hover:bg-bg-card text-brand-gold hover:text-brand-gold-muted shadow-xl cursor-pointer hover:border-brand-gold/30 transition-all duration-200 shrink-0"
					title="Ver Detalhes da Paróquia"
				>
					<Info size={14} />
				</button>
			{/if}

			<!-- Nearest church pill button (always visible alongside other controls) -->
			<div class="relative">
				<button
					onclick={goToNearestChurch}
					disabled={geoLoading}
					class="flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-xl backdrop-blur-md text-xs font-semibold transition-all duration-200
					{geoLoading
						? 'bg-bg-card/90 border-border-dark text-text-muted opacity-60 cursor-wait'
						: 'bg-bg-card/90 border-border-dark hover:border-brand-gold/40 text-text-muted hover:text-brand-gold cursor-pointer'}"
					title="Paróquia mais perto de você"
				>
					{#if geoLoading}
						<span class="inline-block h-3 w-3 rounded-full border-2 border-brand-gold/40 border-t-brand-gold animate-spin"></span>
						<span class="hidden sm:inline">Localizando...</span>
					{:else}
						<Navigation size={13} />
						<span class="hidden sm:inline">Mais perto</span>
					{/if}
				</button>
				{#if geoError}
					<div class="absolute top-10 left-0 bg-bg-card border border-red-500/30 text-red-400/80 text-[10px] rounded-lg px-3 py-2 shadow-xl w-48 leading-relaxed z-10">
						{geoError}
					</div>
				{/if}
			</div>
		</div>
	</section>
</div>
