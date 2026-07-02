<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	/* eslint-disable @typescript-eslint/no-explicit-any */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import {
		Clock,
		MapPin,
		BookOpen,
		Book,
		Sparkles,
		Flame,
		CheckSquare,
		Star,
		User,
		ChevronRight,
		Calendar,
		ArrowRight,
		Search
	} from '@lucide/svelte';

	interface Church {
		id: string;
		name: string;
		address: string;
		phone: string;
		email: string;
		lat: number;
		lng: number;
	}

	interface Schedule {
		id: string;
		type: string;
		weekday: string;
		dateStr: string;
		timeStr: string;
		churchId: string;
		churchName?: string;
	}

	interface Celebracao {
		id: string;
		liturgia: string;
		cor: string;
		principal: boolean;
		leituras?: any[];
	}

	interface LiturgiaResponse {
		data: string; // DD/MM/YYYY
		celebracoes: Celebracao[];
	}

	// Receive state and API values as props
	let {
		currentLiturgicalHour,
		churches = [],
		schedules = [],
		liturgiaData = null,
		user = null
	} = $props<{
		currentLiturgicalHour: { name: string; verse: string; imageUrl: string };
		churches?: Church[];
		schedules?: Schedule[];
		liturgiaData?: LiturgiaResponse | null;
		user?: { name: string; avatar: string; email: string } | null;
	}>();

	// Navigation context
	const navState = getContext<any>('navigation');

	// Today's date logic
	const today = new Date();
	const todayStr = today.toLocaleDateString('pt-BR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});

	// Parse Liturgia do Dia
	const liturgiaDoDia = $derived.by(() => {
		if (!liturgiaData || !liturgiaData.celebracoes || !liturgiaData.celebracoes.length) {
			return 'Consulte a liturgia diária';
		}
		const principal =
			liturgiaData.celebracoes.find((c: Celebracao) => c.principal) || liturgiaData.celebracoes[0];
		return principal.liturgia.split('.')[0];
	});

	// Parse Santo do Dia based on liturgical calendar
	const santoDoDia = $derived.by(() => {
		if (!liturgiaData || !liturgiaData.celebracoes || !liturgiaData.celebracoes.length) {
			return 'São Bento e Santos do Dia';
		}
		const saintKeywords = [
			'são',
			'santo',
			'santa',
			'santos',
			'nossa senhora',
			'profeta',
			'apóstolo',
			'mártir'
		];
		const saintCelebration = liturgiaData.celebracoes.find((c: Celebracao) =>
			saintKeywords.some((keyword) => c.liturgia.toLowerCase().includes(keyword))
		);
		if (saintCelebration) {
			return saintCelebration.liturgia.split('.')[0];
		}
		return liturgiaData.celebracoes[0].liturgia.split('.')[0];
	});

	// "Em Breve" feature notification toast state
	let showToast = $state(false);
	let toastMessage = $state('');

	function handleComingSoon(featureName: string) {
		toastMessage = `${featureName} estará disponível em breve!`;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	// Leaflet map bindings
	let map = $state<any>(null);
	let L = $state<any>(null);
	let markers: any[] = [];
	let tileLayer: any;

	// Calculate map center dynamically based on churches loaded
	const defaultCenter = $derived.by(() => {
		if (!churches.length) return [-23.55052, -46.633308]; // Default to São Paulo
		const sumLat = churches.reduce((sum: number, c: Church) => sum + c.lat, 0);
		const sumLng = churches.reduce((sum: number, c: Church) => sum + c.lng, 0);
		return [sumLat / churches.length, sumLng / churches.length];
	});

	// Dynamic action to initialize Leaflet Map safely on the client
	function initMapAction(node: HTMLDivElement) {
		let mapInstance: any;

		const setup = async () => {
			if (typeof window !== 'undefined') {
				if (!L) {
					L = await import('leaflet');
				}

				const center = defaultCenter;
				mapInstance = L.map(node, {
					zoomControl: true,
					attributionControl: false
				}).setView(center, 12);

				map = mapInstance;

				// Dark theme map tiles
				const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
				tileLayer = L.tileLayer(tileUrl, {
					maxZoom: 20,
					subdomains: 'abcd'
				}).addTo(map);

				// Place markers for all churches
				churches.forEach((church: Church) => {
					const customIcon = L.divIcon({
						className: 'custom-leaflet-marker',
						html: `<div class="relative flex items-center justify-center">
							<div class="absolute h-5 w-5 animate-ping rounded-full bg-[#c9a84c]/15 opacity-70"></div>
							<div class="relative h-3.5 w-3.5 rounded-full border border-bg-card bg-[#c9a84c]/80 shadow-[0_0_8px_rgba(201,168,76,0.5)]"></div>
						</div>`,
						iconSize: [20, 20],
						iconAnchor: [10, 10]
					});

					const m = L.marker([church.lat, church.lng], { icon: customIcon }).addTo(map);
					m.bindPopup(`
						<div class="p-1 font-sans text-bg-dark">
							<b style="color:#6b1d2a;font-size:12px;">${church.name}</b><br>
							<span style="font-size:10px;color:#4b5563;margin-top:2px;display:block;">${church.address}</span>
							<a href="/paroquias" style="display:inline-block;margin-top:6px;font-size:10px;font-weight:bold;color:#c9a84c;text-decoration:underline;">Ver detalhes</a>
						</div>
					`);
					markers.push(m);
				});

				setTimeout(() => {
					if (mapInstance) {
						mapInstance.invalidateSize();
					}
				}, 200);
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

	// Greeting logic based on system time
	const greeting = $derived.by(() => {
		const hour = new Date().getHours();
		if (hour >= 6 && hour < 12) return 'Bom dia';
		if (hour >= 12 && hour < 18) return 'Boa tarde';
		return 'Boa noite';
	});

	const firstName = $derived.by(() => {
		if (!user || !user.name) return 'Fiel';
		return user.name.split(' ')[0];
	});

	// Deriving Liturgical Season (Tempo Litúrgico)
	const tempoLiturgico = $derived.by(() => {
		if (!liturgiaData || !liturgiaData.celebracoes || !liturgiaData.celebracoes.length) {
			return 'Tempo Comum';
		}
		const principal =
			liturgiaData.celebracoes.find((c: Celebracao) => c.principal) || liturgiaData.celebracoes[0];
		const litLower = principal.liturgia.toLowerCase();
		if (litLower.includes('advento')) return 'Advento';
		if (litLower.includes('quaresma')) return 'Quaresma';
		if (litLower.includes('páscoa')) return 'Tempo da Páscoa';
		if (litLower.includes('natal')) return 'Tempo do Natal';

		if (principal.cor === 'Verde') return 'Tempo Comum';
		if (principal.cor === 'Roxo') return 'Tempo Penitencial';
		if (principal.cor === 'Vermelho') return 'Festas de Mártires';
		if (principal.cor === 'Branco') return 'Tempo Festivo';
		return 'Tempo Comum';
	});

	// Deriving Gospel metadata
	const evangelhoInfo = $derived.by(() => {
		if (!liturgiaData || !liturgiaData.celebracoes || !liturgiaData.celebracoes.length) {
			return null;
		}
		const principal =
			liturgiaData.celebracoes.find((c: Celebracao) => c.principal) || liturgiaData.celebracoes[0];
		if (!principal.leituras) return null;
		const evangelho = principal.leituras.find(
			(l: any) =>
				l.rotulo.toLowerCase().includes('evangelho') || l.tipo?.toLowerCase() === 'evangelho'
		);
		if (evangelho && evangelho.opcoes && evangelho.opcoes.length > 0) {
			return {
				referencia: evangelho.opcoes[0].referencia || 'Evangelho de hoje',
				titulo: evangelho.opcoes[0].titulo || 'Evangelho do dia'
			};
		}
		return null;
	});

	// Deriving Next Mass schedule
	const weekdaysPt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
	const todayWeekday = weekdaysPt[today.getDay()];

	const proximaMissa = $derived.by(() => {
		if (!schedules || !schedules.length) return null;
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		// Filter for today's masses
		const todayMasses = schedules.filter((s: Schedule) => {
			return s.type.toLowerCase() === 'missa' && s.weekday === todayWeekday;
		});

		// Find masses after current time
		const upcomingMasses = todayMasses.filter((s: Schedule) => {
			const [h, m] = s.timeStr.split(':').map(Number);
			return h > currentHour || (h === currentHour && m > currentMinute);
		});

		if (upcomingMasses.length > 0) {
			upcomingMasses.sort((a: Schedule, b: Schedule) => a.timeStr.localeCompare(b.timeStr));
			const mass = upcomingMasses[0];

			// Try to associate with church name if not present
			let name = mass.churchName;
			if (!name && churches.length) {
				const ch = churches.find((c: Church) => c.id === mass.churchId);
				name = ch ? ch.name : 'Paróquia';
			}
			return {
				...mass,
				churchName: name
			};
		}
		return null;
	});
</script>

<div
	class="flex-1 w-full min-h-0 flex flex-col justify-start py-8 px-6 sm:px-12 gap-8 max-w-7xl mx-auto relative"
>
	<!-- Local Toast for "Em Breve" -->
	{#if showToast}
		<div
			class="fixed top-6 right-6 z-[2000] bg-bg-card border border-brand-gold/30 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-fade-in"
		>
			<Sparkles size={16} class="text-brand-gold" />
			<span class="text-xs font-bold text-text-main">{toastMessage}</span>
		</div>
	{/if}

	<!-- ── DESKTOP LAYOUT (screen >= md) ── -->
	<div class="hidden md:flex flex-col gap-8 w-full select-none">
		<!-- Saudação (Greeting) -->
		<div class="flex flex-col gap-1 w-full shrink-0">
			<h2 class="text-2xl font-extrabold tracking-tight text-text-main">
				{greeting}, {firstName}.
			</h2>
			<div class="flex items-center gap-2.5 text-xs text-text-muted font-sans leading-none">
				<span class="text-[9px] font-extrabold uppercase tracking-widest text-brand-gold">
					{tempoLiturgico}
				</span>
			</div>
		</div>

		<!-- Dashboard Core Grid (Welcome Banner + Today Widget side-by-side) -->
		<div class="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full shrink-0">
			<!-- Welcome / Hero Banner (2 columns on desktop) -->
			<div
				class="col-span-1 lg:col-span-2 relative overflow-hidden rounded-3xl border border-border-dark bg-bg-card/35 p-8 lg:p-10 flex flex-col justify-between min-h-[260px] shadow-lg"
			>
				<div class="flex flex-col gap-5 max-w-md z-10 relative">
					<div class="flex flex-col gap-1.5">
						<span class="text-[9px] font-extrabold uppercase tracking-widest text-brand-gold"
							>Bem-vindo ao Ordinarium</span
						>
						<h2
							class="text-lg md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug text-text-main"
						>
							Sua fé, organizada.<br />Sua devoção, fortalecida.
						</h2>
					</div>
					<p class="text-xs text-text-muted leading-relaxed">
						Encontre missas, confissões, adorações e a liturgia diária em sua região.
					</p>
					<div class="pt-2">
						<a
							href="/horarios"
							class="inline-flex items-center gap-2 rounded-xl bg-brand-gold hover:bg-brand-gold-muted text-bg-dark font-extrabold text-xs px-5 py-3 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)] hover:-translate-y-0.5 cursor-pointer"
						>
							<span>Encontrar Missa</span>
							<ArrowRight size={13} />
						</a>
					</div>
				</div>

				<div class="absolute right-0 bottom-0 top-0 w-1/2 z-0 pointer-events-none overflow-hidden">
					<div
						class="absolute inset-0 bg-gradient-to-r from-bg-card/100 via-transparent to-transparent z-10"
					></div>
					<div
						class="absolute inset-0 bg-gradient-to-t from-bg-card/100 via-transparent to-transparent z-10"
					></div>
					<div
						class="absolute inset-0 bg-gradient-to-b from-bg-card/20 via-transparent to-transparent z-10"
					></div>
					<img
						src="/bg_texture.gif"
						alt="Jesus Cristo"
						class="w-full h-full object-cover object-center opacity-25 select-none liturgical-woodcut-dark scale-105"
					/>
				</div>
			</div>

			<!-- Real-time "Hoje" Widget -->
			<div
				class="col-span-1 border border-border-dark bg-bg-card/40 rounded-3xl p-6 flex flex-col gap-4 shadow-lg"
			>
				<div class="flex flex-col gap-1">
					<span
						class="text-[9px] font-extrabold uppercase tracking-widest text-brand-gold flex items-center gap-1.5"
					>
						<Calendar size={11} />
						<span>Hoje</span>
					</span>
					<h3 class="text-xs font-bold text-text-main capitalize truncate">
						{todayStr}
					</h3>
				</div>

				<div class="flex flex-col gap-2.5">
					<!-- Entry 1: Liturgia do Dia -->
					<a
						href="/liturgia"
						class="flex items-center justify-between p-3 rounded-2xl bg-bg-dark/45 border border-border-dark/60 hover:border-brand-gold/30 hover:bg-bg-dark/80 transition-all duration-200 group"
					>
						<div class="flex items-start gap-3 min-w-0">
							<BookOpen size={15} class="text-brand-gold mt-0.5 shrink-0" />
							<div class="flex flex-col gap-0.5 min-w-0">
								<span
									class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/50 leading-none"
									>Liturgia</span
								>
								<span
									class="text-xs font-semibold text-text-main leading-tight truncate group-hover:text-brand-gold transition-colors"
								>
									{liturgiaDoDia}
								</span>
							</div>
						</div>
						<ChevronRight
							size={13}
							class="text-text-muted/30 group-hover:text-text-main group-hover:translate-x-0.5 transition-all shrink-0"
						/>
					</a>

					<!-- Entry 2: Vésperas / Hora Litúrgica -->
					<div
						class="flex items-center justify-between p-3 rounded-2xl bg-bg-dark/45 border border-border-dark/60"
					>
						<div class="flex items-start gap-3 min-w-0">
							<Clock size={15} class="text-brand-gold mt-0.5 shrink-0" />
							<div class="flex flex-col gap-0.5 min-w-0">
								<span
									class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/50 leading-none"
								>
									{currentLiturgicalHour.name.split(' ')[0]}
								</span>
								<span
									class="text-xs font-semibold text-text-main leading-tight italic truncate"
									title={currentLiturgicalHour.verse}
								>
									{currentLiturgicalHour.verse}
								</span>
							</div>
						</div>
					</div>

					<!-- Entry 3: Santo do Dia -->
					<button
						onclick={() => handleComingSoon('Módulo de Santos do Dia')}
						class="flex items-center justify-between p-3 rounded-2xl bg-bg-dark/45 border border-border-dark/60 hover:border-brand-gold/30 hover:bg-bg-dark/80 transition-all duration-200 group text-left cursor-pointer"
					>
						<div class="flex items-start gap-3 min-w-0">
							<User size={15} class="text-brand-gold mt-0.5 shrink-0" />
							<div class="flex flex-col gap-0.5 min-w-0">
								<span
									class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/50 leading-none"
									>Santo do Dia</span
								>
								<span
									class="text-xs font-semibold text-text-main leading-tight truncate group-hover:text-brand-gold transition-colors"
								>
									{santoDoDia}
								</span>
							</div>
						</div>
						<ChevronRight
							size={13}
							class="text-text-muted/30 group-hover:text-text-main group-hover:translate-x-0.5 transition-all shrink-0"
						/>
					</button>
				</div>
			</div>
		</div>

		<!-- Explorar Section (Original Layout) -->
		<div class="flex flex-col gap-4 w-full shrink-0">
			<h3 class="text-sm font-extrabold text-text-main tracking-tight uppercase select-none">
				Explorar
			</h3>

			<div class="grid grid-cols-2 xl:grid-cols-6 gap-4 w-full select-none">
				<!-- Card 1: Horários -->
				<a
					href="/horarios"
					class="col-span-1 flex flex-col justify-between p-5 bg-bg-card/45 hover:bg-bg-card/85 border border-border-dark hover:border-brand-gold/35 rounded-2xl group transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer min-h-[170px]"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-2.5 select-none">
							<Clock size={18} class="text-brand-gold shrink-0" />
							<h4
								class="text-xs font-extrabold text-text-main tracking-tight group-hover:text-brand-gold transition-colors"
							>
								Horários
							</h4>
						</div>
						<p class="text-[10px] text-text-muted leading-relaxed font-sans">
							Encontre horários de missas, confissões e adorações em sua região.
						</p>
					</div>
					<div class="flex justify-end mt-2">
						<ArrowRight
							size={14}
							class="text-text-muted group-hover:text-brand-gold transition-colors"
						/>
					</div>
				</a>

				<!-- Card 2: Paróquias -->
				<a
					href="/paroquias"
					class="col-span-1 flex flex-col justify-between p-5 bg-bg-card/45 hover:bg-bg-card/85 border border-border-dark hover:border-brand-gold/35 rounded-2xl group transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer min-h-[170px]"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-2.5 select-none">
							<MapPin size={18} class="text-brand-gold shrink-0" />
							<h4
								class="text-xs font-extrabold text-text-main tracking-tight group-hover:text-brand-gold transition-colors"
							>
								Paróquias
							</h4>
						</div>
						<p class="text-[10px] text-text-muted leading-relaxed font-sans">
							Localize paróquias, contatos e mapas integrados.
						</p>
					</div>
					<div class="flex justify-end mt-2">
						<ArrowRight
							size={14}
							class="text-text-muted group-hover:text-brand-gold transition-colors"
						/>
					</div>
				</a>

				<!-- Card 3: Liturgia -->
				<a
					href="/liturgia"
					class="col-span-1 flex flex-col justify-between p-5 bg-bg-card/45 hover:bg-bg-card/85 border border-border-dark hover:border-brand-gold/35 rounded-2xl group transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer min-h-[170px]"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-2.5 select-none">
							<BookOpen size={18} class="text-brand-gold shrink-0" />
							<h4
								class="text-xs font-extrabold text-text-main tracking-tight group-hover:text-brand-gold transition-colors"
							>
								Liturgia
							</h4>
						</div>
						<p class="text-[10px] text-text-muted leading-relaxed font-sans">
							Acompanhe a liturgia diária, leituras e celebrações da Santa Missa.
						</p>
					</div>
					<div class="flex justify-end mt-2">
						<ArrowRight
							size={14}
							class="text-text-muted group-hover:text-brand-gold transition-colors"
						/>
					</div>
				</a>

				<!-- Card 4: Orações -->
				<a
					href="/oracoes?tab=prayers"
					class="col-span-1 flex flex-col justify-between p-5 bg-bg-card/45 hover:bg-bg-card/85 border border-border-dark hover:border-brand-gold/35 rounded-2xl group transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer min-h-[170px]"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-2.5 select-none">
							<Flame size={18} class="text-brand-gold shrink-0" />
							<h4
								class="text-xs font-extrabold text-text-main tracking-tight group-hover:text-brand-gold transition-colors"
							>
								Orações
							</h4>
						</div>
						<p class="text-[10px] text-text-muted leading-relaxed font-sans">
							Acesse orações tradicionais, devoções e momentos de espiritualidade.
						</p>
					</div>
					<div class="flex justify-end mt-2">
						<ArrowRight
							size={14}
							class="text-text-muted group-hover:text-brand-gold transition-colors"
						/>
					</div>
				</a>

				<!-- Card 5: Exame de Consciência -->
				<a
					href="/oracoes?tab=exame"
					class="col-span-1 flex flex-col justify-between p-5 bg-bg-card/45 hover:bg-bg-card/85 border border-border-dark hover:border-brand-gold/35 rounded-2xl group transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer min-h-[170px]"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-2.5 select-none">
							<CheckSquare size={18} class="text-brand-gold shrink-0" />
							<h4
								class="text-xs font-extrabold text-text-main tracking-tight group-hover:text-brand-gold transition-colors"
							>
								Exame de Consciência
							</h4>
						</div>
						<p class="text-[10px] text-text-muted leading-relaxed font-sans">
							Prepare-se para uma boa confissão com o exame de consciência.
						</p>
					</div>
					<div class="flex justify-end mt-2">
						<ArrowRight
							size={14}
							class="text-text-muted group-hover:text-brand-gold transition-colors"
						/>
					</div>
				</a>

				<!-- Card 6: Favoritos -->
				<button
					onclick={() => handleComingSoon('Módulo de Favoritos')}
					class="col-span-1 flex flex-col justify-between p-5 bg-bg-card/45 hover:bg-bg-card/85 border border-border-dark hover:border-brand-gold/35 rounded-2xl group transition-all duration-300 transform hover:-translate-y-0.5 text-left cursor-pointer min-h-[170px]"
				>
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-2.5 select-none">
							<Star size={18} class="text-brand-gold shrink-0" />
							<h4
								class="text-xs font-extrabold text-text-main tracking-tight group-hover:text-brand-gold transition-colors"
							>
								Favoritos
							</h4>
						</div>
						<p class="text-[10px] text-text-muted leading-relaxed font-sans">
							Salve suas paróquias, orações e conteúdos favoritos.
						</p>
					</div>
					<div class="flex justify-end mt-2">
						<ArrowRight
							size={14}
							class="text-text-muted group-hover:text-brand-gold transition-colors"
						/>
					</div>
				</button>
			</div>
		</div>

		<!-- Collaborative Feature Banner -->
		<div
			class="w-full bg-gradient-to-r from-brand-wine/15 via-brand-gold-dim/5 to-brand-wine/20 border border-border-dark rounded-3xl p-6 text-left flex flex-col sm:flex-row items-center justify-between gap-4 select-none relative overflow-hidden animate-fade-in"
		>
			<div class="space-y-1.5 z-10">
				<h3 class="text-base sm:text-lg font-bold text-text-main tracking-tight font-sans">
					Falta algum horário de Missa ou Confissão?
				</h3>
				<p class="text-xs text-text-muted max-w-2xl leading-relaxed font-sans">
					Ajude a comunidade! Você pode cadastrar horários diretamente no mapa de paróquias para que
					outros fiéis fiquem informados.
				</p>
			</div>
			<a
				href="/paroquias"
				class="px-4 py-2 text-white text-xs font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5 z-10 cursor-pointer font-sans"
				style="background-color: #f06e2b; box-shadow: 0 4px 14px rgba(240, 110, 43, 0.45);"
			>
				<span>Adicionar Horário</span>
				<ArrowRight size={13} />
			</a>
			<div
				class="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-[#f06e2b]/5 blur-2xl pointer-events-none"
			></div>
		</div>

		<!-- Mapa de Paróquias Section -->
		<div class="flex flex-col gap-4 w-full pb-10">
			<div class="flex items-center justify-between select-none">
				<h3 class="text-sm font-extrabold text-text-main tracking-tight uppercase">
					Mapa de Paróquias
				</h3>
				<a
					href="/paroquias"
					class="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
				>
					<span>Ver todas no mapa</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3.5 w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</a>
			</div>

			<!-- Interactive Leaflet map styled in dark mode -->
			<div
				class="w-full h-80 rounded-2xl overflow-hidden border border-border-dark shadow-inner relative z-0"
			>
				<div use:initMapAction class="w-full h-full"></div>
			</div>
		</div>
	</div>

	<!-- ── MOBILE LAYOUT (screen < md) ── -->
	<div class="flex md:hidden flex-col gap-6 w-full">
		<!-- 2. Saudação (Greeting) -->
		<div class="flex flex-col gap-1 w-full shrink-0">
			<h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-text-main">
				{greeting}, {firstName}.
			</h2>
			<div
				class="flex flex-wrap items-center gap-2.5 text-xs text-text-muted font-sans leading-none"
			>
				<span class="text-[9px] font-extrabold uppercase tracking-widest text-brand-gold">
					{tempoLiturgico}
				</span>
			</div>
		</div>

		<!-- 3. Banner de Boas-vindas (Reduced height) -->
		<div
			class="w-full relative overflow-hidden rounded-2xl border border-border-dark bg-bg-card/35 p-4 flex items-center justify-between min-h-[90px] max-h-[110px] shadow-sm select-none shrink-0"
		>
			<div class="flex flex-col gap-1.5 z-10 max-w-[68%]">
				<span
					class="text-[8px] font-extrabold uppercase tracking-widest text-brand-gold leading-none"
					>Ordinarium</span
				>
				<h3 class="text-xs sm:text-sm font-extrabold tracking-tight text-text-main leading-snug">
					"Sua fé, organizada. Sua devoção, fortalecida."
				</h3>
				<p class="text-[9px] text-text-muted leading-relaxed font-sans">
					Mantenha sua vida espiritual ativa todos os dias.
				</p>
			</div>

			<div class="absolute right-0 bottom-0 top-0 w-1/3 z-0 pointer-events-none overflow-hidden">
				<div class="absolute inset-0 bg-gradient-to-r from-bg-card/100 to-transparent z-10"></div>
				<img
					src="/bg_texture.gif"
					alt="Jesus Cristo"
					class="w-full h-full object-cover object-center opacity-15 select-none liturgical-woodcut-dark scale-110"
				/>
			</div>
		</div>

		<!-- 4. Bento Card: HOJE (Destaque Principal) -->
		<div
			class="w-full border border-border-dark bg-bg-card/45 rounded-2xl p-4 flex flex-col gap-4 shadow-md glow-hover shrink-0"
		>
			<div
				class="flex items-center justify-between border-b border-border-dark/40 pb-2.5 select-none"
			>
				<div class="flex items-center gap-2">
					<Calendar size={13} class="text-brand-gold" />
					<h3
						class="text-xs font-extrabold uppercase tracking-widest text-brand-gold font-sans leading-none"
					>
						Hoje
					</h3>
				</div>
				<span class="text-[9px] font-bold text-text-muted uppercase leading-none">Litúrgico</span>
			</div>

			<div class="flex flex-col gap-3">
				<!-- Liturgia -->
				<a
					href="/liturgia"
					class="flex items-start gap-3 p-3 rounded-xl bg-bg-dark/45 border border-border-dark/60 hover:border-brand-gold/30 hover:bg-bg-dark/80 transition-all duration-200 group"
				>
					<div
						class="p-2 rounded-lg bg-brand-wine/10 border border-brand-wine/30 text-brand-gold shrink-0"
					>
						<BookOpen size={14} />
					</div>
					<div class="flex flex-col min-w-0">
						<span
							class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/60 leading-none"
							>Liturgia</span
						>
						<span
							class="text-xs font-bold text-text-main leading-tight mt-1 line-clamp-2 group-hover:text-brand-gold transition-colors"
						>
							{liturgiaDoDia}
						</span>
					</div>
				</a>

				<!-- Evangelho -->
				{#if evangelhoInfo}
					<a
						href="/liturgia"
						class="flex items-start gap-3 p-3 rounded-xl bg-bg-dark/45 border border-border-dark/60 hover:border-brand-gold/30 hover:bg-bg-dark/80 transition-all duration-200 group"
					>
						<div
							class="p-2 rounded-lg bg-brand-wine/10 border border-brand-wine/30 text-brand-gold shrink-0"
						>
							<Book size={14} />
						</div>
						<div class="flex flex-col min-w-0">
							<span
								class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/60 leading-none"
								>Evangelho</span
							>
							<span
								class="text-xs font-bold text-text-main leading-tight mt-1 truncate group-hover:text-brand-gold transition-colors"
							>
								{evangelhoInfo.referencia}
							</span>
							<span class="text-[9px] text-text-muted line-clamp-1 mt-0.5 font-sans leading-none"
								>{evangelhoInfo.titulo}</span
							>
						</div>
					</a>
				{/if}

				<!-- Santo do Dia -->
				<button
					onclick={() => handleComingSoon('Módulo de Santos do Dia')}
					class="flex items-start gap-3 p-3 rounded-xl bg-bg-dark/45 border border-border-dark/60 hover:border-brand-gold/30 hover:bg-bg-dark/80 transition-all duration-200 text-left group shrink-0 cursor-pointer"
				>
					<div
						class="p-2 rounded-lg bg-brand-wine/10 border border-brand-wine/30 text-brand-gold shrink-0"
					>
						<User size={14} />
					</div>
					<div class="flex flex-col min-w-0">
						<span
							class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/60 leading-none"
							>Santo do Dia</span
						>
						<span
							class="text-xs font-bold text-text-main leading-tight mt-1 line-clamp-2 group-hover:text-brand-gold transition-colors"
						>
							{santoDoDia}
						</span>
					</div>
				</button>

				<!-- Próxima Oração -->
				<div
					class="flex items-start gap-3 p-3 rounded-xl bg-bg-dark/45 border border-border-dark/60"
				>
					<div
						class="p-2 rounded-lg bg-brand-wine/10 border border-brand-wine/30 text-brand-gold shrink-0"
					>
						<Clock size={14} />
					</div>
					<div class="flex flex-col min-w-0">
						<span
							class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/60 leading-none"
							>Próxima Oração</span
						>
						<span class="text-xs font-bold text-text-main leading-tight mt-1">
							{currentLiturgicalHour.name}
						</span>
						<span
							class="text-[9px] text-text-muted italic line-clamp-1 mt-0.5 font-sans leading-none"
							title={currentLiturgicalHour.verse}
						>
							{currentLiturgicalHour.verse}
						</span>
					</div>
				</div>

				<!-- Próxima Missa -->
				{#if proximaMissa}
					<a
						href="/horarios"
						class="flex items-start gap-3 p-3 rounded-xl bg-bg-dark/45 border border-border-dark/60 hover:border-brand-gold/30 hover:bg-bg-dark/80 transition-all duration-200 group"
					>
						<div
							class="p-2 rounded-lg bg-brand-wine/10 border border-brand-wine/30 text-brand-gold shrink-0"
						>
							<Flame size={14} />
						</div>
						<div class="flex flex-col min-w-0">
							<span
								class="text-[8px] font-extrabold uppercase tracking-wider text-text-muted/60 leading-none"
								>Próxima Missa Hoje</span
							>
							<span
								class="text-xs font-bold text-text-main leading-tight mt-1 group-hover:text-brand-gold transition-colors"
							>
								{proximaMissa.timeStr} • {proximaMissa.churchName}
							</span>
							<span class="text-[9px] text-text-muted mt-0.5 font-sans leading-none"
								>Toque para ver detalhes e rotas</span
							>
						</div>
					</a>
				{/if}
			</div>
		</div>

		<!-- 5. Sua Jornada -->
		<div class="flex flex-col gap-3 w-full shrink-0">
			<h3
				class="text-[10px] font-extrabold text-brand-gold tracking-widest uppercase select-none leading-none"
			>
				Sua Jornada
			</h3>
			<div
				class="p-4 bg-bg-card/45 border border-border-dark rounded-2xl flex items-center justify-between gap-4 hover:border-brand-gold/25 transition-all duration-200"
			>
				<div class="flex items-center gap-3 min-w-0">
					<div
						class="h-10 w-10 rounded-xl bg-brand-wine/10 border border-brand-wine/30 flex items-center justify-center shrink-0"
					>
						<Flame size={18} class="text-brand-wine-text" />
					</div>
					<div class="flex flex-col min-w-0">
						<span class="text-xs font-bold text-text-main leading-tight"
							>Plano Espiritual Diário</span
						>
						<span class="text-[10px] text-text-muted mt-1 truncate font-sans"
							>Terço Mariano • Dia 12 de 30 (40%)</span
						>
					</div>
				</div>
				<button
					onclick={() => handleComingSoon('Plano Espiritual')}
					class="px-3.5 py-1.5 rounded-xl bg-brand-wine hover:bg-brand-wine-light text-[10px] font-extrabold text-white transition-all cursor-pointer leading-none"
				>
					Retomar
				</button>
			</div>
		</div>

		<!-- 6. Acesso Rápido -->
		<div class="flex flex-col gap-3 w-full shrink-0">
			<h3
				class="text-[10px] font-extrabold text-brand-gold tracking-widest uppercase select-none leading-none"
			>
				Acesso Rápido
			</h3>
			<div class="grid grid-cols-4 gap-3 sm:gap-4 w-full select-none">
				<!-- Bíblia -->
				<a
					href="/biblia"
					class="quick-access-btn flex flex-col items-center gap-2 text-center cursor-pointer"
				>
					<div
						class="h-12 w-12 rounded-2xl bg-bg-card border border-border-dark flex items-center justify-center text-brand-gold"
					>
						<Book size={20} />
					</div>
					<span class="text-[10px] font-bold text-text-main leading-none">Bíblia</span>
				</a>

				<!-- Orações -->
				<a
					href="/oracoes?tab=prayers"
					class="quick-access-btn flex flex-col items-center gap-2 text-center cursor-pointer"
				>
					<div
						class="h-12 w-12 rounded-2xl bg-bg-card border border-border-dark flex items-center justify-center text-brand-gold"
					>
						<Flame size={20} />
					</div>
					<span class="text-[10px] font-bold text-text-main leading-none">Orações</span>
				</a>

				<!-- Paróquias -->
				<a
					href="/paroquias"
					class="quick-access-btn flex flex-col items-center gap-2 text-center cursor-pointer"
				>
					<div
						class="h-12 w-12 rounded-2xl bg-bg-card border border-border-dark flex items-center justify-center text-brand-gold"
					>
						<MapPin size={20} />
					</div>
					<span class="text-[10px] font-bold text-text-main leading-none">Paróquias</span>
				</a>

				<!-- Confissão -->
				<a
					href="/oracoes?tab=exame"
					class="quick-access-btn flex flex-col items-center gap-2 text-center cursor-pointer"
				>
					<div
						class="h-12 w-12 rounded-2xl bg-bg-card border border-border-dark flex items-center justify-center text-brand-gold"
					>
						<CheckSquare size={20} />
					</div>
					<span class="text-[10px] font-bold text-text-main leading-none">Confissão</span>
				</a>

				<!-- Santos -->
				<button
					onclick={() => handleComingSoon('Módulo de Santos do Dia')}
					class="quick-access-btn flex flex-col items-center gap-2 text-center cursor-pointer bg-transparent border-none"
				>
					<div
						class="h-12 w-12 rounded-2xl bg-bg-card border border-border-dark flex items-center justify-center text-brand-gold"
					>
						<User size={20} />
					</div>
					<span class="text-[10px] font-bold text-text-main leading-none">Santos</span>
				</button>

				<!-- Leituras -->
				<a
					href="/liturgia"
					class="quick-access-btn flex flex-col items-center gap-2 text-center cursor-pointer"
				>
					<div
						class="h-12 w-12 rounded-2xl bg-bg-card border border-border-dark flex items-center justify-center text-brand-gold"
					>
						<BookOpen size={20} />
					</div>
					<span class="text-[10px] font-bold text-text-main leading-none">Leituras</span>
				</a>

				<!-- Favoritos -->
				<button
					onclick={() => handleComingSoon('Módulo de Favoritos')}
					class="quick-access-btn flex flex-col items-center gap-2 text-center cursor-pointer bg-transparent border-none"
				>
					<div
						class="h-12 w-12 rounded-2xl bg-bg-card border border-border-dark flex items-center justify-center text-brand-gold"
					>
						<Star size={20} />
					</div>
					<span class="text-[10px] font-bold text-text-main leading-none">Favoritos</span>
				</button>
			</div>
		</div>

		<!-- 7. Paróquias Próximas -->
		<div class="flex flex-col gap-3 w-full shrink-0">
			<h3
				class="text-[10px] font-extrabold text-brand-gold tracking-widest uppercase select-none leading-none"
			>
				Paróquias
			</h3>
			<div
				class="p-4 bg-bg-card/45 border border-border-dark rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-gold/25 transition-all duration-200"
			>
				<div class="flex items-center gap-3">
					<div
						class="h-10 w-10 rounded-xl bg-brand-gold-dim flex items-center justify-center shrink-0"
					>
						<MapPin size={18} class="text-brand-gold" />
					</div>
					<div class="flex flex-col">
						<span class="text-xs font-bold text-text-main leading-tight">Buscar Paróquias</span>
						<span class="text-[10px] text-text-muted mt-1 leading-normal font-sans"
							>Encontre missas, confissões e adorações perto de você.</span
						>
					</div>
				</div>
				<a
					href="/paroquias"
					class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-bg-dark border border-border-dark hover:border-brand-gold/30 hover:bg-bg-dark/80 text-xs font-bold text-brand-gold transition-all cursor-pointer leading-none shrink-0"
				>
					<span>Buscar no Mapa</span>
					<ArrowRight size={12} />
				</a>
			</div>
		</div>

		<!-- 8. Comunidade -->
		<div
			class="w-full bg-gradient-to-r from-brand-wine/15 via-brand-gold-dim/5 to-brand-wine/20 border border-border-dark rounded-2xl p-4 text-left flex flex-col sm:flex-row items-center justify-between gap-4 select-none relative overflow-hidden animate-fade-in pb-6 shrink-0"
		>
			<div class="space-y-1.5 z-10 max-w-xl">
				<h3 class="text-xs sm:text-sm font-bold text-text-main tracking-tight font-sans">
					Falta algum horário de Missa ou Confissão?
				</h3>
				<p class="text-[10px] text-text-muted leading-relaxed font-sans">
					Ajude a comunidade! Cadastre horários diretamente no mapa para que outros fiéis fiquem
					informados.
				</p>
			</div>
			<a
				href="/paroquias"
				class="px-4 py-2 text-white text-[10px] font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5 z-10 cursor-pointer font-sans leading-none"
				style="background-color: #f06e2b; box-shadow: 0 4px 14px rgba(240, 110, 43, 0.45);"
			>
				<span>Adicionar Horário</span>
				<ArrowRight size={12} />
			</a>
			<div
				class="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-[#f06e2b]/5 blur-2xl pointer-events-none"
			></div>
		</div>
	</div>
</div>
