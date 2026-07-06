<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import SEO from '$lib/components/SEO.svelte';
	import {
		Pencil,
		Settings,
		Sparkles,
		BookOpen,
		Flame,
		CheckSquare,
		Star,
		User,
		MoreVertical,
		ChevronLeft,
		Calendar,
		Heart,
		MapPin,
		FileText,
		Target
	} from '@lucide/svelte';

	// Receive layout data (user info)
	let { data } = $props<{
		data: {
			churches: any[];
			schedules: any[];
			user?: { name: string; avatar: string; email: string };
		};
	}>();

	// Navigation context
	const nav = getContext<{ activeRoute: string; selectedChurchId: string }>('navigation');

	// Active tab state
	let activeTab = $state<'favoritos' | 'pessoal'>('favoritos');

	// Mock favorites items
	const favoriteItems = [
		{
			id: 'f1',
			title: 'Paróquia de São José',
			description: 'Rua São José, 18 — Centro, São Paulo',
			type: 'CHURCH',
			icon: MapPin,
			iconColor: 'text-lit-ordinary',
			iconBg: 'bg-lit-ordinary/15',
			badge: 'Paróquia'
		},
		{
			id: 'f2',
			title: 'Oração de São Francisco',
			description: '"Senhor, fazei-me instrumento de Vossa paz..."',
			type: 'PRAYER',
			icon: Flame,
			iconColor: 'text-brand-gold',
			iconBg: 'bg-brand-gold/15',
			badge: 'Oração'
		},
		{
			id: 'f3',
			title: 'Jo 3, 16',
			description: '"Porque Deus amou o mundo de tal maneira..."',
			type: 'VERSE',
			icon: BookOpen,
			iconColor: 'text-lit-advent',
			iconBg: 'bg-lit-advent/15',
			badge: 'Versículo'
		},
		{
			id: 'f4',
			title: 'Santa Teresinha do Menino Jesus',
			description: 'Doutora da Igreja · Festa: 1 de outubro',
			type: 'SAINT',
			icon: Star,
			iconColor: 'text-brand-wine-text',
			iconBg: 'bg-brand-wine/15',
			badge: 'Santo'
		}
	];

	// Mock personal items (exames, planos, diário)
	const personalItems = [
		{
			id: 'pe1',
			title: 'Exame de Consciência',
			description: 'Reflexão noturna sobre o dia vivido',
			date: '4 Jul, 2026',
			icon: CheckSquare,
			iconColor: 'text-lit-advent',
			iconBg: 'bg-lit-advent/15',
			category: 'Exame'
		},
		{
			id: 'pe2',
			title: 'Plano de Vida Espiritual',
			description: 'Oração, leitura e caridade — rotina semanal',
			date: '1 Jul, 2026',
			icon: Target,
			iconColor: 'text-lit-ordinary',
			iconBg: 'bg-lit-ordinary/15',
			category: 'Plano'
		},
		{
			id: 'pe3',
			title: 'Diário — Consolação na adoração',
			description: 'O Senhor falou ao coração sobre confiar na Sua providência.',
			date: '2 Jul, 2026',
			icon: FileText,
			iconColor: 'text-brand-gold',
			iconBg: 'bg-brand-gold/15',
			category: 'Diário'
		},
		{
			id: 'pe4',
			title: 'Exame de Consciência',
			description: 'Dia difícil com distrações na oração. Desenvolver silêncio interior.',
			date: '3 Jul, 2026',
			icon: CheckSquare,
			iconColor: 'text-lit-advent',
			iconBg: 'bg-lit-advent/15',
			category: 'Exame'
		}
	];
</script>

<SEO
	title="Meu Perfil — Ordinarium"
	description="Visualize seu perfil espiritual, favoritos e dados pessoais no Ordinarium."
/>

