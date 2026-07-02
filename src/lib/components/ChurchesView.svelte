<script lang="ts">
	import {
		MapPin,
		Phone,
		Mail,
		X,
		Search,
		ChevronUp,
		ChevronDown,
		Info,
		Navigation,
		Plus,
		Sparkles,
		Flame,
		Users,
		Heart,
		AlertCircle,
		Check,
		ThumbsUp,
		ThumbsDown,
		Clock
	} from '@lucide/svelte';
	import logo from '$lib/assets/logo-removebg.png';
	import { reportsStore } from '$lib/mockReports.svelte';

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
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
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
				if (!churches.length) {
					geoLoading = false;
					return;
				}
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
				geoError =
					err.code === 1
						? 'Permissão de localização negada.'
						: 'Não foi possível obter sua localização.';
			},
			{ timeout: 8000, maximumAge: 60000 }
		);
	}

	let searchChurchesList = $derived(
		churches.filter(
			(c: Church) =>
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

	let communityEvents = $derived(
		reportsStore.getCommunityEventsForChurch(selectedChurch.id)
	);

	let mergedSchedules = $derived.by(() => {
		const official = filteredSchedules.map((s: Schedule) => ({ ...s, isCommunity: false }));
		const community = communityEvents.map(e => ({
			id: e.id,
			type: e.type,
			weekday: e.weekday,
			dateStr: 'Comunitário',
			timeStr: e.timeStr,
			churchName: e.churchName,
			churchId: e.churchId,
			notes: e.notes,
			confidenceScore: 0.8,
			upvotes: e.upvotes,
			downvotes: e.downvotes,
			userAction: e.userAction,
			isCommunity: true
		}));

		const weekdayOrder: Record<string, number> = {
			'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6
		};

		return [...official, ...community].sort((a, b) => {
			const dayDiff = (weekdayOrder[a.weekday] ?? 0) - (weekdayOrder[b.weekday] ?? 0);
			if (dayDiff !== 0) return dayDiff;
			return a.timeStr.localeCompare(b.timeStr);
		});
	});

	// Modal and reporting state
	let showAddEventModal = $state(false);
	let newEventType = $state<'Missa' | 'Confissão' | 'Adoração' | 'Terço' | 'Outro'>('Missa');
	let newEventWeekday = $state<'Dom' | 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb'>('Dom');
	let newEventTime = $state('19:00');
	let newEventNotes = $state('');
	let addEventSuccess = $state(false);

	function handleAddCommunityEvent(e: Event) {
		e.preventDefault();
		if (!selectedChurch) return;

		reportsStore.addCommunityEvent({
			churchId: selectedChurch.id,
			churchName: selectedChurch.name,
			type: newEventType,
			weekday: newEventWeekday,
			timeStr: newEventTime,
			notes: newEventNotes
		});

		addEventSuccess = true;
		setTimeout(() => {
			showAddEventModal = false;
			addEventSuccess = false;
			// Reset
			newEventType = 'Missa';
			newEventWeekday = 'Dom';
			newEventTime = '19:00';
			newEventNotes = '';
		}, 1500);
	}

	function handleEventVote(eventId: string, type: 'up' | 'down') {
		reportsStore.voteCommunityEvent(eventId, type);
	}

	function getEventColor(category: string) {
		switch (category) {
			case 'Missa': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
			case 'Confissão': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
			case 'Adoração': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
			case 'Terço': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
			default: return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
		}
	}

	function getEventIcon(category: string) {
		switch (category) {
			case 'Missa': return Flame;
			case 'Confissão': return Users;
			case 'Adoração': return Sparkles;
			case 'Terço': return Heart;
			default: return AlertCircle;
		}
	}

	function getConfidencePercent(event: any) {
		const total = event.upvotes + event.downvotes;
		if (total === 0) return 100;
		return Math.round((event.upvotes / total) * 100);
	}



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
		<aside
			class="w-full md:w-[380px] h-full bg-bg-card border-r border-border-dark flex flex-col z-10 shadow-2xl relative shrink-0 transition-all duration-300"
		>
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
			<div
				class="p-6 pb-4 border-b border-border-dark/50 flex flex-col gap-4 font-sans select-none"
			>
				<div class="flex items-center gap-3">
					<div
						class="h-10 w-10 flex items-center justify-center rounded-xl bg-bg-dark/40 border border-border-dark shrink-0"
					>
						<img src={logo} alt="Logo" class="h-6 w-6 object-contain" />
					</div>
					<div>
						<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold"
							>Paróquia Selecionada</span
						>
						<h2 class="text-lg font-bold text-text-main tracking-tight leading-snug line-clamp-2">
							{selectedChurch.name}
						</h2>
					</div>
				</div>

				<!-- Address & Contact Info -->
				<div
					class="space-y-2 text-text-muted text-xs bg-bg-dark/40 p-3 rounded-xl border border-border-dark/60"
				>
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
			<div class="flex-1 overflow-y-auto p-6 font-sans space-y-4">
				<h3 class="text-xs font-bold uppercase tracking-widest text-brand-gold mb-3 select-none">
					Grade Semanal
				</h3>

				<div class="space-y-2">
					{#each mergedSchedules as item}
						{@const Icon = getEventIcon(item.type)}
						{@const colorClasses = getEventColor(item.type)}
						{#if item.isCommunity}
							<!-- Community contributed schedule card -->
							<div
								class="flex flex-col gap-2 p-3 rounded-xl bg-brand-gold-dim/5 border border-brand-gold/20 hover:border-brand-gold/45 transition-colors text-xs"
							>
								<!-- Top Info -->
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-1">
										<span class="font-bold text-text-main font-mono text-sm">{item.timeStr}</span>
										<span class="text-[10px] text-text-muted">({item.weekday})</span>
									</div>
									<div class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/20">
										<span class="text-brand-gold font-bold text-[8px] uppercase tracking-wider">Colaborativo</span>
									</div>
								</div>
								
								<!-- Details and Icon -->
								<div class="flex items-start justify-between gap-3">
									<div class="text-left">
										<span class="text-[10px] text-text-muted font-bold uppercase tracking-wider block">{item.type}</span>
										{#if item.notes}
											<p class="text-[10px] text-text-muted leading-relaxed font-sans mt-0.5">{item.notes}</p>
										{/if}
									</div>
									<div class="h-6 w-6 rounded-lg flex items-center justify-center {colorClasses} border shrink-0">
										<Icon size={12} />
									</div>
								</div>

								<!-- Vote widget -->
								<div class="flex items-center justify-between text-[9px] text-text-muted border-t border-border-dark/30 pt-2 mt-0.5 select-none">
									<span>Confiança: <b class="text-brand-gold">{getConfidencePercent(item)}%</b></span>
									<div class="flex gap-1.5">
										<button
											onclick={() => handleEventVote(item.id, 'down')}
											class="px-1.5 py-0.5 rounded border border-border-dark bg-bg-card hover:text-text-main {item.userAction === 'down' ? 'text-brand-wine border-brand-wine/40' : ''} cursor-pointer text-[8px] font-bold"
											title="Este horário não ocorre mais"
										>
											Não ({item.downvotes})
										</button>
										<button
											onclick={() => handleEventVote(item.id, 'up')}
											class="px-1.5 py-0.5 rounded border border-border-dark bg-bg-card hover:text-text-main {item.userAction === 'up' ? 'text-brand-gold border-brand-gold/40' : ''} cursor-pointer text-[8px] font-bold"
											title="Confirmar que este horário ocorre"
										>
											Sim ({item.upvotes})
										</button>
									</div>
								</div>
							</div>
						{:else}
							<!-- Official schedule card -->
							<div
								class="flex items-center justify-between text-xs py-2 px-3 rounded bg-bg-dark/40 border border-border-dark/50 hover:border-brand-gold/30 transition-colors"
							>
								<div class="flex flex-col gap-0.5">
									<span class="font-bold text-text-main font-mono text-sm">{item.timeStr}</span>
									<span class="text-[10px] text-text-muted">{item.weekday} ({item.dateStr})</span>
								</div>
								<div
									class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-card border border-border-dark/60 shadow-sm"
								>
									<Icon
										size={12}
										class={item.type === 'Confissão' ? 'text-brand-wine' : 'text-brand-gold'}
									/>
									<span class="text-text-main font-semibold text-[10px]">{item.type}</span>
								</div>
							</div>
						{/if}
					{:else}
						<span class="text-xs text-text-muted block text-center py-6 select-none"
							>Nenhum horário cadastrado.</span
						>
					{/each}
				</div>
			</div>
		</aside>
	{/if}

	<!-- Map Container -->
	<section class="flex-1 h-full relative transition-all duration-300">
		<div use:initMapAction class="w-full h-full"></div>

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
					<div
						class="w-72 max-h-72 flex flex-col bg-bg-card/90 backdrop-blur-md border border-border-dark shadow-2xl rounded-xl p-3 font-sans overflow-hidden transition-all duration-200 mt-2"
					>
						<div
							class="flex items-center justify-between pb-1.5 border-b border-border-dark/60 mb-2"
						>
							<span class="text-[10px] font-bold uppercase tracking-wider text-brand-gold"
								>Selecione uma Paróquia</span
							>
							<span
								class="text-[9px] text-text-muted px-1.5 py-0.5 rounded bg-bg-dark border border-border-dark"
								>{churches.length} total</span
							>
						</div>

						<div class="relative mb-2">
							<Search
								size={12}
								class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
							/>
							<input
								type="text"
								bind:value={searchFilterQuery}
								placeholder="Buscar igreja..."
								class="w-full pl-8 pr-6 py-1.5 text-[11px] rounded-md border border-border-dark bg-bg-dark/60 text-text-main placeholder-text-muted focus:border-brand-gold focus:outline-none transition-colors"
							/>
							{#if searchFilterQuery}
								<button
									onclick={() => (searchFilterQuery = '')}
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
									{item.id === selectedChurchId
										? 'text-brand-gold font-bold bg-bg-dark/80'
										: 'text-text-muted hover:text-text-main'}"
								>
									<span class="truncate pr-2">{item.name}</span>
									{#if item.id === selectedChurchId}
										<div class="h-1.5 w-1.5 rounded-full bg-brand-gold"></div>
									{/if}
								</button>
							{:else}
								<span class="text-xs text-text-muted block text-center py-4"
									>Nenhuma igreja encontrada.</span
								>
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
						<span
							class="inline-block h-3 w-3 rounded-full border-2 border-brand-gold/40 border-t-brand-gold animate-spin"
						></span>
						<span class="hidden sm:inline">Localizando...</span>
					{:else}
						<Navigation size={13} />
						<span class="hidden sm:inline">Mais perto</span>
					{/if}
				</button>
				{#if geoError}
					<div
						class="absolute top-10 left-0 bg-bg-card border border-red-500/30 text-red-400/80 text-[10px] rounded-lg px-3 py-2 shadow-xl w-48 leading-relaxed z-10"
					>
						{geoError}
					</div>
				{/if}
			</div>
		</div>

		<!-- Waze-style Floating Action Button (FAB) to Add Event -->
		<button
			onclick={() => (showAddEventModal = true)}
			class="absolute bottom-6 right-6 h-12 w-12 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
			style="background-color: #f06e2b; z-index: 9999; box-shadow: 0 4px 20px rgba(240, 110, 43, 0.45);"
			title="Adicionar Horário/Evento (Colaborativo)"
		>
			<div class="absolute inset-0 rounded-full animate-ping group-hover:animate-none" style="background-color: rgba(240, 110, 43, 0.35);"></div>
			<Plus size={20} strokeWidth={2.8} />
		</button>
	</section>

	<!-- Svelte Modal for Adding Community Event (Waze-style) -->
	{#if showAddEventModal}
		<div
			class="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
		>
			<!-- Backdrop Click Close -->
			<button
				onclick={() => (showAddEventModal = false)}
				class="absolute inset-0 cursor-default focus:outline-none"
				aria-label="Fechar modal"
			></button>

			<div
				class="relative w-full max-w-md bg-bg-card border border-border-dark shadow-2xl rounded-2xl p-6 flex flex-col gap-4 font-sans animate-scale-in text-left z-10"
			>
				<button
					onclick={() => (showAddEventModal = false)}
					class="absolute top-4 right-4 text-text-muted hover:text-text-main cursor-pointer"
				>
					<X size={16} />
				</button>

				{#if addEventSuccess}
					<div
						class="flex flex-col items-center justify-center py-10 text-center space-y-3 animate-fade-in"
					>
						<div class="h-10 w-10 rounded-full bg-brand-gold-dim border border-brand-gold/25 flex items-center justify-center">
							<Check class="h-5 w-5 text-brand-gold" />
						</div>
						<h4 class="text-sm font-bold text-text-main">Horário Adicionado!</h4>
						<p class="text-[11px] text-text-muted">
							O evento foi integrado à grade horária desta paróquia.
						</p>
					</div>
				{:else}
					<form onsubmit={handleAddCommunityEvent} class="space-y-4">
						<div class="space-y-1">
							<h3 class="text-base font-bold text-text-main tracking-tight flex items-center gap-1.5 select-none">
								<Plus size={16} class="text-[#f06e2b]" />
								<span>Adicionar Horário Colaborativo</span>
							</h3>
							<p class="text-[10px] text-text-muted">
								Ajude os fiéis a saber o que ocorre na paróquia {selectedChurch.name}.
							</p>
						</div>

						<!-- Step 1: Select Event Type -->
						<div class="space-y-1.5 select-none">
							<span class="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Tipo de Evento</span>
							<div class="grid grid-cols-4 gap-1.5">
								{#each ['Missa', 'Confissão', 'Adoração', 'Terço'] as type}
									{@const CatIcon = getEventIcon(type)}
									<button
										type="button"
										onclick={() => (newEventType = type as any)}
										class="py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-[10px] font-bold
										{newEventType === type
											? 'border-brand-gold text-brand-gold bg-brand-gold-dim/10 shadow'
											: 'border-border-dark bg-bg-dark text-text-muted hover:text-text-main'}"
									>
										<CatIcon size={14} />
										<span>{type}</span>
									</button>
								{/each}
							</div>
						</div>

						<!-- Step 2: Weekday and Time -->
						<div class="flex gap-4">
							<div class="flex-1 space-y-1.5">
								<label for="eventWeekday" class="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
									Dia da Semana
								</label>
								<select
									id="eventWeekday"
									bind:value={newEventWeekday}
									required
									class="w-full px-3 py-2 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main focus:border-brand-gold focus:outline-none transition-colors"
								>
									{#each ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as day}
										<option value={day}>{day === 'Dom' ? 'Domingo' : day === 'Sáb' ? 'Sábado' : day}</option>
									{/each}
								</select>
							</div>

							<div class="w-32 space-y-1.5">
								<label for="eventTime" class="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
									Horário
								</label>
								<input
									id="eventTime"
									type="time"
									bind:value={newEventTime}
									required
									class="w-full px-3 py-1.5 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main focus:border-brand-gold focus:outline-none transition-colors"
								/>
							</div>
						</div>

						<!-- Step 3: Notes -->
						<div class="space-y-1.5">
							<label for="eventNotes" class="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
								Observações (opcional)
							</label>
							<textarea
								id="eventNotes"
								rows="3"
								bind:value={newEventNotes}
								placeholder="Ex: Rezado na capela lateral, com confissões simultâneas..."
								class="w-full px-3 py-2 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main placeholder-text-muted focus:border-brand-gold focus:outline-none transition-colors resize-none"
							></textarea>
						</div>

						<div class="flex gap-2.5 pt-2 select-none">
							<button
								type="button"
								onclick={() => (showAddEventModal = false)}
								class="flex-1 py-2 text-xs font-bold rounded-xl border border-border-dark bg-bg-dark text-text-muted hover:text-text-main cursor-pointer"
							>
								Cancelar
							</button>
							<button
								type="submit"
								class="flex-1 py-2 text-xs font-bold rounded-xl bg-brand-wine hover:bg-brand-wine-light text-white shadow-md cursor-pointer flex items-center justify-center gap-1"
							>
								<Check size={12} />
								<span>Adicionar</span>
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	{/if}
</div>
