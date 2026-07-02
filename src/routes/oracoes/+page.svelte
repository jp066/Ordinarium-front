<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { page } from '$app/stores';
	import SEO from '$lib/components/SEO.svelte';
	import {
		Flame,
		BookOpen,
		Search,
		Check,
		Copy,
		RefreshCw,
		Compass,
		ChevronRight,
		ChevronDown,
		X,
		CheckSquare,
		Square,
		Info,
		ChevronLeft,
		Printer
	} from '@lucide/svelte';

	interface Prayer {
		id: number;
		slug: string;
		title: string;
		category: string;
		text: string;
		source: string;
		language: string;
	}

	interface ExaminationQuestion {
		text: string;
		response: boolean;
	}

	interface ExaminationCategory {
		category: string;
		questions: ExaminationQuestion[];
	}

	// Svelte 5 props
	let { data } = $props<{
		data: {
			success: boolean;
			prayers?: Prayer[];
			randomPrayer?: Prayer;
			examination?: ExaminationCategory[];
			error?: string;
		};
	}>();

	// Navigation tab state
	let activeTab = $state<'prayers' | 'examination'>('prayers');

	// Synchronize tab state with query parameter
	$effect(() => {
		const tabParam = $page.url.searchParams.get('tab');
		if (tabParam === 'exame' || tabParam === 'examination') {
			activeTab = 'examination';
		} else if (tabParam === 'prayers' || tabParam === 'oracoes') {
			activeTab = 'prayers';
		}
	});

	// Prayers list state
	let searchQuery = $state('');
	let selectedCategory = $state('Todos');
	let selectedPrayer = $state<Prayer | null>(null);

	// Featured prayer state (client-side randomizer)
	let featuredPrayer = $state<Prayer | null>(null);

	$effect(() => {
		if (data.randomPrayer && !featuredPrayer) {
			featuredPrayer = data.randomPrayer;
		}
	});

	// Text size adjustment state
	let readerFontSize = $state('text-sm md:text-base');

	// Copy to clipboard feedback
	let copied = $state(false);

	// Examination of Conscience expanded states
	let expandedCategories = $state<Record<string, boolean>>({
		Introdução: true // Keep introduction open by default
	});

	// Checked reflection questions mapping
	let checkedQuestions = $state<Record<string, boolean>>({});

	// Total checked reflection questions count
	const checkedQuestionsCount = $derived.by(() => {
		return Object.keys(checkedQuestions).filter((key) => checkedQuestions[key]).length;
	});

	// Unique categories list derived from prayers
	const categories: string[] = $derived.by(() => {
		if (!data.prayers) return [];
		const set = new Set<string>(data.prayers.map((p: Prayer) => p.category));
		return ['Todos', ...Array.from(set)];
	});

	// Filtered prayers based on category and search query
	const filteredPrayers = $derived.by(() => {
		if (!data.prayers) return [];
		return data.prayers.filter((p: Prayer) => {
			const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
			const matchesSearch =
				!searchQuery ||
				p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.category.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCat && matchesSearch;
		});
	});

	// Draw another random prayer from memory
	function drawAnotherFeatured() {
		if (data.prayers && data.prayers.length > 0) {
			let next: Prayer;
			do {
				next = data.prayers[Math.floor(Math.random() * data.prayers.length)];
			} while (data.prayers.length > 1 && next.id === featuredPrayer?.id);
			featuredPrayer = next;
		}
	}

	// Copy content helper
	function handleCopy(text: string) {
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	// Toggle examination category accordion
	function toggleCategory(cat: string) {
		expandedCategories[cat] = !expandedCategories[cat];
	}

	// Toggle specific reflection question checkbox
	function toggleQuestion(questionKey: string) {
		checkedQuestions[questionKey] = !checkedQuestions[questionKey];
	}

	// Count completed questions in a category
	function getCompletedCount(cat: ExaminationCategory) {
		return cat.questions.filter((q) => checkedQuestions[`${cat.category}-${q.text}`]).length;
	}

	// Schema markup for SEO
	const pageSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Orações Católicas e Exame de Consciência',
		description:
			'Lista de orações tradicionais da Igreja Católica (Pai Nosso, Ave Maria, Terços) e guia prático com checklist para Exame de Consciência.',
		publisher: {
			'@type': 'Organization',
			name: 'Ordinarium'
		}
	};
