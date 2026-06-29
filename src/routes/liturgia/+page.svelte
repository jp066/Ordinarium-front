<script lang="ts">
	import { page } from '$app/stores';
	import SEO from '$lib/components/SEO.svelte';
	import { 
		BookOpen, 
		Calendar, 
		ChevronLeft, 
		ChevronRight, 
		MessageSquare, 
		Music, 
		Sparkles,
		Flame,
		Bookmark,
		Compass
	} from '@lucide/svelte';

	interface LeituraOpcao {
		referencia?: string;
		titulo?: string;
		refrao?: string;
		texto: string;
	}

	interface Leitura {
		ordem: number;
		tipo: string;
		rotulo: string;
		opcoes: LeituraOpcao[];
	}

	interface Celebracao {
		id: string;
		liturgia: string;
		cor: string;
		principal: boolean;
		oracoes: {
			coleta: string;
			oferendas: string;
			comunhao: string;
			extras: { titulo: string; texto: string }[];
		};
		antifonas: {
			entrada: string;
			comunhao: string;
		};
		leituras: Leitura[];
	}

	interface LiturgiaResponse {
		data: string; // DD/MM/YYYY
		celebracoes: Celebracao[];
	}

	// Svelte 5 props
	let { data } = $props<{
		data: {
			success: boolean;
			liturgiaData?: LiturgiaResponse;
			error?: string;
		};
	}>();

	// Active celebration index (defaults to principal one)
	let activeCelebrationIndex = $state(0);
	
	// Accessibility: Font size adjust for comfortable reading
	let readerFontSize = $state('text-sm md:text-base'); // Options: sm, base, lg, xl

	// Color mappings for liturgical colors
	const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
		'Verde': { 
			bg: 'bg-emerald-500/10', 
			text: 'text-emerald-400', 
			border: 'border-emerald-500/25', 
			glow: 'shadow-emerald-500/10' 
		},
		'Vermelho': { 
			bg: 'bg-red-500/10', 
			text: 'text-red-400', 
			border: 'border-red-500/25', 
			glow: 'shadow-red-500/10' 
		},
		'Roxo': { 
			bg: 'bg-purple-500/10', 
			text: 'text-purple-400', 
			border: 'border-purple-500/25', 
			glow: 'shadow-purple-500/10' 
		},
		'Rosa': { 
			bg: 'bg-pink-500/10', 
			text: 'text-pink-400', 
			border: 'border-pink-500/25', 
			glow: 'shadow-pink-500/10' 
		},
		'Branco': { 
			bg: 'bg-slate-200/10', 
			text: 'text-slate-100', 
			border: 'border-slate-200/20', 
			glow: 'shadow-slate-200/5' 
		}
	};

	// Reset celebration index when data updates
	$effect(() => {
		if (data.liturgiaData) {
			const principalIdx = data.liturgiaData.celebracoes.findIndex((c: any) => c.principal);
			activeCelebrationIndex = principalIdx !== -1 ? principalIdx : 0;
		}
	});

	let activeSection = $state('leitura-0');
	let contentContainer: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (activeCelebration) {
			activeSection = 'leitura-0';
		}
	});

	// Dynamically build navigation sections based on active celebration data
	const sections = $derived.by(() => {
		if (!activeCelebration) return [];
		const list: { id: string; label: string; icon: any }[] = [];
		
		activeCelebration.leituras.forEach((leitura: Leitura, index: number) => {
			list.push({
				id: `leitura-${index}`,
				label: leitura.rotulo,
				icon: BookOpen
			});
		});

		list.push({
			id: 'oracoes',
			label: 'Orações',
			icon: Sparkles
		});

		list.push({
			id: 'antifonas',
			label: 'Antífonas',
			icon: Bookmark
		});

		return list;
	});

	function scrollToSection(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			activeSection = id;
		}
	}

	function handleScroll(e: Event) {
		const target = e.currentTarget as HTMLDivElement;
		if (!target) return;
		const children = target.children;
		let currentSection = activeSection;
		let minDiff = Infinity;

		for (let i = 0; i < children.length; i++) {
			const child = children[i] as HTMLElement;
			if (!child.id) continue;
			const rect = child.getBoundingClientRect();
			const parentRect = target.getBoundingClientRect();
			
			// Calculate offset from container top
			const diff = Math.abs(rect.top - parentRect.top);
			if (diff < minDiff && rect.top < parentRect.bottom - 100) {
				minDiff = diff;
				currentSection = child.id;
			}
		}
		if (currentSection && currentSection !== activeSection) {
			activeSection = currentSection;
		}
	}

	// Date calculations for navigation (DD/MM/YYYY)
	function getNavDateUrl(dateStr: string, offset: number): string {
		const [d, m, y] = dateStr.split('/').map(Number);
		const date = new Date(y, m - 1, d);
		date.setDate(date.getDate() + offset);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `/liturgia?dia=${day}&mes=${month}&ano=${year}`;
	}

	// Format display date (e.g. "27 de Junho de 2026")
	function formatDisplayDate(dateStr: string): string {
		const [d, m, y] = dateStr.split('/').map(Number);
		const date = new Date(y, m - 1, d);
		return date.toLocaleDateString('pt-BR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	const liturgia = $derived(data.liturgiaData);
	const activeCelebration = $derived(liturgia?.celebracoes[activeCelebrationIndex]);

	const liturgicalColorStyles = $derived(
		activeCelebration ? (colorMap[activeCelebration.cor] || colorMap['Branco']) : colorMap['Branco']
	);

	// Toggles for different details sections
	let activeTab = $state<'leituras' | 'oracoes' | 'antifonas'>('leituras');

	// Dynamic SEO metadata
	let seoTitle = $derived(
		activeCelebration ? `Liturgia Diária - ${activeCelebration.liturgia}` : 'Liturgia Diária'
	);
	
	let seoDescription = $derived(
		activeCelebration 
			? `Liturgia Diária de hoje: ${activeCelebration.liturgia} (${activeCelebration.cor}). Confira a Primeira Leitura, Salmo Responsorial, Evangelho e Orações.`
			: 'Confira a Liturgia Diária de hoje, leituras bíblicas, salmos, evangelho e orações do dia.'
	);

	let liturgiaSchema = $derived(
		activeCelebration && liturgia ? {
			"@context": "https://schema.org",
			"@type": "Article",
			"headline": seoTitle,
			"description": seoDescription,
			"datePublished": liturgia.data.split('/').reverse().join('-'),
			"author": {
				"@type": "Organization",
				"name": "Ordinarium"
			},
			"publisher": {
				"@type": "Organization",
				"name": "Ordinarium"
			}
		} : null
	);
</script>

<SEO 
	title={seoTitle}
	description={seoDescription}
	keywords={['liturgia diária', 'primeira leitura', 'salmo responsorial', 'evangelho de hoje', 'missa de hoje', 'leituras bíblicas', 'oração do dia', 'coleta']}
	schema={liturgiaSchema}
/>

<div class="w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col justify-start items-center py-4 px-4 sm:px-10 gap-4 max-w-5xl mx-auto font-sans relative bg-transparent text-text-main transition-colors duration-200">
	
	{#if !data.success}
		<!-- Error State -->
		<div class="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md my-12 bg-bg-card border border-border-dark shadow-2xl rounded-2xl shrink-0">
			<div class="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/25 mb-4">
				<Compass class="h-6 w-6 text-red-400" />
			</div>
			<h3 class="text-lg font-bold text-text-main">Falha ao carregar liturgia</h3>
			<p class="text-xs text-text-muted mt-2 leading-relaxed">
				{data.error || 'Ocorreu um erro ao buscar a Liturgia Diária deste dia. Verifique sua conexão ou tente novamente mais tarde.'}
			</p>
			<div class="flex gap-3 mt-6">
				<a 
					href="/liturgia" 
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
	{:else if !liturgia}
		<!-- Empty State -->
		<div class="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md my-12 bg-bg-card border border-border-dark shadow-2xl rounded-2xl shrink-0">
			<div class="h-12 w-12 rounded-full bg-brand-gold-dim flex items-center justify-center border border-brand-gold/20 mb-4">
				<Calendar class="h-6 w-6 text-brand-gold" />
			</div>
			<h3 class="text-lg font-bold text-text-main">Nenhuma liturgia encontrada</h3>
			<p class="text-xs text-text-muted mt-2 leading-relaxed">
				Não há dados litúrgicos cadastrados para este dia na API de Liturgia Diária.
			</p>
			<a 
				href="/liturgia" 
				class="mt-6 px-4 py-2 rounded-xl bg-brand-wine hover:bg-brand-wine/90 border border-brand-wine/30 text-xs font-bold text-white transition-all cursor-pointer"
			>
				Voltar a Hoje
			</a>
		</div>
	{:else}
		<!-- Content State -->
		
		<!-- Concept-style Header bar -->
		<div class="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 select-none border-b border-border-dark/40 shrink-0">
			<!-- Date & Celebration Info -->
			<div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
				<div class="flex items-center gap-3">
					<!-- Date Navigation Arrows -->
					<a 
						href={getNavDateUrl(liturgia.data, -1)}
						class="flex items-center justify-center h-8 w-8 rounded-full border border-border-dark bg-bg-dark/40 hover:bg-bg-dark hover:border-brand-gold/30 text-text-muted hover:text-text-main transition-all cursor-pointer"
						title="Dia anterior"
					>
						<ChevronLeft size={15} />
					</a>
					<div class="flex flex-col">
						<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold">Dia Litúrgico</span>
						<h2 class="text-xs sm:text-sm font-bold text-text-main">
							{formatDisplayDate(liturgia.data)}
						</h2>
					</div>
					<a 
						href={getNavDateUrl(liturgia.data, 1)}
						class="flex items-center justify-center h-8 w-8 rounded-full border border-border-dark bg-bg-dark/40 hover:bg-bg-dark hover:border-brand-gold/30 text-text-muted hover:text-text-main transition-all cursor-pointer"
						title="Próximo dia"
					>
						<ChevronRight size={15} />
					</a>
				</div>

				{#if activeCelebration}
					<div class="h-8 w-[1px] bg-border-dark/40 hidden sm:block"></div>

					<div class="flex flex-col">
						<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold">Tempo Litúrgico</span>
						<h3 class="text-xs sm:text-sm font-bold text-text-main line-clamp-1">
							{activeCelebration.liturgia.split('.')[0]}
						</h3>
					</div>
				{/if}
			</div>

			<!-- Accessibility Controls in Header -->
			{#if activeCelebration}
				<div class="flex items-center gap-1.5 rounded-xl p-1 border border-border-dark bg-bg-dark self-start md:self-center select-none shadow-sm">
					<button 
						onclick={() => readerFontSize = 'text-xs md:text-sm'}
						class="text-[10px] px-2 py-1 rounded-lg font-bold transition-all cursor-pointer 
						{readerFontSize === 'text-xs md:text-sm' 
							? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25' 
							: 'text-text-muted hover:text-text-main'}"
						title="Letra pequena"
					>
						A-
					</button>
					<button 
						onclick={() => readerFontSize = 'text-sm md:text-base'}
						class="text-[10px] px-2 py-1 rounded-lg font-bold transition-all cursor-pointer 
						{readerFontSize === 'text-sm md:text-base' 
							? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25' 
							: 'text-text-muted hover:text-text-main'}"
						title="Letra padrão"
					>
						A
					</button>
					<button 
						onclick={() => readerFontSize = 'text-base md:text-lg'}
						class="text-[10px] px-2 py-1 rounded-lg font-bold transition-all cursor-pointer 
						{readerFontSize === 'text-base md:text-lg' 
							? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25' 
							: 'text-text-muted hover:text-text-main'}"
						title="Letra grande"
					>
						A+
					</button>
				</div>
			{/if}
		</div>

		<!-- Multiple Celebrations Selector (if more than 1) -->
		{#if liturgia.celebracoes.length > 1}
			<div class="w-full flex flex-col gap-2 bg-bg-card/30 border border-border-dark p-3 rounded-2xl select-none shrink-0">
				<span class="text-[9px] uppercase font-bold tracking-wider text-text-muted/50 px-1">Celebrações do Dia</span>
				<div class="flex flex-wrap gap-2">
					{#each liturgia.celebracoes as cel, idx}
						{@const celStyles = colorMap[cel.cor] || colorMap['Branco']}
						<button
							onclick={() => activeCelebrationIndex = idx}
							class="text-[11px] font-semibold py-1.5 px-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2
							{activeCelebrationIndex === idx 
								? `${celStyles.bg} ${celStyles.text} ${celStyles.border} border-opacity-100 font-bold`
								: 'bg-bg-dark border-border-dark text-text-muted hover:text-text-main hover:bg-bg-card'}"
						>
							<span class="h-2 w-2 rounded-full 
								{cel.cor === 'Verde' ? 'bg-emerald-400' : ''}
								{cel.cor === 'Vermelho' ? 'bg-red-400' : ''}
								{cel.cor === 'Roxo' ? 'bg-purple-400' : ''}
								{cel.cor === 'Rosa' ? 'bg-pink-400' : ''}
								{cel.cor === 'Branco' ? 'bg-slate-200 border border-border-dark/60' : ''}
							"></span>
							<span>{cel.liturgia.split('.')[0]}</span>
							{#if cel.principal}
								<span class="text-[9px] px-1 py-0.2 bg-brand-gold/15 text-brand-gold border border-brand-gold/25 rounded-md uppercase font-bold tracking-wide">Principal</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Active Celebration Scrollable Bento Layout -->
		{#if activeCelebration}
			<div class="flex-1 min-h-0 flex flex-col md:flex-row gap-6 w-full relative">
				
				<!-- Desktop Sidebar index (Anchor navigation, scrolls to sections) -->
				<nav class="hidden md:flex flex-col w-52 shrink-0 py-2 space-y-1 select-none sticky top-0 self-start">
					<span class="text-[9px] uppercase font-bold tracking-widest text-text-muted/40 px-3 mb-2">Sumário Litúrgico</span>
					{#each sections as sec}
						<button
							onclick={() => scrollToSection(sec.id)}
							class="w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2.5
							{activeSection === sec.id 
								? 'bg-brand-wine/10 border-brand-wine/25 text-brand-wine font-extrabold' 
								: 'bg-transparent border-transparent text-text-muted hover:text-text-main'}"
						>
							<sec.icon size={13} class={activeSection === sec.id ? 'text-brand-wine' : 'text-text-muted/60'} />
							<span class="line-clamp-1">{sec.label}</span>
						</button>
					{/each}
				</nav>

				<!-- Mobile Horizontal Scroll Tabs -->
				<div class="flex md:hidden overflow-x-auto shrink-0 gap-2 py-1.5 select-none border-b border-border-dark/40 w-full scrollbar-none">
					{#each sections as sec}
						<button
							onclick={() => scrollToSection(sec.id)}
							class="shrink-0 text-[10px] font-bold py-1.5 px-3.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5
							{activeSection === sec.id 
								? 'bg-brand-wine text-white border-transparent font-extrabold' 
								: 'bg-bg-dark border-border-dark text-text-muted hover:text-text-main'}"
						>
							<sec.icon size={11} />
							<span>{sec.label}</span>
						</button>
					{/each}
				</div>

				<!-- Main content scrollable card stack -->
				<div 
					bind:this={contentContainer}
					onscroll={handleScroll}
					class="flex-1 h-full overflow-y-auto pr-1 pb-20 space-y-6 scroll-smooth"
				>
					<!-- Celebration Header Card -->
					<div class="border border-border-dark shadow-md rounded-2xl overflow-hidden flex flex-col p-5 select-none bg-bg-card text-text-main">
						<div class="flex items-center gap-2">
							<span class="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border transition-colors duration-200
								{liturgicalColorStyles.bg} {liturgicalColorStyles.text} {liturgicalColorStyles.border}"
							>
								{activeCelebration.cor}
							</span>
							{#if activeCelebration.principal}
								<span class="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-brand-gold/20 bg-brand-gold-dim text-brand-gold">
									Celebração Recomendada
								</span>
							{/if}
						</div>
						<h1 class="text-base sm:text-lg font-bold tracking-tight leading-snug mt-3 text-text-main font-sans">
							{activeCelebration.liturgia}
						</h1>
					</div>

					<!-- Render each reading as a separate card -->
					{#each activeCelebration.leituras as leitura, idx (leitura.ordem)}
						<div 
							id="leitura-{idx}" 
							class="border border-border-dark bg-bg-card shadow-md rounded-2xl overflow-hidden flex flex-col scroll-mt-4"
						>
							<!-- Left border color matching celebration -->
							<div class="flex flex-col relative border-l-4 transition-colors duration-200
								{activeCelebration.cor === 'Verde' ? 'border-emerald-500' : ''}
								{activeCelebration.cor === 'Vermelho' ? 'border-red-500' : ''}
								{activeCelebration.cor === 'Roxo' ? 'border-purple-500' : ''}
								{activeCelebration.cor === 'Rosa' ? 'border-pink-500' : ''}
								{activeCelebration.cor === 'Branco' ? 'border-slate-300' : ''}
							">
								<!-- Card Header -->
								<div class="p-5 pb-3 border-b border-border-dark/40 bg-bg-card/40 select-none flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div class="h-6 w-6 rounded-md flex items-center justify-center shrink-0 border border-brand-gold/20 bg-brand-gold-dim">
											<BookOpen size={12} class="text-brand-gold" />
										</div>
										<h2 class="text-xs font-bold uppercase tracking-wider text-brand-gold">
											{leitura.rotulo}
										</h2>
									</div>
									
									{#if leitura.opcoes[0]?.referencia}
										<span class="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-tight border bg-brand-wine/10 text-brand-wine border-brand-wine/20">
											{leitura.opcoes[0].referencia}
										</span>
									{/if}
								</div>

								<!-- Card Body -->
								<div class="p-6 space-y-4 flex-1">
									{#each leitura.opcoes as opcao}
										<div class="space-y-4">
											{#if opcao.titulo}
												<div class="rounded-xl p-3.5 select-none text-left border bg-bg-dark/40 border-border-dark/60">
													<h3 class="text-xs sm:text-sm font-bold leading-snug text-text-main font-sans">
														{opcao.titulo}
													</h3>
												</div>
											{/if}

											{#if opcao.refrao}
												<div class="rounded-r-xl p-3.5 select-all flex items-start gap-3 border-y border-r bg-brand-wine/10 border-border-dark/30 border-l-4 border-l-brand-wine/60">
													<Music size={14} class="shrink-0 mt-0.5 text-brand-wine" />
													<p class="text-xs sm:text-sm font-bold italic text-text-main">
														Refrão: {opcao.refrao}
													</p>
												</div>
											{/if}

											<div class="{readerFontSize} font-serif leading-relaxed text-justify select-all whitespace-pre-line pr-1 text-text-main">
												{opcao.texto}
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/each}

					<!-- Orações Card -->
					<div 
						id="oracoes" 
						class="border border-border-dark bg-bg-card shadow-md rounded-2xl overflow-hidden flex flex-col scroll-mt-4"
					>
						<div class="flex flex-col relative border-l-4 transition-colors duration-200
							{activeCelebration.cor === 'Verde' ? 'border-emerald-500' : ''}
							{activeCelebration.cor === 'Vermelho' ? 'border-red-500' : ''}
							{activeCelebration.cor === 'Roxo' ? 'border-purple-500' : ''}
							{activeCelebration.cor === 'Rosa' ? 'border-pink-500' : ''}
							{activeCelebration.cor === 'Branco' ? 'border-slate-300' : ''}
						">
							<!-- Card Header -->
							<div class="p-5 pb-3 border-b border-border-dark/40 bg-bg-card/40 select-none flex items-center gap-2">
								<div class="h-6 w-6 rounded-md flex items-center justify-center shrink-0 border border-brand-wine/25 bg-brand-wine-dim">
									<Sparkles size={12} class="text-brand-wine" />
								</div>
								<h2 class="text-xs font-bold uppercase tracking-wider text-brand-gold">
									Orações da Missa
								</h2>
							</div>

							<!-- Card Body -->
							<div class="p-6 space-y-6">
								<!-- Coleta -->
								<div class="space-y-2">
									<h3 class="text-xs font-bold uppercase tracking-wider select-none text-brand-wine">
										Coleta (Oração do Dia)
									</h3>
									<p class="{readerFontSize} font-sans leading-relaxed text-justify text-text-main">
										{activeCelebration.oracoes.coleta}
									</p>
								</div>

								<!-- Oferendas -->
								<div class="space-y-2">
									<h3 class="text-xs font-bold uppercase tracking-wider select-none text-brand-wine">
										Sobre as Oferendas
									</h3>
									<p class="{readerFontSize} font-sans leading-relaxed text-justify text-text-main">
										{activeCelebration.oracoes.oferendas}
									</p>
								</div>

								<!-- Comunhão -->
								<div class="space-y-2">
									<h3 class="text-xs font-bold uppercase tracking-wider select-none text-brand-wine">
										Depois da Comunhão
									</h3>
									<p class="{readerFontSize} font-sans leading-relaxed text-justify text-text-main">
										{activeCelebration.oracoes.comunhao}
									</p>
								</div>

								<!-- Extras -->
								{#if activeCelebration.oracoes.extras && activeCelebration.oracoes.extras.length > 0}
									{#each activeCelebration.oracoes.extras as extra}
										<div class="space-y-2 border-t border-border-dark/40 pt-4">
											<h3 class="text-xs font-bold uppercase tracking-wider select-none text-brand-wine">
												{extra.titulo}
											</h3>
											<p class="{readerFontSize} font-sans leading-relaxed text-justify whitespace-pre-line text-text-main">
												{extra.texto}
											</p>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					</div>

					<!-- Antífonas Card -->
					<div 
						id="antifonas" 
						class="border border-border-dark bg-bg-card shadow-md rounded-2xl overflow-hidden flex flex-col scroll-mt-4"
					>
						<div class="flex flex-col relative border-l-4 transition-colors duration-200
							{activeCelebration.cor === 'Verde' ? 'border-emerald-500' : ''}
							{activeCelebration.cor === 'Vermelho' ? 'border-red-500' : ''}
							{activeCelebration.cor === 'Roxo' ? 'border-purple-500' : ''}
							{activeCelebration.cor === 'Rosa' ? 'border-pink-500' : ''}
							{activeCelebration.cor === 'Branco' ? 'border-slate-300' : ''}
						">
							<!-- Card Header -->
							<div class="p-5 pb-3 border-b border-border-dark/40 bg-bg-card/40 select-none flex items-center gap-2">
								<div class="h-6 w-6 rounded-md flex items-center justify-center shrink-0 border border-brand-gold/20 bg-brand-gold-dim">
									<Bookmark size={12} class="text-brand-gold" />
								</div>
								<h2 class="text-xs font-bold uppercase tracking-wider text-brand-gold">
									Antífonas
								</h2>
							</div>

							<!-- Card Body -->
							<div class="p-6 space-y-6">
								<!-- Entrada -->
								<div class="space-y-2">
									<h3 class="text-xs font-bold uppercase tracking-wider select-none text-brand-gold">
										Antífona de Entrada
									</h3>
									<p class="{readerFontSize} font-sans leading-relaxed text-justify text-text-main">
										{activeCelebration.antifonas.entrada}
									</p>
								</div>

								<!-- Comunhão -->
								<div class="space-y-2">
									<h3 class="text-xs font-bold uppercase tracking-wider select-none text-brand-gold">
										Antífona da Comunhão
									</h3>
									<p class="{readerFontSize} font-sans leading-relaxed text-justify text-text-main">
										{activeCelebration.antifonas.comunhao}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
