<script lang="ts">
	import { goto } from '$app/navigation';
	import SEO from '$lib/components/SEO.svelte';
	import {
		Book,
		BookOpen,
		ChevronLeft,
		ChevronRight,
		Search,
		X,
		Compass,
		ArrowLeft,
		Sparkles,
		Copy,
		Check
	} from '@lucide/svelte';

	interface BookInfo {
		name: string;
		abbrev: string;
		chapters_count: number;
		testament: string;
	}

	interface Verse {
		number: number;
		text: string;
	}

	interface Chapter {
		chapter: number;
		verses: Verse[];
	}

	interface SearchResult {
		book: string;
		abbrev: string;
		chapter: number;
		verse: number;
		text: string;
	}

	// Svelte 5 Props
	let { data } = $props<{
		data: {
			success: boolean;
			books?: BookInfo[];
			currentBook?: string;
			currentChapterNum?: number;
			currentChapter?: Chapter;
			selectedBookInfo?: BookInfo;
			searchParam?: string;
			searchResults?: SearchResult[];
			error?: string;
		};
	}>();

	// Accessibility: Font size adjust for reading
	let readerFontSize = $state('text-sm md:text-base');

	// Local search input state
	let searchInput = $state('');

	// Mobile book selector drawer state
	let mobileSelectorOpen = $state(false);

	// Sidebar active testament tab ('antigo' | 'novo')
	let activeTestamentTab = $state<'antigo' | 'novo'>('novo');

	// Custom chapter select dropdown state
	let chapterDropdownOpen = $state(false);

	// Copy to clipboard indicator state
	let copiedIndicator = $state(false);

	// Synchronize local search input and active tab with data updates
	$effect(() => {
		searchInput = data.searchParam || '';
		if (data.selectedBookInfo) {
			activeTestamentTab = data.selectedBookInfo.testament === 'Antigo' ? 'antigo' : 'novo';
		}
	});

	// Group books by testament
	const booksByTestament = $derived.by(() => {
		const list = data.books || [];
		return {
			antigo: list.filter((b: BookInfo) => b.testament === 'Antigo'),
			novo: list.filter((b: BookInfo) => b.testament === 'Novo')
		};
	});

	// Book and Chapter navigation
	function changeBook(bookAbbrev: string) {
		mobileSelectorOpen = false;
		chapterDropdownOpen = false;
		goto(`/biblia?livro=${bookAbbrev}&capitulo=1`);
	}

	function changeChapter(chapterNum: number) {
		chapterDropdownOpen = false;
		goto(`/biblia?livro=${data.currentBook}&capitulo=${chapterNum}`);
	}

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		if (searchInput.trim().length >= 3) {
			goto(`/biblia?busca=${encodeURIComponent(searchInput.trim())}`);
		}
	}

	function clearSearch() {
		searchInput = '';
		goto(`/biblia?livro=${data.currentBook || 'mt'}&capitulo=${data.currentChapterNum || 1}`);
	}

	// Copy the whole chapter text
	function copyChapterText() {
		if (!data.currentChapter || !data.selectedBookInfo) return;
		const title = `${data.selectedBookInfo.name} - Capítulo ${data.currentChapter.chapter}\n\n`;
		const versesText = data.currentChapter.verses
			.map((v: Verse) => `[${v.number}] ${v.text}`)
			.join('\n');

		navigator.clipboard.writeText(title + versesText).then(() => {
			copiedIndicator = true;
			setTimeout(() => {
				copiedIndicator = false;
			}, 2500);
		});
	}

	// SEO metadata
	let seoTitle = $derived.by(() => {
		if (data.searchParam) {
			return `Resultados para "${data.searchParam}" - Bíblia Sagrada`;
		}
		if (data.selectedBookInfo && data.currentChapterNum) {
			return `${data.selectedBookInfo.name}, Capítulo ${data.currentChapterNum} - Bíblia Sagrada (Matos Soares)`;
		}
		return 'Bíblia Sagrada Católica (Tradução Pe. Matos Soares)';
	});

	let seoDescription = $derived.by(() => {
		if (data.searchParam) {
			return `Ocorrências do termo "${data.searchParam}" na Bíblia Sagrada Católica (Edição de 1956 pelo Padre Manuel de Matos Soares).`;
		}
		if (data.selectedBookInfo && data.currentChapterNum) {
			return `Leia o capítulo ${data.currentChapterNum} de ${data.selectedBookInfo.name} online na tradução clássica e de domínio público do Padre Manuel de Matos Soares (1956).`;
		}
		return 'Consulte a Bíblia Sagrada Católica na tradução tradicional e de domínio público do Padre Manuel de Matos Soares. Todos os 73 livros online e offline-friendly.';
	});