</script>

<SEO
	title={activeTab === 'prayers'
		? 'Orações e Devoções Católicas'
		: 'Exame de Consciência para Confissão'}
	description="Acesse orações tradicionais da Igreja Católica como o Pai Nosso, Ave Maria, Terço da Misericórdia, São Miguel Arcanjo e realize o Exame de Consciência estruturado para uma boa confissão."
	keywords={[
		'orações católicas',
		'pai nosso',
		'ave maria',
		'salve rainha',
		'santo terço',
		'terço da misericórdia',
		'ato de contrição',
		'exame de consciência',
		'confissão católica',
		'devoção'
	]}
	schema={pageSchema}
/>

<div
	class="w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col justify-start items-center py-4 px-4 sm:px-10 gap-4 max-w-5xl mx-auto font-sans relative bg-transparent text-text-main transition-colors duration-200 screen-only"
>
	{#if !data.success}
		<!-- Error State -->
		<div
			class="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md my-12 bg-bg-card border border-border-dark shadow-2xl rounded-2xl shrink-0"
		>
			<div
				class="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/25 mb-4"
			>
				<Compass class="h-6 w-6 text-red-400" />
			</div>
			<h3 class="text-lg font-bold text-text-main">Falha de conexão</h3>
			<p class="text-xs text-text-muted mt-2 leading-relaxed">
				{data.error ||
					'Não foi possível carregar as orações da API. Verifique se o servidor de backend está executando.'}
			</p>
			<div class="flex gap-3 mt-6">
				<a
					href="/oracoes"
					class="px-4 py-2 rounded-xl bg-brand-wine hover:bg-brand-wine/90 border border-brand-wine/30 text-xs font-bold text-white transition-all cursor-pointer"
				>
					Tentar novamente
				</a>
				<a
					href="/"
					class="px-4 py-2 rounded-xl bg-bg-dark hover:bg-bg-dark/80 border border-border-dark text-xs font-bold text-text-muted hover:text-text-main transition-all cursor-pointer"
				>
					Ir ao Início
				</a>
			</div>
		</div>
	{:else}
		<!-- Header Tab Navigation (Title only, switcher removed) -->
		<div
			class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 select-none border-b border-border-dark/40 shrink-0"
		>
			<div class="flex flex-col">
				<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold"
					>Espiritualidade</span
				>
				<h2 class="text-sm font-bold text-text-main">
					{activeTab === 'examination' ? 'Exame de Consciência' : 'Orações e Devoções'}
				</h2>
			</div>
		</div>

		<!-- Main content cards based on selected tab -->
		{#if activeTab === 'prayers'}
			<!-- ── ORAÇÕES TAB ── -->
			<!-- Filters Subheader -->
			<div class="w-full flex flex-col md:flex-row gap-3 items-center shrink-0">
				<!-- Search -->
				<div class="relative w-full md:w-72 shrink-0">
					<Search size={14} class="absolute left-3.5 top-3.5 text-text-muted/60" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Buscar oração pelo título ou texto..."
						class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-dark bg-bg-card text-xs text-text-main placeholder-text-muted/50 focus:border-brand-gold/40 focus:outline-none transition-all shadow-sm"
					/>
				</div>

				<!-- Categories Pills -->
				<div class="w-full flex overflow-x-auto gap-2 py-1 select-none scrollbar-none">
					{#each categories as cat (cat)}
						<button
							onclick={() => {
								selectedCategory = cat;
								selectedPrayer = null;
							}}
							class="shrink-0 text-[10px] font-bold py-1.5 px-3 rounded-full border transition-all cursor-pointer
							{selectedCategory === cat
								? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40 font-extrabold shadow-sm'
								: 'bg-bg-dark border-border-dark text-text-muted hover:text-text-main hover:bg-bg-card'}"
						>
							{cat}
						</button>
					{/each}
				</div>
			</div>

			<!-- Split Layout -->
			<div class="flex-1 w-full min-h-0 flex flex-col md:flex-row gap-6 relative">
				<!-- Left list pane -->
				<div class="w-full md:w-5/12 h-full overflow-y-auto pr-1 space-y-2 pb-16">
					{#if filteredPrayers.length === 0}
						<div
							class="flex flex-col items-center justify-center p-8 text-center bg-bg-card/40 border border-border-dark/60 rounded-2xl"
						>
							<span class="text-text-muted/40 text-xs"
								>Nenhuma oração encontrada para os termos inseridos.</span
							>
						</div>
					{:else}
						{#each filteredPrayers as prayer (prayer.id)}
							<button
								onclick={() => (selectedPrayer = prayer)}
								class="w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2 group
								{selectedPrayer?.id === prayer.id
									? 'bg-brand-wine/10 border-brand-wine/30'
									: 'bg-bg-card border-border-dark hover:border-brand-gold/25 hover:bg-bg-card/90'}"
							>
								<div class="flex justify-between items-start w-full">
									<h4
										class="text-xs sm:text-sm font-bold text-text-main group-hover:text-brand-gold transition-colors leading-tight"
									>
										{prayer.title}
									</h4>
									<span
										class="text-[9px] px-1.5 py-0.5 rounded border border-border-dark bg-bg-dark text-text-muted leading-none uppercase font-semibold"
									>
										{prayer.category}
									</span>
								</div>
								<p class="text-[10px] sm:text-xs text-text-muted line-clamp-2 leading-relaxed">
									{prayer.text}
								</p>
							</button>
						{/each}
					{/if}
				</div>

				<!-- Right detail pane (Desktop) -->
				<div
					class="hidden md:flex md:w-7/12 h-full border border-border-dark bg-bg-card rounded-2xl flex-col overflow-hidden pb-16"
				>
					<!-- Active Prayer Reader -->
					{#if selectedPrayer}
						{@const p = selectedPrayer}
						<!-- Detail Header -->
						<div
							class="p-5 border-b border-border-dark/40 bg-bg-card/40 select-none flex items-center justify-between shrink-0"
						>
							<div class="flex flex-col gap-1">
								<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold"
									>{p.category}</span
								>
								<h3 class="text-sm sm:text-md font-bold text-text-main leading-tight font-sans">
									{p.title}
								</h3>
								{#if p.source}
									<span class="text-[10px] text-text-muted font-sans">Fonte: {p.source}</span>
								{/if}
							</div>

							<!-- Action controls -->
							<div class="flex items-center gap-1.5">
								<!-- Copy -->
								<button
									onclick={() => handleCopy(p.text)}
									class="p-2 rounded-xl border border-border-dark bg-bg-dark hover:bg-bg-dark/80 hover:border-brand-gold/30 text-text-muted hover:text-text-main transition-all cursor-pointer relative"
									title="Copiar texto"
								>
									{#if copied}
										<Check size={13} class="text-status-success animate-pulse-slow" />
									{:else}
										<Copy size={13} />
									{/if}
								</button>

								<!-- Font size -->
								<div
									class="flex items-center gap-1 rounded-xl p-0.5 border border-border-dark bg-bg-dark"
								>
									<button
										onclick={() => (readerFontSize = 'text-xs md:text-sm')}
										class="text-[9px] px-1.5 py-1 rounded font-bold transition-all cursor-pointer
										{readerFontSize === 'text-xs md:text-sm'
											? 'bg-brand-gold/15 text-brand-gold'
											: 'text-text-muted hover:text-text-main'}"
									>
										A-
									</button>
									<button
										onclick={() => (readerFontSize = 'text-sm md:text-base')}
										class="text-[9px] px-1.5 py-1 rounded font-bold transition-all cursor-pointer
										{readerFontSize === 'text-sm md:text-base'
											? 'bg-brand-gold/15 text-brand-gold'
											: 'text-text-muted hover:text-text-main'}"
									>
										A
									</button>
									<button
										onclick={() => (readerFontSize = 'text-base md:text-lg')}
										class="text-[9px] px-1.5 py-1 rounded font-bold transition-all cursor-pointer
										{readerFontSize === 'text-base md:text-lg'
											? 'bg-brand-gold/15 text-brand-gold'
											: 'text-text-muted hover:text-text-main'}"
									>
										A+
									</button>
								</div>
							</div>
						</div>

						<!-- Detail Text Body -->
						<div class="flex-1 overflow-y-auto p-6 scroll-smooth select-all">
							<div
								class="{readerFontSize} font-serif leading-relaxed text-justify whitespace-pre-line text-text-main/90 pr-1"
							>
								{p.text}
							</div>
						</div>
					{:else}
						<!-- Default Featured random prayer view -->
						{#if featuredPrayer}
							{@const p = featuredPrayer}
							<div class="flex-1 flex flex-col p-6 overflow-hidden">
								<div
									class="flex-1 border border-brand-gold/20 bg-brand-gold-dim/5 rounded-2xl flex flex-col p-6 relative overflow-hidden"
								>
									<!-- Decorative background cross/crest details -->
									<div
										class="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none select-none"
									>
										<Flame size={180} class="text-brand-gold" />
									</div>

									<div class="flex justify-between items-start shrink-0 mb-4 select-none">
										<div class="flex flex-col gap-1">
											<span
												class="text-[9px] px-2 py-0.5 rounded border border-brand-gold/25 bg-brand-gold/10 text-brand-gold uppercase font-bold tracking-wide self-start leading-none"
											>
												Oração Recomendada
											</span>
											<h3 class="text-sm sm:text-md font-bold text-text-main font-sans mt-2">
												{p.title}
											</h3>
											{#if p.source}
												<span class="text-[10px] text-text-muted">Fonte: {p.source}</span>
											{/if}
										</div>

										<div class="flex items-center gap-1.5">
											<!-- Copy -->
											<button
												onclick={() => handleCopy(p.text)}
												class="p-2 rounded-xl border border-border-dark bg-bg-dark hover:bg-bg-dark/80 hover:border-brand-gold/30 text-text-muted hover:text-text-main transition-all cursor-pointer"
												title="Copiar texto"
											>
												{#if copied}
													<Check size={13} class="text-status-success" />
												{:else}
													<Copy size={13} />
												{/if}
											</button>

											<!-- Refresh -->
											<button
												onclick={drawAnotherFeatured}
												class="p-2 rounded-xl border border-border-dark bg-bg-dark hover:bg-bg-dark/80 hover:border-brand-gold/30 text-text-muted hover:text-text-main transition-all cursor-pointer"
												title="Sortear outra"
											>
												<RefreshCw size={13} />
											</button>
										</div>
									</div>

									<!-- Text area -->
									<div class="flex-1 overflow-y-auto pr-1">
										<p
											class="text-sm font-serif leading-relaxed text-justify whitespace-pre-line text-text-main/80 italic"
										>
											{p.text}
										</p>
									</div>
								</div>
							</div>
						{:else}
							<div
								class="flex-1 flex flex-col items-center justify-center text-center p-8 select-none"
							>
								<Flame size={24} class="text-text-muted/40 mb-3" />
								<span class="text-xs text-text-muted/40"
									>Selecione uma oração na lista à esquerda.</span
								>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Mobile Fullscreen Overlay Detail View (rendered when selectedPrayer is true on mobile) -->
				{#if selectedPrayer}
					{@const p = selectedPrayer}
					<div
						class="md:hidden fixed inset-0 z-[1050] bg-bg-dark/95 backdrop-blur-md flex flex-col p-6 animate-fade-in"
					>
						<!-- Overlay header -->
						<div
							class="flex items-center justify-between border-b border-border-dark pb-4 mb-4 shrink-0"
						>
							<button
								onclick={() => (selectedPrayer = null)}
								class="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main font-bold cursor-pointer"
							>
								<ChevronLeft size={16} />
								<span>Voltar</span>
							</button>

							<div class="flex items-center gap-1.5">
								<button
									onclick={() => handleCopy(p.text)}
									class="p-2 rounded-xl border border-border-dark bg-bg-card text-text-muted hover:text-text-main cursor-pointer"
									title="Copiar texto"
								>
									{#if copied}
										<Check size={13} class="text-status-success" />
									{:else}
										<Copy size={13} />
									{/if}
								</button>
								<button
									onclick={() => (selectedPrayer = null)}
									class="p-2 rounded-xl border border-border-dark bg-bg-card text-text-muted hover:text-text-main cursor-pointer"
								>
									<X size={13} />
								</button>
							</div>
						</div>

						<!-- Content header -->
						<div class="mb-4 shrink-0">
							<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold"
								>{p.category}</span
							>
							<h3 class="text-md font-bold text-text-main font-sans mt-0.5">{p.title}</h3>
							{#if p.source}
								<span class="text-[10px] text-text-muted">Fonte: {p.source}</span>
							{/if}
						</div>

						<!-- Content scroll area -->
						<div class="flex-1 overflow-y-auto pb-8 select-all">
							<p
								class="text-sm font-serif leading-relaxed text-justify whitespace-pre-line text-text-main/90 pr-1"
							>
								{p.text}
							</p>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<!-- ── EXAME DE CONSCIÊNCIA TAB ── -->
			<div class="flex-1 w-full overflow-y-auto pr-1 pb-16 space-y-6 scroll-smooth">
				<!-- Confession Steps Guide card -->
				<div class="border border-border-dark bg-bg-card/40 rounded-2xl p-5 flex flex-col gap-4">
					<div class="flex items-center gap-2.5 border-b border-border-dark/40 pb-3">
						<div
							class="h-6 w-6 rounded-md bg-brand-wine-dim border border-brand-wine/25 flex items-center justify-center shrink-0"
						>
							<Info size={12} class="text-brand-wine" />
						</div>
						<h3
							class="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-gold leading-none"
						>
							Como fazer uma boa Confissão?
						</h3>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
						<div
							class="p-3 bg-bg-dark/40 border border-border-dark/60 rounded-xl flex flex-col gap-1.5 text-center sm:text-left"
						>
							<span class="text-xs font-bold text-brand-gold">1. Exame</span>
							<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed">
								Fazer uma busca diligente dos pecados na memória.
							</p>
						</div>
						<div
							class="p-3 bg-bg-dark/40 border border-border-dark/60 rounded-xl flex flex-col gap-1.5 text-center sm:text-left"
						>
							<span class="text-xs font-bold text-brand-gold">2. Contrição</span>
							<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed">
								Arrepender-se de coração por ter ofendido a Deus.
							</p>
						</div>
						<div
							class="p-3 bg-bg-dark/40 border border-border-dark/60 rounded-xl flex flex-col gap-1.5 text-center sm:text-left"
						>
							<span class="text-xs font-bold text-brand-gold">3. Propósito</span>
							<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed">
								Tomar a firme resolução de evitar os pecados.
							</p>
						</div>
						<div
							class="p-3 bg-bg-dark/40 border border-border-dark/60 rounded-xl flex flex-col gap-1.5 text-center sm:text-left"
						>
							<span class="text-xs font-bold text-brand-gold">4. Acusação</span>
							<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed">
								Declarar todos os pecados confessáveis ao sacerdote.
							</p>
						</div>
						<div
							class="p-3 bg-bg-dark/40 border border-border-dark/60 rounded-xl flex flex-col gap-1.5 text-center sm:text-left"
						>
							<span class="text-xs font-bold text-brand-gold">5. Penitência</span>
							<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed">
								Cumprir de bom grado a penitência imposta pelo confessor.
							</p>
						</div>
					</div>
				</div>

				<!-- Categories questions list -->
				{#if !data.examination || data.examination.length === 0}
					<div class="w-full text-center p-8 border border-border-dark bg-bg-card/20 rounded-2xl">
						<span class="text-text-muted/40 text-xs">Exame de consciência não disponível.</span>
					</div>
				{:else}
					<div class="space-y-3">
						{#each data.examination as cat (cat.category)}
							{@const isExpanded = expandedCategories[cat.category]}
							{@const completedCount = getCompletedCount(cat)}
							{@const totalCount = cat.questions.length}
							{@const allDone = totalCount > 0 && completedCount === totalCount}

							<div
								class="border border-border-dark bg-bg-card rounded-2xl overflow-hidden transition-all duration-200"
							>
								<!-- Accordion Header Button -->
								<button
									onclick={() => toggleCategory(cat.category)}
									class="w-full flex items-center justify-between p-4 bg-bg-card/60 hover:bg-bg-card cursor-pointer border-b border-transparent transition-all
									{isExpanded ? 'border-border-dark/50' : ''}"
								>
									<div class="flex items-center gap-3">
										<div
											class="h-5 w-5 rounded-md flex items-center justify-center border shrink-0
											{allDone
												? 'bg-status-success/15 border-status-success/30 text-status-success'
												: completedCount > 0
													? 'bg-brand-gold/15 border-brand-gold/30 text-brand-gold'
													: 'bg-bg-dark border-border-dark text-text-muted'}"
										>
											{#if allDone}
												<Check size={10} />
											{:else}
												<span class="text-[9px] font-bold">{completedCount}</span>
											{/if}
										</div>

										<span class="text-xs sm:text-sm font-bold text-text-main leading-none">
											{cat.category}
										</span>

										{#if totalCount > 0}
											<span
												class="text-[9px] px-1.5 py-0.5 rounded-md bg-bg-dark border border-border-dark/60 text-text-muted/70 font-mono leading-none"
											>
												{completedCount}/{totalCount}
											</span>
										{/if}
									</div>

									<div class="text-text-muted/50 group-hover:text-text-main transition-colors">
										{#if isExpanded}
											<ChevronDown size={14} />
										{:else}
											<ChevronRight size={14} />
										{/if}
									</div>
								</button>

								<!-- Accordion Body content -->
								{#if isExpanded}
									<div class="p-5 space-y-3.5 bg-bg-dark/25 animate-fade-in">
										{#each cat.questions as question (question.text)}
											{@const qKey = `${cat.category}-${question.text}`}
											{@const isChecked = checkedQuestions[qKey]}

											<!-- Interactive Row -->
											<button
												onclick={() => toggleQuestion(qKey)}
												class="w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex gap-3.5 items-start group
												{isChecked
													? 'bg-status-success/5 border-status-success/15 shadow-sm'
													: 'bg-bg-card/40 border-border-dark/40 hover:border-brand-gold/20 hover:bg-bg-card'}"
											>
												<!-- Checkbox box -->
												<div
													class="mt-0.5 shrink-0 transition-transform group-hover:scale-105 duration-100"
												>
													{#if isChecked}
														<CheckSquare size={15} class="text-status-success" />
													{:else}
														<Square
															size={15}
															class="text-text-muted/50 group-hover:text-text-muted/80"
														/>
													{/if}
												</div>

												<!-- Question text -->
												<span
													class="text-xs sm:text-sm leading-relaxed text-text-main/80 font-sans group-hover:text-text-main transition-colors"
												>
													{question.text}
												</span>
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<!-- Floating Print Button (Screen only, visible when at least one question is checked) -->
{#if activeTab === 'examination' && checkedQuestionsCount > 0}
	<div class="fixed bottom-6 right-6 z-50 screen-only animate-fade-in">
		<button
			onclick={() => window.print()}
			class="flex items-center gap-2 px-5 py-3 rounded-full bg-brand-gold hover:bg-brand-gold-muted text-bg-dark font-bold text-xs sm:text-sm shadow-2xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
		>
			<Printer size={16} />
			<span>Gerar Memorial ({checkedQuestionsCount})</span>
		</button>
	</div>
{/if}

<!-- Printable Document (Only visible during print, formatted like exemplo-comprovante.png) -->
<div class="print-document hidden print:block">
	<div class="border-frame">
		<div class="border-inner">
			<!-- Radiating Cross SVG Header -->
			<div class="flex justify-center mb-3">
				<svg class="w-16 h-16 text-[#b89847]" viewBox="0 0 100 100" fill="currentColor">
					<g opacity="0.45">
						<line
							x1="50"
							y1="50"
							x2="50"
							y2="10"
							stroke="#b89847"
							stroke-width="0.8"
							stroke-dasharray="2,2"
						/>
						<line
							x1="50"
							y1="50"
							x2="50"
							y2="90"
							stroke="#b89847"
							stroke-width="0.8"
							stroke-dasharray="2,2"
						/>
						<line
							x1="50"
							y1="50"
							x2="10"
							y2="50"
							stroke="#b89847"
							stroke-width="0.8"
							stroke-dasharray="2,2"
						/>
						<line
							x1="50"
							y1="50"
							x2="90"
							y2="50"
							stroke="#b89847"
							stroke-width="0.8"
							stroke-dasharray="2,2"
						/>
						<line
							x1="50"
							y1="50"
							x2="20"
							y2="20"
							stroke="#b89847"
							stroke-width="0.6"
							stroke-dasharray="2,2"
						/>
						<line
							x1="50"
							y1="50"
							x2="80"
							y2="80"
							stroke="#b89847"
							stroke-width="0.6"
							stroke-dasharray="2,2"
						/>
						<line
							x1="50"
							y1="50"
							x2="20"
							y2="80"
							stroke="#b89847"
							stroke-width="0.6"
							stroke-dasharray="2,2"
						/>
						<line
							x1="50"
							y1="50"
							x2="80"
							y2="20"
							stroke="#b89847"
							stroke-width="0.6"
							stroke-dasharray="2,2"
						/>
					</g>
					<circle
						cx="50"
						cy="50"
						r="10"
						fill="none"
						stroke="#b89847"
						stroke-width="0.6"
						stroke-dasharray="1,2"
						opacity="0.6"
					/>
					<path
						d="M 48 25 L 52 25 L 52 46 L 66 46 L 66 50 L 52 50 L 52 80 L 48 80 L 48 50 L 34 50 L 34 46 L 48 46 Z"
					/>
				</svg>
			</div>

			<!-- Document Title -->
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold tracking-widest text-[#231f1a] font-serif uppercase">
					Memorial de Confissão
				</h1>
				<div class="flex items-center justify-center gap-2 mt-1">
					<span class="text-xs text-[#b89847]">❧</span>
					<h2 class="text-xs uppercase tracking-wider text-[#b89847] font-serif italic">
						Exame de Consciência
					</h2>
					<span class="text-xs text-[#b89847]">❧</span>
				</div>
			</div>

			<!-- Iterating through categories with checked questions -->
			{#if data.examination}
				<div class="space-y-6">
					{#each data.examination as cat (cat.category)}
						{@const checkedInCat = cat.questions.filter(
							(q: ExaminationQuestion) => checkedQuestions[`${cat.category}-${q.text}`]
						)}
						{#if checkedInCat.length > 0}
							<div class="print-category avoid-break">
								<div class="print-category-header">
									{#if cat.category === 'Amor a Deus'}
										<!-- Sacred Heart -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
												fill="currentColor"
											/>
											<path d="M12 5V2M10 3.5h4" stroke-linecap="round" />
										</svg>
									{:else if cat.category === 'Vida sacramental'}
										<!-- Chalice -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="M6 3h12v4c0 3-3 5-6 5s-6-2-6-5V3Z" fill="currentColor" />
											<path d="M12 12v6M8 18h8M9 21h6" stroke-linecap="round" />
										</svg>
									{:else if cat.category === 'Família'}
										<!-- Cross / Home -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
											<path d="M9 22V12h6v10" />
										</svg>
									{:else if cat.category === 'Trabalho'}
										<!-- Tool -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="m15 5 4 4M21.5 2.5a2.12 2.12 0 0 1 3 3L7 23l-4 1 1-4Z" />
										</svg>
									{:else if cat.category === 'Caridade'}
										<!-- Heart -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
												fill="currentColor"
											/>
										</svg>
									{:else if cat.category === 'Pureza'}
										<!-- Fleur-de-lis / Star -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<circle cx="12" cy="12" r="3" fill="currentColor" />
											<path
												d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
												stroke-linecap="round"
											/>
										</svg>
									{:else if cat.category === 'Justiça'}
										<!-- Scales -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M16 16v1a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1M12 3v16"
												stroke-linecap="round"
											/>
											<path d="M3 7h18M7 7a3 3 0 0 0 6 0M11 7a3 3 0 0 0 6 0" />
										</svg>
									{:else}
										<!-- Celtic / cross decoration -->
										<svg
											class="w-4 h-4 text-[#b89847] shrink-0"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M12 2v20M2 12h20M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0"
												stroke-linecap="round"
											/>
										</svg>
									{/if}
									<h3 class="print-category-title">{cat.category}</h3>
								</div>

								<ul class="space-y-0.5">
									{#each checkedInCat as question (question.text)}
										<li class="print-item">
											<span class="print-checkbox">✓</span>
											<span
												class="font-bold text-[#b89847] mr-1.5 uppercase text-[9px] tracking-wider select-none font-sans"
											>
												{question.response ? 'Sim' : 'Não'} —
											</span>
											<span>{question.text}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					{/each}
				</div>
			{/if}

			<!-- Scripture Footer -->
			<div class="print-footer text-center mt-12">
				<p class="text-xs italic text-[#231f1a]">
					"Criai em mim um coração que seja puro, ó meu Deus."
				</p>
				<p class="text-[10px] text-[#b89847] mt-0.5 font-serif">— Salmo 50(51),12</p>
			</div>
		</div>
	</div>
</div>

<style>
	/* Styles for print */
	@media print {
		:global(header),
		:global(footer),
		:global(div[class*='bg_texture.gif']),
		.screen-only {
			display: none !important;
		}

		:global(body) {
			background-color: #fcfaf7 !important;
			color: #231f1a !important;
			overflow: visible !important;
			height: auto !important;
		}

		:global(main) {
			overflow: visible !important;
			height: auto !important;
			position: static !important;
			padding: 0 !important;
			margin: 0 !important;
		}

		:global(.flex-col.h-screen.w-screen) {
			height: auto !important;
			overflow: visible !important;
			position: static !important;
		}

		:global(div[class*='bg-bg-dark']) {
			background-color: #fcfaf7 !important;
		}

		/* Reset absolute layouts */
		:global(div[class*='h-[calc(100vh-4rem)]']) {
			height: auto !important;
			overflow: visible !important;
			padding: 0 !important;
			margin: 0 !important;
			max-width: 100% !important;
		}

		.print-document {
			display: block !important;
			background-color: #fcfaf7 !important;
			color: #231f1a !important;
			font-family: 'Cinzel', 'Georgia', serif;
			width: 100%;
			margin: 0;
			padding: 1.5cm;
			box-sizing: border-box;
			min-height: 100vh;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		.border-frame {
			border: 2px solid #b89847;
			padding: 2rem;
			min-height: calc(100vh - 3cm);
			position: relative;
			box-sizing: border-box;
		}

		.border-inner {
			border: 1px solid #e2d1a6;
			padding: 2rem;
			min-height: calc(100vh - 4.2cm);
			box-sizing: border-box;
			position: relative;
		}

		.print-checkbox {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 14px;
			height: 14px;
			border: 1px solid #b89847;
			background-color: #9b763e !important;
			color: #fcfaf7 !important;
			font-size: 10px;
			font-weight: bold;
			border-radius: 2px;
			margin-right: 12px;
			margin-top: 3px;
			flex-shrink: 0;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		.print-item {
			display: flex;
			align-items: flex-start;
			padding: 7px 0;
			font-size: 12px;
			font-style: italic;
			border-bottom: 1px dashed #e2d1a6;
			line-height: 1.4;
			color: #2d261d !important;
		}

		.print-category {
			page-break-inside: avoid;
			break-inside: avoid;
		}

		.print-category-header {
			display: flex;
			align-items: center;
			gap: 10px;
			border-bottom: 1.5px solid #b89847;
			padding-bottom: 4px;
			margin-bottom: 12px;
			margin-top: 24px;
		}

		.print-category-title {
			font-size: 13px;
			font-weight: bold;
			text-transform: uppercase;
			letter-spacing: 1px;
			color: #b89847 !important;
			font-family: 'Cinzel', 'Georgia', serif;
		}
	}
</style>
