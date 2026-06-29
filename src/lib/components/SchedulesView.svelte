<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { MapPin, ChevronUp, ChevronDown } from '@lucide/svelte';

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
		getIcon,
		currentLiturgicalHour
	} = $props<{
		churches: Church[];
		schedules: Schedule[];
		selectedChurchId: string;
		getIcon: (type: string) => any;
		currentLiturgicalHour: { name: string; verse: string; imageUrl: string };
	}>();

	const nav = getContext<{ activeRoute: string }>('navigation');

	let activeTab = $state('Todos');
	let carouselElement = $state<HTMLDivElement>();
	let expandedChurchId = $state<string | null>(null);

	const dayMap: Record<string, string> = {
		'Segunda': 'Seg',
		'Terça': 'Ter',
		'Quarta': 'Qua',
		'Quinta': 'Qui',
		'Sexta': 'Sex',
		'Sábado': 'Sáb',
		'Domingo': 'Dom'
	};

	let filteredChurches = $derived(
		churches.filter((church: Church) => {
			if (activeTab === 'Todos') return true;
			const targetDay = dayMap[activeTab];
			return church.schedules.some((s: { type: string; day: string; time: string }) => s.day === targetDay);
		})
	);

	function getSchedulesForChurch(churchId: string) {
		return schedules.filter((s: Schedule) => {
			if (s.churchId !== churchId) return false;
			if (activeTab === 'Todos') return true;
			const targetDay = dayMap[activeTab];
			return s.weekday === targetDay;
		});
	}

	// Synchronize selectedChurchId and expandedChurchId on mobile
	$effect(() => {
		if (selectedChurchId) {
			untrack(() => {
				expandedChurchId = selectedChurchId;
			});
		}
	});

	// Automatically update selection if current selected church is filtered out
	$effect(() => {
		if (filteredChurches.length > 0) {
			const activeId = selectedChurchId;
			const exists = filteredChurches.some((c: Church) => c.id === activeId);
			if (!exists) {
				untrack(() => {
					selectedChurchId = filteredChurches[0].id;
				});
			}
		}
	});

	// Automatically scroll selected card into view in horizontal carousel
	$effect(() => {
		if (selectedChurchId && carouselElement) {
			const activeCard = carouselElement.querySelector(`#card-${selectedChurchId}`);
			if (activeCard) {
				activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
			}
		}
	});
</script>