</script>

<SEO
	title={seoTitle}
	description={seoDescription}
	keywords={[
		'bíblia sagrada',
		'bíblia católica',
		'padre manuel de matos soares',
		'versículos bíblicos',
		'deuterocanônicos',
		'leitura bíblica',
		'ordinarium'
	]}
/>

{#if !data.success}
	<!-- Error State -->
	<div class="w-full h-[calc(100dvh-4rem)] flex items-center justify-center p-6">
		<div
			class="flex flex-col items-center justify-center text-center p-8 max-w-md bg-bg-card border border-border-dark shadow-2xl rounded-2xl animate-fade-in"
		>
			<div
				class="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/25 mb-4"
			>
				<Compass class="h-6 w-6 text-red-400" />
			</div>
			<h3 class="text-lg font-bold text-text-main">Falha ao conectar com a Bíblia</h3>
			<p class="text-xs text-text-muted mt-2 leading-relaxed">
				{data.error ||
					'Ocorreu um erro ao carregar os dados bíblicos. Certifique-se de que o backend está ativo.'}
			</p>
			<div class="flex gap-3 mt-6">
				<a
					href="/biblia"
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
	</div>
{:else}
	<!-- Main Layout Container -->
	<div
		class="w-full h-[calc(100dvh-4rem)] overflow-hidden flex flex-col min-h-0 lg:flex-row max-w-7xl mx-auto font-sans text-text-main bg-transparent transition-colors duration-200"
	>
		<!-- Desktop Left Sidebar (Glassmorphism layout) -->
		<aside
			class="hidden lg:flex flex-col w-80 shrink-0 border-r border-border-dark/40 bg-bg-sidebar/20 p-5 gap-5 h-full overflow-hidden select-none"
		>
			<!-- Tab buttons for Antigo/Novo Testamento -->
			<div class="flex p-1 border border-border-dark bg-bg-dark/50 rounded-xl relative">
				<button
					onclick={() => (activeTestamentTab = 'antigo')}
					class="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer z-10
					{activeTestamentTab === 'antigo'
						? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25 font-extrabold'
						: 'text-text-muted hover:text-text-main'}"
				>
					Antigo Testamento
				</button>
				<button
					onclick={() => (activeTestamentTab = 'novo')}
					class="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer z-10
					{activeTestamentTab === 'novo'
						? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25 font-extrabold'
						: 'text-text-muted hover:text-text-main'}"
				>
					Novo Testamento
				</button>
			</div>

			<!-- Scrollable list of books based on active tab -->
			<div class="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
				{#each activeTestamentTab === 'antigo' ? booksByTestament.antigo : booksByTestament.novo as book (book.abbrev)}
					<button
						onclick={() => changeBook(book.abbrev)}
						class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-start justify-between gap-3 cursor-pointer group
						{data.currentBook === book.abbrev && !data.searchParam
							? 'bg-brand-wine/10 border-brand-gold/30 text-brand-gold font-extrabold shadow-sm'
							: 'bg-transparent border-transparent text-text-muted hover:text-text-main hover:bg-bg-card/30'}"
					>
						<div class="flex items-start gap-2.5 min-w-0 flex-1">
							<Book
								size={12}
								class="transition-transform group-hover:scale-110 shrink-0 mt-0.5 {data.currentBook ===
									book.abbrev && !data.searchParam
									? 'text-brand-gold'
									: 'text-text-muted/40'}"
							/>
							<span
								class="break-words whitespace-normal text-text-main/90 group-hover:text-text-main leading-snug"
								>{book.name}</span
							>
						</div>
						<span
							class="text-[9px] font-mono px-2 py-0.5 rounded bg-bg-dark/40 border border-border-dark group-hover:border-border-dark/80 transition-colors shrink-0 mt-0.5"
							>{book.chapters_count} cap.</span
						>
					</button>
				{/each}
			</div>
		</aside>

		<!-- Right Side / Main Area -->
		<div
			class="flex-1 flex flex-col min-w-0 min-h-0 h-full relative overflow-hidden bg-transparent"
		>
			<!-- Sticky Top Bar (Glow controls, premium layout) -->
			<header
				class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 lg:p-5 select-none border-b border-border-dark/40 shrink-0 bg-bg-card/20 backdrop-blur-md relative z-30"
			>
				<div class="flex flex-wrap items-center gap-3">
					{#if data.searchParam}
						<!-- Search Back Button -->
						<button
							onclick={clearSearch}
							class="flex items-center gap-2 text-xs font-bold text-brand-gold hover:text-brand-gold/80 transition-colors cursor-pointer bg-brand-gold-dim border border-brand-gold/25 px-3 py-1.5 rounded-xl"
						>
							<ArrowLeft size={13} />
							<span>Voltar para a leitura</span>
						</button>
					{:else}
						<!-- Mobile Book Selection Trigger -->
						<button
							onclick={() => (mobileSelectorOpen = true)}
							class="lg:hidden px-3.5 py-1.5 rounded-xl border border-border-dark bg-bg-dark text-xs font-bold text-brand-gold flex items-center gap-2 cursor-pointer shadow-md"
						>
							<Book size={12} />
							<span>{data.selectedBookInfo?.name || 'Selecione o Livro'}</span>
						</button>

						<!-- Book Display Name (Desktop) -->
						<div class="hidden lg:flex flex-col">
							<span class="text-[9px] uppercase font-bold tracking-widest text-brand-gold"
								>Livro</span
							>
							<h1 class="text-sm font-bold text-text-main">
								{data.selectedBookInfo?.name}
							</h1>
						</div>

						<!-- Custom Chapter Selector Dropdown Grid -->
						{#if data.selectedBookInfo && data.currentChapterNum}
							<div class="h-8 w-[1px] bg-border-dark/40 hidden sm:block"></div>

							<div class="flex items-center gap-2 relative">
								<!-- Previous Chapter Button -->
								{#if data.currentChapterNum > 1}
									<button
										onclick={() => changeChapter(data.currentChapterNum! - 1)}
										class="flex items-center justify-center h-8 w-8 rounded-full border border-border-dark bg-bg-dark/40 hover:bg-bg-dark text-text-muted hover:text-text-main transition-all cursor-pointer hover:border-brand-gold/30 hover:shadow"
										title="Capítulo anterior"
									>
										<ChevronLeft size={14} />
									</button>
								{/if}

								<!-- Styled Custom Select Dropdown Toggle -->
								<div class="flex flex-col">
									<span
										class="text-[9px] uppercase font-bold tracking-widest text-brand-gold lg:block hidden"
										>Capítulo</span
									>
									<button
										onclick={() => (chapterDropdownOpen = !chapterDropdownOpen)}
										class="text-xs font-bold bg-bg-dark/80 border border-border-dark hover:border-brand-gold/30 rounded-xl px-3.5 py-1.5 lg:py-1 flex items-center gap-2 cursor-pointer transition-colors shadow-sm text-text-main"
									>
										<span>Capítulo {data.currentChapterNum}</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-3 w-3 text-brand-gold transition-transform {chapterDropdownOpen
												? 'rotate-180'
												: ''}"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2.5"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</button>

									<!-- Custom Chapter Grid Overlay Popover -->
									{#if chapterDropdownOpen}
										<div
											class="absolute top-12 left-0 mt-1 bg-bg-sidebar border border-border-dark rounded-2xl p-4 shadow-2xl w-64 max-h-72 overflow-y-auto animate-fade-in z-50"
										>
											<span
												class="text-[9px] uppercase font-bold tracking-wider text-text-muted/60 block mb-3 border-b border-border-dark/60 pb-1.5"
												>Escolher Capítulo</span
											>
											<div class="grid grid-cols-5 gap-2">
												{#each Array(data.selectedBookInfo.chapters_count) as _, i}
													<button
														onclick={() => changeChapter(i + 1)}
														class="h-8 w-8 text-xs font-bold rounded-lg border flex items-center justify-center transition-all cursor-pointer
														{data.currentChapterNum === i + 1
															? 'bg-brand-gold text-bg-dark border-brand-gold font-black shadow-md'
															: 'bg-bg-dark border-border-dark text-text-muted hover:text-text-main hover:bg-bg-card'}"
													>
														{i + 1}
													</button>
												{/each}
											</div>
										</div>
									{/if}
								</div>

								<!-- Next Chapter Button -->
								{#if data.selectedBookInfo && data.currentChapterNum < data.selectedBookInfo.chapters_count}
									<button
										onclick={() => changeChapter(data.currentChapterNum! + 1)}
										class="flex items-center justify-center h-8 w-8 rounded-full border border-border-dark bg-bg-dark/40 hover:bg-bg-dark text-text-muted hover:text-text-main transition-all cursor-pointer hover:border-brand-gold/30 hover:shadow"
										title="Próximo capítulo"
									>
										<ChevronRight size={14} />
									</button>
								{/if}
							</div>
						{/if}
					{/if}
				</div>

				<!-- Accessibility Controls & Mode Toggles -->
				<div
					class="flex items-center justify-between sm:justify-end gap-3 select-none w-full sm:w-auto"
				>
					<!-- Font Size Selectors -->
					<div
						class="flex items-center gap-1 border border-border-dark bg-bg-dark p-1 rounded-xl shadow-sm"
					>
						<button
							onclick={() => (readerFontSize = 'text-xs md:text-sm')}
							class="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer
							{readerFontSize === 'text-xs md:text-sm'
								? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25'
								: 'text-text-muted hover:text-text-main'}"
							title="Letra pequena"
						>
							A-
						</button>
						<button
							onclick={() => (readerFontSize = 'text-sm md:text-base')}
							class="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer
							{readerFontSize === 'text-sm md:text-base'
								? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25'
								: 'text-text-muted hover:text-text-main'}"
							title="Letra padrão"
						>
							A
						</button>
						<button
							onclick={() => (readerFontSize = 'text-base md:text-lg')}
							class="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer
							{readerFontSize === 'text-base md:text-lg'
								? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25'
								: 'text-text-muted hover:text-text-main'}"
							title="Letra grande"
						>
							A+
						</button>
					</div>
				</div>
			</header>

			<!-- Close popovers on scroll/click in this main pane -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onclick={() => (chapterDropdownOpen = false)}
				class="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 pb-28 relative z-10"
			>
				{#if data.searchParam}
					<!-- Search Results Panel -->
					<div class="max-w-3xl mx-auto space-y-5 animate-fade-in">
						<div class="flex items-center justify-between border-b border-border-dark/30 pb-3.5">
							<h2 class="text-sm font-bold text-text-main flex items-center gap-2">
								<Search size={14} class="text-brand-gold" />
								<span>Resultados para:</span>
								<span class="text-brand-gold italic font-serif">"{data.searchParam}"</span>
							</h2>
							<span
								class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-dark border border-border-dark text-text-muted"
							>
								{data.searchResults?.length || 0} ocorrências
							</span>
						</div>

						{#if !data.searchResults || data.searchResults.length === 0}
							<!-- No search results -->
							<div
								class="flex flex-col items-center justify-center text-center p-12 bg-bg-card border border-border-dark/60 rounded-2xl mt-6"
							>
								<Compass class="h-8 w-8 text-text-muted/45 mb-3" />
								<h3 class="text-sm font-bold text-text-main">Nenhum resultado encontrado</h3>
								<p class="text-xs text-text-muted mt-1 max-w-sm">
									Não encontramos ocorrências para "{data.searchParam}" na tradução do Pe. Matos
									Soares. Tente usar termos mais simples.
								</p>
								<button
									onclick={clearSearch}
									class="mt-4 px-4 py-2 rounded-xl bg-brand-wine hover:bg-brand-wine/90 border border-brand-wine/30 text-xs font-bold text-white cursor-pointer"
								>
									Voltar à Leitura
								</button>
							</div>
						{:else}
							<!-- Results List -->
							<div class="space-y-4">
								{#each data.searchResults as res}
									<a
										href="/biblia?livro={res.abbrev}&capitulo={res.chapter}"
										class="block border border-border-dark/60 hover:border-brand-gold/30 bg-bg-card/30 hover:bg-bg-card/80 p-4 rounded-xl transition-all cursor-pointer text-left shadow-sm group hover:scale-[1.005]"
									>
										<div class="flex items-center justify-between mb-2">
											<span
												class="text-[10px] font-extrabold text-brand-gold uppercase tracking-wider flex items-center gap-1.5"
											>
												<Sparkles size={10} class="text-brand-gold/60" />
												{res.book}
												{res.chapter}:{res.verse}
											</span>
											<span
												class="text-[9px] px-2 py-0.5 border border-border-dark bg-bg-dark text-text-muted group-hover:text-brand-gold group-hover:border-brand-gold/35 rounded transition-all font-mono uppercase tracking-tight"
											>
												Visualizar
											</span>
										</div>
										<p
											class="text-xs md:text-sm font-serif leading-relaxed text-text-main/90 italic"
										>
											"{res.text}"
										</p>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{:else if data.currentChapter}
					<!-- Chapter Text Reader -->
					<article class="max-w-2xl mx-auto space-y-8 animate-fade-in relative">
						<!-- Scripture Header Layout (Gothic aesthetic) -->
						<div
							class="text-center select-none space-y-3.5 border-b border-border-dark/30 pb-6 relative"
						>
							<h2
								class="text-4xl font-normal font-gothic text-brand-gold select-all drop-shadow-[0_2px_4px_rgba(201,168,76,0.15)] leading-tight"
							>
								{data.selectedBookInfo?.name}
							</h2>

							<!-- Gold Accent Ornaments -->
							<div class="flex items-center justify-center gap-3">
								<div class="h-[1px] w-14 bg-gradient-to-r from-transparent to-brand-gold/40"></div>
								<Sparkles class="text-brand-gold/45 h-3 w-3 animate-pulse-slow" />
								<div class="h-[1px] w-14 bg-gradient-to-l from-transparent to-brand-gold/40"></div>
							</div>

							<div class="flex items-center justify-center gap-4">
								<span class="text-xs font-bold tracking-widest text-text-muted font-sans uppercase">
									Capítulo {data.currentChapter.chapter}
								</span>

								<!-- Action buttons for current chapter -->
								<button
									onclick={copyChapterText}
									class="px-2.5 py-1 rounded bg-bg-dark/60 hover:bg-bg-dark border border-border-dark hover:border-brand-gold/30 text-[9px] font-bold text-text-muted hover:text-brand-gold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
									title="Copiar texto do capítulo"
								>
									{#if copiedIndicator}
										<Check size={9} class="text-emerald-400" />
										<span class="text-emerald-400">Copiado!</span>
									{:else}
										<Copy size={9} />
										<span>Copiar Cap.</span>
									{/if}
								</button>
							</div>
						</div>

						<!-- Text Verses (Estilo Versículo por Versículo Limpo) -->
						<div
							class="{readerFontSize} font-serif leading-relaxed text-justify space-y-1 text-text-main/95 select-all pr-1"
						>
							{#each data.currentChapter.verses as verse}
								<div
									class="flex items-start gap-3.5 py-0.5 px-2 rounded-xl border border-transparent hover:bg-bg-card/15 hover:border-border-dark/30 transition-all select-all group"
								>
									<span
										class="font-mono text-xs font-bold text-brand-gold select-none shrink-0 w-6 pt-0.5 text-right opacity-80"
										title="Versículo {verse.number}"
									>
										{verse.number}
									</span>
									<p class="text-text-main/90 leading-relaxed select-all flex-1">{verse.text}</p>
								</div>
							{/each}
						</div>

						<div
							class="h-[1px] bg-gradient-to-r from-transparent via-border-dark/30 to-transparent pt-6"
						></div>

						<!-- Footer navigation inside the reader -->
						<div class="flex items-center justify-between select-none pt-4 pb-12">
							{#if data.currentChapterNum && data.currentChapterNum > 1}
								<button
									onclick={() => changeChapter(data.currentChapterNum! - 1)}
									class="px-4 py-2 border border-border-dark bg-bg-card/30 hover:bg-bg-card rounded-xl text-xs font-bold text-text-muted hover:text-text-main transition-all cursor-pointer flex items-center gap-1.5 hover:border-brand-gold/20 shadow-sm"
								>
									<ChevronLeft size={13} />
									<span>Capítulo {data.currentChapterNum - 1}</span>
								</button>
							{:else}
								<div></div>
							{/if}

							{#if data.currentChapterNum && data.selectedBookInfo && data.currentChapterNum < data.selectedBookInfo.chapters_count}
								<button
									onclick={() => changeChapter(data.currentChapterNum! + 1)}
									class="px-4 py-2 border border-border-dark bg-bg-card/30 hover:bg-bg-card rounded-xl text-xs font-bold text-text-muted hover:text-text-main transition-all cursor-pointer flex items-center gap-1.5 ml-auto hover:border-brand-gold/20 shadow-sm"
								>
									<span>Capítulo {data.currentChapterNum + 1}</span>
									<ChevronRight size={13} />
								</button>
							{/if}
						</div>
					</article>
				{:else}
					<!-- Chapter loading / not found -->
					<div
						class="flex-1 flex flex-col items-center justify-center text-center p-12 max-w-sm mx-auto my-12 bg-bg-card border border-border-dark shadow-2xl rounded-2xl shrink-0"
					>
						<div
							class="h-12 w-12 rounded-full bg-brand-gold-dim flex items-center justify-center border border-brand-gold/20 mb-4"
						>
							<BookOpen class="h-6 w-6 text-brand-gold" />
						</div>
						<h3 class="text-lg font-bold text-text-main">Capítulo não carregado</h3>
						<p class="text-xs text-text-muted mt-2 leading-relaxed">
							Não foi possível carregar as informações deste capítulo ou o livro selecionado não
							existe na base de dados.
						</p>
						<a
							href="/biblia"
							class="mt-6 px-4 py-2 rounded-xl bg-brand-wine hover:bg-brand-wine/90 border border-brand-wine/30 text-xs font-bold text-white cursor-pointer"
						>
							Voltar ao Início
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Mobile drawer overlay for book selection & search (Glow overlay style) -->
	{#if mobileSelectorOpen}
		<div class="fixed inset-0 z-[1100] lg:hidden flex">
			<!-- Backdrop -->
			<button
				onclick={() => (mobileSelectorOpen = false)}
				class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
				aria-label="Fechar painel"
			></button>

			<!-- Selector panel sheet -->
			<aside
				class="relative flex flex-col w-80 bg-bg-sidebar border-r border-border-dark h-full p-5 justify-start gap-4 z-10 animate-fade-in shadow-2xl"
			>
				<!-- Header -->
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Book size={14} class="text-brand-gold" />
						<span class="text-xs font-extrabold uppercase tracking-wider text-brand-gold"
							>Navegação e Busca</span
						>
					</div>
					<button
						onclick={() => (mobileSelectorOpen = false)}
						class="text-text-muted hover:text-text-main cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				<!-- Divider -->
				<div
					class="h-[1px] bg-gradient-to-r from-transparent via-border-dark/40 to-transparent"
				></div>

				<!-- Tabs for mobile selection -->
				<div class="flex p-1 border border-border-dark bg-bg-dark/50 rounded-xl relative shrink-0">
					<button
						onclick={() => (activeTestamentTab = 'antigo')}
						class="flex-1 text-center py-1.5 text-[9px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer z-10
						{activeTestamentTab === 'antigo'
							? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25 font-extrabold shadow-sm'
							: 'text-text-muted hover:text-text-main'}"
					>
						Antigo
					</button>
					<button
						onclick={() => (activeTestamentTab = 'novo')}
						class="flex-1 text-center py-1.5 text-[9px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer z-10
						{activeTestamentTab === 'novo'
							? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25 font-extrabold shadow-sm'
							: 'text-text-muted hover:text-text-main'}"
					>
						Novo
					</button>
				</div>

				<div
					class="h-[1px] bg-gradient-to-r from-transparent via-border-dark/40 to-transparent"
				></div>

				<!-- Books lists (Mobile scroll) -->
				<div class="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
					{#each activeTestamentTab === 'antigo' ? booksByTestament.antigo : booksByTestament.novo as book (book.abbrev)}
						<button
							onclick={() => changeBook(book.abbrev)}
							class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-start justify-between gap-3 cursor-pointer
							{data.currentBook === book.abbrev && !data.searchParam
								? 'bg-brand-wine/10 border-brand-gold/30 text-brand-gold font-extrabold shadow-sm'
								: 'bg-transparent border-transparent text-text-muted hover:text-text-main hover:bg-bg-card/40'}"
						>
							<div class="flex items-start gap-2.5 min-w-0 flex-1">
								<Book
									size={12}
									class="transition-transform group-hover:scale-110 shrink-0 mt-0.5 {data.currentBook ===
										book.abbrev && !data.searchParam
										? 'text-brand-gold'
										: 'text-text-muted/40'}"
								/>
								<span
									class="break-words whitespace-normal text-text-main/90 group-hover:text-text-main leading-snug"
									>{book.name}</span
								>
							</div>
							<span
								class="text-[9px] font-mono px-2 py-0.5 rounded bg-bg-dark/40 border border-border-dark shrink-0 mt-0.5"
								>{book.chapters_count} cap.</span
							>
						</button>
					{/each}
				</div>
			</aside>
		</div>
	{/if}
{/if}