<!-- Full-page container -->
<div class="flex flex-col w-full h-full min-h-0 overflow-y-auto bg-transparent relative pt-16 md:pt-0" id="profile-page">

	<!-- ╔══════════════════════════════════════════════════════════════╗ -->
	<!-- ║  BARRA DE NAVEGAÇÃO SUPERIOR (SEM CAPA)                      ║ -->
	<!-- ╚══════════════════════════════════════════════════════════════╝ -->
	<div class="relative z-10 flex items-center justify-between px-6 pt-5 md:pt-8 pb-4 max-w-7xl mx-auto w-full border-b border-border-dark/40 shrink-0">
		<button
			onclick={() => history.back()}
			class="p-2 rounded-xl bg-bg-card border border-border-dark/80 text-text-muted hover:text-text-main hover:bg-bg-card/80 active:scale-95 transition-all duration-200 cursor-pointer md:hidden"
			aria-label="Voltar"
		>
			<ChevronLeft size={18} />
		</button>

		<h2 class="text-base font-bold text-text-main tracking-wide">Meu Perfil</h2>

		<div class="flex items-center gap-2">
			<button
				class="p-2 rounded-xl bg-bg-card border border-border-dark/80 text-text-muted hover:text-text-main hover:bg-bg-card/80 active:scale-95 transition-all duration-200 cursor-pointer"
				aria-label="Editar perfil"
			>
				<Pencil size={16} />
			</button>
			<button
				class="p-2 rounded-xl bg-bg-card border border-border-dark/80 text-text-muted hover:text-text-main hover:bg-bg-card/80 active:scale-95 transition-all duration-200 cursor-pointer"
				aria-label="Configurações"
			>
				<Settings size={16} />
			</button>
		</div>
	</div>

	<!-- ╔══════════════════════════════════════════════════════════════╗ -->
	<!-- ║  CONTEÚDO PRINCIPAL DA PÁGINA                                ║ -->
	<!-- ╚══════════════════════════════════════════════════════════════╝ -->
	<div class="relative z-10 mx-0 flex-1 pb-8">
		<!-- Avatar + User Name/Status row -->
		<div class="max-w-7xl mx-auto px-6 pt-6 flex flex-col md:flex-row md:items-center gap-4 relative">
			<!-- Circular Avatar -->
			<div class="relative shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-brand-gold/30 bg-bg-card shadow-md">
				{#if data.user?.avatar}
					<img
						src={data.user.avatar}
						alt="{data.user?.name ?? 'Usuário'} avatar"
						class="w-full h-full object-cover"
					/>
				{:else}
					<div class="w-full h-full flex items-center justify-center bg-bg-card">
						<User size={40} class="text-text-muted/40" />
					</div>
				{/if}
			</div>

			<!-- User Info -->
			<div class="flex flex-col gap-1 pb-1 min-w-0">
				<h1 class="text-xl md:text-3xl font-bold text-text-main leading-tight font-sans">
					{data.user?.name ?? 'Usuário'}
				</h1>
			</div>
		</div>

		<!-- Main Split Layout Grid -->
		<div class="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
			<!-- Left column (Bio & Metadata) - 4 cols on desktop -->
			<div class="md:col-span-4 flex flex-col gap-6">
				<!-- Bio box -->
				<div class="p-6 rounded-2xl bg-bg-card border border-border-dark/80">
					<div class="flex flex-col gap-3.5">
						<div class="flex items-center justify-between text-xs">
							<span class="text-text-muted">E-mail</span>
							<span class="text-text-main font-semibold truncate max-w-[180px] md:max-w-[200px]" title={data.user?.email}>
								{data.user?.email ?? 'joao.pedro@ordinarium.org'}
							</span>
						</div>
						<div class="flex items-center justify-between text-xs">
							<span class="text-text-muted">Plano</span>
							<span class="text-brand-gold font-bold uppercase tracking-wider text-[10px]">Premium Mensal</span>
						</div>
						<div class="flex items-center justify-between text-xs">
							<span class="text-text-muted">Membro desde</span>
							<span class="text-text-main font-semibold">Julho de 2026</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Right column (Tabs and list grid) - 8 cols on desktop -->
			<div class="md:col-span-8 flex flex-col gap-6">
				<!-- Tab triggers -->
				<div class="flex items-center gap-2 bg-bg-card/50 border border-border-dark/40 p-1.5 rounded-full w-fit">
					<button
						onclick={() => (activeTab = 'favoritos')}
						class="px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer border {activeTab === 'favoritos'
							? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30 shadow-[0_0_12px_rgba(201,168,76,0.1)]'
							: 'bg-transparent text-text-muted border-transparent hover:text-text-main'}"
					>
						Favoritos
					</button>
					<button
						onclick={() => (activeTab = 'pessoal')}
						class="px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer border {activeTab === 'pessoal'
							? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30 shadow-[0_0_12px_rgba(201,168,76,0.1)]'
							: 'bg-transparent text-text-muted border-transparent hover:text-text-main'}"
					>
						Pessoal
					</button>
				</div>

				<!-- Tab contents -->
				{#if activeTab === 'favoritos'}
					<div in:fade={{ duration: 200 }} class="flex flex-col gap-4">
						<h3 class="text-sm font-bold text-text-main flex items-center gap-2">
							<Star size={14} class="text-brand-gold" />
							Itens salvos
						</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{#each favoriteItems as item (item.id)}
								<div
									class="flex items-center gap-3.5 p-4 rounded-2xl bg-bg-card border border-border-dark hover:border-brand-gold/20 hover:shadow-[0_4px_16px_rgba(201,168,76,0.03)] transition-all duration-200 group"
								>
									<div class="w-10 h-10 rounded-xl {item.iconBg} flex items-center justify-center shrink-0">
										<item.icon size={18} class={item.iconColor} />
									</div>
									<div class="flex-1 min-w-0">
										<span class="text-xs font-bold text-text-main truncate block">{item.title}</span>
										<p class="text-[11px] text-text-muted mt-0.5 truncate leading-snug">{item.description}</p>
									</div>
									<div class="flex items-center gap-2 shrink-0">
										<span class="text-[9px] font-bold text-text-muted/70 bg-bg-dark px-2 py-1 rounded-lg uppercase tracking-wide border border-border-dark/60">
											{item.badge}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div in:fade={{ duration: 200 }} class="flex flex-col gap-4">
						<h3 class="text-sm font-bold text-text-main flex items-center gap-2">
							<Calendar size={14} class="text-brand-gold" />
							Atividades recentes
						</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{#each personalItems as item (item.id)}
								<div
									class="flex items-center gap-3.5 p-4 rounded-2xl bg-bg-card border border-border-dark hover:border-brand-gold/20 hover:shadow-[0_4px_16px_rgba(201,168,76,0.03)] transition-all duration-200 group"
								>
									<div class="w-10 h-10 rounded-xl {item.iconBg} flex items-center justify-center shrink-0">
										<item.icon size={18} class={item.iconColor} />
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2">
											<span class="text-xs font-bold text-text-main truncate block">{item.title}</span>
											<span class="text-[9px] font-semibold text-text-muted/60 bg-bg-dark px-1.5 py-0.5 rounded-md shrink-0">
												{item.date}
											</span>
										</div>
										<p class="text-[11px] text-text-muted mt-0.5 truncate leading-snug">{item.description}</p>
									</div>
									<div class="flex items-center gap-2 shrink-0">
										<span class="text-[9px] font-bold text-brand-gold/70 bg-brand-gold/10 px-2 py-1 rounded-lg uppercase tracking-wide border border-brand-gold/15">
											{item.category}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
