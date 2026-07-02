<script lang="ts">
	import { Code, ExternalLink, Copy, Check, BookOpen, Zap, Shield, Hash } from '@lucide/svelte';
	import { browser } from '$app/environment';
	import SEO from '$lib/components/SEO.svelte';

	let copiedEndpoint = $state<string | null>(null);
	let activeSection = $state('intro');

	const navSections = [
		{ id: 'intro', label: 'Introdução', icon: BookOpen },
		{ id: 'auth', label: 'Autenticação', icon: Shield },
		{ id: 'churches', label: 'GET /api/churches', icon: Hash, tag: 'GET' },
		{ id: 'schedules', label: 'GET /api/schedules', icon: Hash, tag: 'GET' }
	];

	const codeExamples = {
		churches: `[
  {
    "id": "c1",
    "name": "Paróquia de São José",
    "address": "Rua São José, 18 - Centro, São Paulo - SP",
    "phone": "(11) 93333-0980",
    "email": "info@ordinarium.com",
    "lat": -23.5489,
    "lng": -46.6388,
    "bgImage": "https://url-imagem.jpg",
    "schedules": [
      { "type": "Missa", "day": "Dom", "time": "14:30" }
    ]
  }
]`,
		schedules: `[
  {
    "id": "s1",
    "type": "Missa",
    "weekday": "Dom",
    "dateStr": "Dom, 24 Set",
    "timeStr": "14:30",
    "churchName": "Paróquia de São José",
    "churchId": "c1",
    "notes": "Sana omin da paróquia",
    "confidenceScore": 0.95
  }
]`
	};

	function handleCopy(text: string, id: string) {
		navigator.clipboard.writeText(text);
		copiedEndpoint = id;
		setTimeout(() => {
			copiedEndpoint = null;
		}, 2000);
	}

	function handleCopyUrl(path: string, id: string) {
		if (browser) {
			const fullUrl = window.location.origin + path;
			navigator.clipboard.writeText(fullUrl);
			copiedEndpoint = id;
			setTimeout(() => {
				copiedEndpoint = null;
			}, 2000);
		}
	}

	function scrollTo(id: string) {
		activeSection = id;
		if (browser) {
			const el = document.getElementById(id);
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<SEO
	title="Documentação da API Pública"
	description="Explore a documentação técnica da API do Ordinarium. Integre dados de igrejas católicas, horários de missas, confissões, adorações e localizações geográficas em tempo real."
	keywords={[
		'api católica',
		'desenvolvedores',
		'ordinarium api',
		'dados abertos católicos',
		'desenvolvedor católico',
		'rest api',
		'json api'
	]}
/>

<div class="h-dvh w-screen bg-transparent text-text-main font-sans flex flex-col overflow-hidden">
	<!-- Top Bar (fixed header for the doc page) -->
	<div
		class="h-14 shrink-0 border-b border-border-dark bg-bg-sidebar/90 backdrop-blur-md flex items-center justify-between px-6 z-10"
	>
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-main transition-colors cursor-pointer"
			>
				<span>←</span>
				<span class="hidden sm:inline">Ordinarium</span>
			</a>
			<span class="text-border-dark/80 select-none">›</span>
			<div class="flex items-center gap-2">
				<div class="h-5 w-5 rounded bg-brand-gold-dim flex items-center justify-center">
					<Code class="h-3 w-3 text-brand-gold" />
				</div>
				<span class="text-xs font-bold text-text-main tracking-wide">API Reference</span>
				<span
					class="text-[10px] px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 font-bold uppercase tracking-wider"
					>v1</span
				>
			</div>
		</div>
		<div class="flex items-center gap-1.5 text-[11px] text-text-muted/60 font-sans select-none">
			<Zap size={11} class="text-brand-gold/60" />
			<span>REST · JSON · Público · Gratuito</span>
		</div>
	</div>

	<!-- Body: Sidebar + Main -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Sidebar (fixed, hidden on mobile below md) -->
		<aside
			class="hidden md:flex flex-col w-56 shrink-0 border-r border-border-dark bg-bg-sidebar/60 overflow-y-auto py-6 px-3 gap-1 select-none"
		>
			<!-- Sidebar header -->
			<p class="text-[10px] font-bold uppercase tracking-widest text-text-muted/50 px-3 mb-2">
				Navegação
			</p>

			{#each navSections as section}
				<button
					onclick={() => scrollTo(section.id)}
					class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left w-full cursor-pointer
					{activeSection === section.id
						? 'bg-brand-wine/20 text-text-main border border-brand-wine/25 font-bold'
						: 'text-text-muted hover:text-text-main hover:bg-bg-card/60 border border-transparent'}"
				>
					<section.icon
						size={13}
						class={activeSection === section.id ? 'text-brand-gold' : 'text-text-muted/50'}
					/>
					<span class="leading-tight">{section.label}</span>
					{#if section.tag}
						<span
							class="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20 shrink-0"
							>{section.tag}</span
						>
					{/if}
				</button>
			{/each}

			<!-- Sidebar footer -->
			<div class="mt-auto pt-6 px-3 flex flex-col gap-2">
				<div class="h-[1px] w-full bg-border-dark/40 mb-2"></div>
				<p class="text-[10px] text-text-muted/40 leading-relaxed">
					feito com ♱ por<br />
					<span class="text-text-muted/60">João Pedro</span>
				</p>
			</div>
		</aside>

		<!-- Main Content (scrollable) -->
		<main class="flex-1 overflow-y-auto px-6 sm:px-10 py-10 flex flex-col gap-12">
			<!-- Intro Section -->
			<section id="intro" class="flex flex-col gap-5">
				<div class="flex items-center gap-3">
					<div
						class="h-9 w-9 rounded-xl bg-brand-gold-dim flex items-center justify-center border border-brand-gold/20 shrink-0"
					>
						<BookOpen class="h-4 w-4 text-brand-gold" />
					</div>
					<div>
						<h1 class="text-xl font-bold text-text-main tracking-tight">Introdução</h1>
						<p class="text-xs text-text-muted mt-0.5">API do Ordinarium · v1</p>
					</div>
				</div>
				<p class="text-sm text-text-muted leading-relaxed max-w-2xl">
					A API do Ordinarium é uma interface REST pública e gratuita que expõe os dados litúrgicos
					do portal: paróquias registradas, horários de Missas, Confissões e Adorações. Todos os
					endpoints retornam <code
						class="font-mono text-[11px] bg-bg-card border border-border-dark rounded px-1.5 py-0.5 text-text-main"
						>JSON</code
					>.
				</p>
				<div
					class="bg-bg-card border border-border-dark rounded-xl p-4 flex flex-col gap-2 text-xs text-text-muted max-w-2xl"
				>
					<p class="font-bold text-text-main text-[11px] uppercase tracking-wider">Base URL</p>
					<code class="font-mono text-brand-gold text-sm">https://ordinarium.com.br</code>
				</div>
			</section>

			<!-- Auth Section -->
			<section id="auth" class="flex flex-col gap-5">
				<div class="flex items-center gap-3">
					<div
						class="h-9 w-9 rounded-xl bg-bg-card flex items-center justify-center border border-border-dark shrink-0"
					>
						<Shield class="h-4 w-4 text-text-muted" />
					</div>
					<div>
						<h2 class="text-xl font-bold text-text-main tracking-tight">Autenticação</h2>
						<p class="text-xs text-text-muted mt-0.5">Acesso público · sem chave</p>
					</div>
				</div>
				<p class="text-sm text-text-muted leading-relaxed max-w-2xl">
					Todos os endpoints são <strong class="text-text-main font-semibold">públicos</strong> e
					não requerem nenhuma chave de API ou cabeçalho de autorização. Basta realizar requisições
					HTTP
					<code
						class="font-mono text-[11px] bg-bg-card border border-border-dark rounded px-1.5 py-0.5 text-[#10b981]"
						>GET</code
					> diretamente.
				</p>
				<div
					class="bg-bg-card border border-[#10b981]/25 rounded-xl p-4 flex items-start gap-3 text-xs max-w-2xl"
				>
					<span class="text-[#10b981] text-base shrink-0 mt-0.5">✓</span>
					<p class="text-text-muted leading-relaxed">
						Nenhum cabeçalho especial necessário. CORS habilitado para todos os domínios.
					</p>
				</div>
			</section>

			<!-- Endpoint 1: Churches -->
			<section id="churches" class="flex flex-col gap-5">
				<div class="flex items-center gap-3">
					<span
						class="text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 shrink-0"
						>GET</span
					>
					<h2 class="text-xl font-bold text-text-main font-mono tracking-tight">/api/churches</h2>
				</div>

				<p class="text-sm text-text-muted leading-relaxed max-w-2xl">
					Retorna todas as paróquias registradas no banco de dados do Ordinarium, incluindo
					endereço, dados de contato, coordenadas geográficas e a grade geral de horários.
				</p>

				<!-- Response card -->
				<div
					class="bg-bg-card border border-border-dark shadow-lg rounded-2xl overflow-hidden max-w-3xl"
				>
					<div class="flex items-center justify-between px-5 py-3 border-b border-border-dark/60">
						<div class="flex items-center gap-2">
							<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted/60"
								>Resposta de Exemplo</span
							>
							<span
								class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg-dark border border-border-dark text-text-muted"
								>200 OK</span
							>
						</div>
						<div class="flex items-center gap-2">
							<a
								href="/api/churches"
								target="_blank"
								class="text-[11px] font-semibold text-brand-gold hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
							>
								<span>Testar</span>
								<ExternalLink size={11} />
							</a>
							<button
								onclick={() => handleCopyUrl('/api/churches', 'churches_url')}
								class="p-1 text-text-muted hover:text-text-main cursor-pointer transition-colors"
								title="Copiar URL"
							>
								{#if copiedEndpoint === 'churches_url'}
									<Check size={13} class="text-[#10b981]" />
								{:else}
									<Copy size={13} />
								{/if}
							</button>
						</div>
					</div>
					<div
						class="relative p-5 text-[11px] font-mono text-left text-[#f3f4f6] max-h-72 overflow-y-auto leading-relaxed bg-bg-dark/85"
					>
						<button
							onclick={() => handleCopy(codeExamples.churches, 'churches')}
							class="absolute top-3 right-3 p-1.5 rounded bg-bg-card hover:bg-bg-card/90 border border-border-dark hover:border-brand-gold/30 text-text-muted hover:text-text-main cursor-pointer transition-all"
							title="Copiar Payload"
						>
							{#if copiedEndpoint === 'churches'}
								<Check size={12} class="text-[#10b981]" />
							{:else}
								<Copy size={12} />
							{/if}
						</button>
						<pre>{codeExamples.churches}</pre>
					</div>
				</div>
			</section>

			<!-- Endpoint 2: Schedules -->
			<section id="schedules" class="flex flex-col gap-5 pb-16">
				<div class="flex items-center gap-3">
					<span
						class="text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 shrink-0"
						>GET</span
					>
					<h2 class="text-xl font-bold text-text-main font-mono tracking-tight">/api/schedules</h2>
				</div>

				<p class="text-sm text-text-muted leading-relaxed max-w-2xl">
					Retorna uma lista plana e ordenada com todos os eventos litúrgicos (Missas, Confissões,
					Adorações) agendados pelas igrejas, detalhando dia da semana, strings legíveis, ID da
					igreja e notas adicionais de curadoria.
				</p>

				<!-- Response card -->
				<div
					class="bg-bg-card border border-border-dark shadow-lg rounded-2xl overflow-hidden max-w-3xl"
				>
					<div class="flex items-center justify-between px-5 py-3 border-b border-border-dark/60">
						<div class="flex items-center gap-2">
							<span class="text-[10px] font-bold uppercase tracking-wider text-text-muted/60"
								>Resposta de Exemplo</span
							>
							<span
								class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-bg-dark border border-border-dark text-text-muted"
								>200 OK</span
							>
						</div>
						<div class="flex items-center gap-2">
							<a
								href="/api/schedules"
								target="_blank"
								class="text-[11px] font-semibold text-brand-gold hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
							>
								<span>Testar</span>
								<ExternalLink size={11} />
							</a>
							<button
								onclick={() => handleCopyUrl('/api/schedules', 'schedules_url')}
								class="p-1 text-text-muted hover:text-text-main cursor-pointer transition-colors"
								title="Copiar URL"
							>
								{#if copiedEndpoint === 'schedules_url'}
									<Check size={13} class="text-[#10b981]" />
								{:else}
									<Copy size={13} />
								{/if}
							</button>
						</div>
					</div>
					<div
						class="relative p-5 text-[11px] font-mono text-left text-[#f3f4f6] max-h-72 overflow-y-auto leading-relaxed bg-bg-dark/85"
					>
						<button
							onclick={() => handleCopy(codeExamples.schedules, 'schedules')}
							class="absolute top-3 right-3 p-1.5 rounded bg-bg-card hover:bg-bg-card/90 border border-border-dark hover:border-brand-gold/30 text-text-muted hover:text-text-main cursor-pointer transition-all"
							title="Copiar Payload"
						>
							{#if copiedEndpoint === 'schedules'}
								<Check size={12} class="text-[#10b981]" />
							{:else}
								<Copy size={12} />
							{/if}
						</button>
						<pre>{codeExamples.schedules}</pre>
					</div>
				</div>
			</section>
		</main>
	</div>
</div>