<!-- HORÁRIOS VIEW (SÓ O CARROSSEL) -->
<div class="flex-1 w-full min-h-0 overflow-y-auto flex flex-col justify-start items-center py-6 px-6 sm:px-12 gap-6 max-w-7xl mx-auto">
	
	<!-- Devotional Panel (Liturgical Hours) -->
	<div class="w-full max-w-2xl bg-bg-card border border-border-dark shadow-xl rounded-2xl overflow-hidden flex flex-col sm:flex-row h-auto sm:h-40 shrink-0 transition-all duration-200 hover:border-brand-gold/30">
		<!-- Left/Top Side: Image with Liturgical Filters -->
		<div class="relative w-full sm:w-54 h-50 sm:h-full bg-bg-dark overflow-hidden select-none border-b sm:border-b-0 sm:border-r border-border-dark/50 shrink-0">
			<img 
				src={currentLiturgicalHour.imageUrl} 
				alt={currentLiturgicalHour.name} 
				class="absolute inset-0 w-full h-full object-cover opacity-100 transition-all duration-300 liturgical-woodcut-dark"
			/>
			<div class="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-bg-card/25 to-bg-card/90"></div>
		</div>

		<!-- Right/Bottom Side: Text Content -->
		<div class="flex-1 p-5 flex flex-col justify-center gap-1.5 select-none text-left">
			<span class="text-[12px] font-bold tracking-widest text-brand-gold font-sans block">Reze agora as</span>
			<h3 class="text-xl font-bold text-brand-gold font-gothic tracking-wider leading-none">
				{currentLiturgicalHour.name.split(' ')[0]}
			</h3>
			<p class="text-xs text-text-muted italic leading-relaxed font-serif pr-4">
				{currentLiturgicalHour.verse}
			</p>
		</div>
	</div>

	<div class="text-center space-y-1 select-none mt-2">
		<h2 class="text-3xl font-bold text-text-main tracking-tight font-sans">Encontre missas e confissões</h2>
	</div>

	<!-- Weekday Tabs/Filters -->
	<div class="flex flex-wrap justify-center gap-1 border-b border-border-dark/60 pb-px w-fit mx-auto mt-1 shrink-0 max-w-full">
		{#each ['Todos', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as tab}
			<button
				onclick={() => activeTab = tab}
				class="px-3 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-all relative -bottom-[1px] font-sans whitespace-nowrap
				{activeTab === tab 
					? 'border-brand-gold text-brand-gold font-bold' 
					: 'border-transparent text-text-muted hover:text-text-main'}"
			>
				{tab}
			</button>
		{/each}
	</div>

	<!-- Desktop Carousel wrapper (to avoid CSS specificity collisions with hidden utility class) -->
	<div class="hidden md:block w-full">
		<!-- Horizontal Carousel (Deck of Cards - Visible on Desktop) -->
		<div bind:this={carouselElement} class="carousel-container mt-2 w-full">
		{#each filteredChurches as church}
			{@const isActive = church.id === selectedChurchId}
			<div
				role="button"
				tabindex="0"
				id="card-{church.id}"
				onclick={() => selectedChurchId = church.id}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						selectedChurchId = church.id;
					}
				}}
				class="carousel-card text-left rounded-2xl border transition-all flex flex-col justify-between shrink-0 cursor-pointer relative overflow-hidden
				{isActive 
					? 'w-[320px] md:w-[380px] p-6 bg-bg-card border-brand-gold gold-glow-active opacity-100 z-10 scale-100' 
					: 'w-[250px] md:w-[280px] p-5 bg-bg-card/45 border-border-dark opacity-65 scale-95 blur-[0.3px] hover:opacity-85 hover:border-brand-gold/20'}"
			>
				<!-- Card Background Image Watermark -->
				<div class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden transition-all duration-300 {isActive ? 'opacity-[0.8] dark:opacity-[0.2]' : 'opacity-[0.2] dark:opacity-[0.1]'}">
					<img 
						src={church.bgImage} 
						alt="" 
						class="w-full h-full object-cover select-none pointer-events-none"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-bg-card/95 via-bg-card/75 to-bg-card/20 dark:from-bg-card/98 dark:via-bg-card/85 dark:to-bg-card/40"></div>
				</div>

				<!-- Content Wrapper (z-10 to stay above background image) -->
				<div class="relative z-10 flex flex-col gap-3 w-full">
					<!-- Title and Header -->
					<div class="space-y-1 select-none">
						<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold block font-sans">Paróquia</span>
						<h3 class="text-md md:text-lg font-bold text-text-main tracking-tight leading-snug line-clamp-1 font-sans">{church.name}</h3>
					</div>

					<!-- Details Section -->
					<div class="space-y-1.5 text-text-muted text-xs select-none">
						{#if isActive}
							<!-- Address Link (Active) -->
							<div
								role="button"
								tabindex="0"
								onclick={(e) => {
									e.stopPropagation();
									selectedChurchId = church.id;
									goto('/paroquias');
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										e.stopPropagation();
										selectedChurchId = church.id;
										goto('/paroquias');
									}
								}}
								class="flex items-start gap-2 text-left hover:text-brand-gold group transition-colors w-full cursor-pointer select-none"
								title="Ver localização no mapa"
							>
								<MapPin size={13} class="text-text-muted group-hover:text-brand-gold shrink-0 mt-0.5" />
								<span class="leading-normal line-clamp-2 group-hover:underline">{church.address}</span>
							</div>
							<div class="pt-1 flex items-center">
								<div
									role="button"
									tabindex="0"
									onclick={(e) => {
										e.stopPropagation();
										selectedChurchId = church.id;
										goto('/paroquias');
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											e.stopPropagation();
											selectedChurchId = church.id;
											goto('/paroquias');
										}
									}}
									class="text-[11px] font-bold text-brand-gold hover:text-brand-gold-muted hover:underline flex items-center gap-1 cursor-pointer select-none"
									title="Abrir paróquia no mapa"
								>
									Ver no mapa →
								</div>
							</div>
						{:else}
							<!-- Summary (Inactive) -->
							<p class="text-xs text-text-muted line-clamp-2 leading-relaxed font-sans">{church.address}</p>
						{/if}
					</div>
					
					<!-- Next schedules (Active) -->
					{#if isActive}
						<div class="pt-3 border-t border-border-dark/30 w-full select-none">
							<span class="text-[9px] font-bold uppercase tracking-widest text-brand-gold block mb-2 font-sans">Próximos Horários</span>
							<div class="space-y-1.5 max-h-32 overflow-y-auto pr-1">
								{#each getSchedulesForChurch(church.id).slice(0, 3) as item}
									{@const Icon = getIcon(item.type)}
									<div class="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-bg-dark/40 border border-border-dark/50 font-sans">
										<span class="font-bold text-text-main font-mono">{item.timeStr} <span class="text-text-muted font-sans font-normal">({item.dateStr})</span></span>
										<div class="flex items-center gap-1">
											<Icon size={11} class={item.type === 'Confissão' ? 'text-brand-wine' : 'text-brand-gold'} />
											<span class="text-text-muted text-[10px]">{item.type}</span>
										</div>
									</div>
								{/each}
								{#if getSchedulesForChurch(church.id).length === 0}
									<span class="text-xs text-text-dim block font-sans">Nenhum horário cadastrado.</span>
								{/if}
							</div>
						</div>
					{/if}
				</div>

				<!-- Footer details -->
				<div class="border-t border-border-dark/30 pt-3 mt-4 flex justify-between items-center w-full relative z-10 select-none">
					<span class="text-[9px] text-text-dim font-bold uppercase font-sans">Grade Semanal</span>
					<span class="tag tag-gold text-[9px] py-0.5 px-2 font-sans">{church.schedules.length} horários</span>
				</div>
			</div>
		{/each}

		{#if filteredChurches.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center w-full">
				<p class="text-xs text-text-muted font-medium font-sans">Nenhuma paróquia com horários cadastrados nesta categoria.</p>
			</div>
		{/if}
		</div>
	</div>

	<!-- Mobile Accordion List (Visible on Mobile) -->
	<div class="flex flex-col md:hidden w-full gap-3 px-1 mt-2 select-none">
		{#each filteredChurches as church (church.id)}
			{@const isExpanded = expandedChurchId === church.id}
			{@const churchSchedules = getSchedulesForChurch(church.id)}
			<div 
				class="border bg-bg-card rounded-2xl overflow-hidden transition-all duration-300
				{isExpanded 
					? 'border-brand-gold gold-glow-active' 
					: 'border-border-dark/60 shadow-md'}"
			>
				<!-- Collapsed Header Button -->
				<button
					onclick={() => {
						expandedChurchId = isExpanded ? null : church.id;
						selectedChurchId = church.id;
					}}
					class="w-full p-4 flex items-center justify-between text-left cursor-pointer"
				>
					<div class="flex-1 min-w-0 pr-3">
						<span class="text-[9px] uppercase tracking-widest text-brand-gold font-bold font-sans block mb-0.5">Paróquia</span>
						<h3 class="text-sm font-bold text-text-main leading-tight font-sans tracking-tight truncate">{church.name}</h3>
						<div class="flex items-center gap-1 text-[11px] text-text-muted mt-1">
							<MapPin size={10} class="shrink-0 text-brand-gold" />
							<span class="truncate">{church.address.split('-')[0]}</span>
						</div>
					</div>
					
					<div class="flex items-center gap-3 shrink-0">
						<span class="text-[10px] font-bold text-brand-gold bg-brand-gold-dim/10 px-2 py-0.5 rounded border border-brand-gold/15">
							{churchSchedules.length} {churchSchedules.length === 1 ? 'horário' : 'horários'}
						</span>
						{#if isExpanded}
							<ChevronUp size={16} class="text-brand-gold" />
						{:else}
							<ChevronDown size={16} class="text-text-muted" />
						{/if}
					</div>
				</button>

				<!-- Expanded Content -->
				{#if isExpanded}
					<div class="px-4 pb-4 border-t border-border-dark/30 pt-3 flex flex-col gap-4 animate-fade-in font-sans">
						<!-- Actions row -->
						<div class="flex items-center justify-between select-none">
							<span class="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Horários</span>
							
							<button 
								onclick={(e) => {
									e.stopPropagation();
									selectedChurchId = church.id;
									goto('/paroquias');
								}}
								class="text-[11px] font-bold text-brand-gold hover:text-brand-gold-muted flex items-center gap-1 transition-colors hover:underline cursor-pointer"
							>
								<span>Ver no mapa</span>
								<span>→</span>
							</button>
						</div>

						<!-- Schedules List -->
						<div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
							{#each churchSchedules as sched}
								{@const IconComponent = getIcon(sched.type)}
								<div class="flex items-center justify-between text-xs py-1.5 border-b border-border-dark/20">
									<div class="flex items-center gap-2">
										<span class="font-bold text-text-main font-mono">{sched.timeStr} <span class="text-text-muted font-normal font-sans">({sched.dateStr})</span></span>
									</div>
									<div class="flex items-center gap-1 text-[10px] text-brand-gold font-medium bg-brand-gold-dim/10 px-2 py-0.5 rounded border border-brand-gold/15">
										<IconComponent size={9} />
										<span>{sched.type}</span>
									</div>
								</div>
							{:else}
								<span class="text-xs text-text-muted italic block py-4 text-center">Nenhum horário correspondente.</span>
							{/each}
						</div>

						<!-- Contact & Week Details -->
						<div class="pt-3 border-t border-border-dark/30 flex items-center justify-between text-[10px] text-text-muted">
							<span>Grade Semanal</span>
							<span class="font-bold text-brand-gold">{church.schedules.length} horários cadastrados</span>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="text-center py-10 font-sans border border-dashed border-border-dark/60 rounded-2xl p-6 bg-bg-card/25 select-none">
				<span class="text-sm text-text-muted block">Nenhuma paróquia encontrada para este filtro.</span>
			</div>
		{/each}
	</div>
</div>
