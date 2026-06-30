<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { Clock, MapPin, Heart, BookOpen, MessageSquare, Sparkles } from '@lucide/svelte';
	import logo from '$lib/assets/logo-removebg.png';

	let { currentLiturgicalHour } = $props<{
		currentLiturgicalHour: { name: string; verse: string; imageUrl: string };
	}>();
</script>

<div
	class="flex-1 w-full min-h-0 overflow-y-auto flex flex-col justify-start items-center py-10 px-6 sm:px-12 gap-8 max-w-5xl mx-auto text-center"
>
	<!-- Hero Branding Section -->
	<div class="space-y-4 max-w-2xl select-none">
		<div class="flex justify-center mb-2 animate-pulse-slow">
			<img
				src={logo}
				alt="Emblema Ordinarium"
				class="h-20 w-20 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]"
			/>
		</div>
		<h2 class="text-4xl sm:text-5xl font-bold tracking-wider text-brand-gold font-gothic">
			Ordinarium
		</h2>
		<div
			class="h-[1px] w-24 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent mx-auto my-3"
		></div>
		<p class="text-sm text-text-muted leading-relaxed max-w-lg mx-auto font-sans">
			Encontre horários de Missas, Confissões e Adorações de forma simples, sem complicações.
		</p>
	</div>

	<!-- Quick Actions Bento Grid (4 cols on desktop, responsive bento grid on mobile) -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl mt-4 select-none">
		<!-- Action 1: Encontrar Horários -->
		<a
			href="/horarios"
			class="col-span-2 lg:col-span-2 flex flex-col items-center p-5 sm:p-6 bg-bg-card/60 hover:bg-bg-card border border-border-dark hover:border-brand-gold/30 rounded-2xl text-center group transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] cursor-pointer"
		>
			<div
				class="h-12 w-12 rounded-full bg-brand-gold-dim border border-brand-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
			>
				<Clock class="h-5 w-5 text-brand-gold" />
			</div>
			<h4
				class="text-sm sm:text-md font-bold text-text-main tracking-tight font-sans mb-1.5 group-hover:text-brand-gold transition-colors"
			>
				Horários Litúrgicos
			</h4>
			<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed font-sans">
				Busque horários de Missas, Confissões e Adorações em tempo real.
			</p>
		</a>

		<!-- Action 2: Explorar Paróquias -->
		<a
			href="/paroquias"
			class="col-span-1 lg:col-span-1 flex flex-col items-center p-4 sm:p-6 bg-bg-card/60 hover:bg-bg-card border border-border-dark hover:border-brand-gold/30 rounded-2xl text-center group transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] cursor-pointer"
		>
			<div
				class="h-12 w-12 rounded-full bg-brand-wine-dim border border-brand-wine/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
			>
				<MapPin class="h-5 w-5 text-brand-wine" />
			</div>
			<h4
				class="text-xs sm:text-md font-bold text-text-main tracking-tight font-sans mb-1.5 group-hover:text-brand-wine transition-colors"
			>
				Diretório de Paróquias
			</h4>
			<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed font-sans">
				Localize paróquias, contatos e mapas integrados.
			</p>
		</a>

		<!-- Action 3: Liturgia Diária -->
		<a
			href="/liturgia"
			class="col-span-1 lg:col-span-1 flex flex-col items-center p-4 sm:p-6 bg-bg-card/60 hover:bg-bg-card border border-border-dark hover:border-brand-gold/30 rounded-2xl text-center group transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] cursor-pointer"
		>
			<div
				class="h-12 w-12 rounded-full bg-brand-gold-dim border border-brand-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
			>
				<BookOpen class="h-5 w-5 text-brand-gold" />
			</div>
			<h4
				class="text-xs sm:text-md font-bold text-text-main tracking-tight font-sans mb-1.5 group-hover:text-brand-gold transition-colors"
			>
				Liturgia Diária
			</h4>
			<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed font-sans">
				Acompanhe as orações e leituras diárias da Santa Missa.
			</p>
		</a>

		<!-- Action 4: Orações e Devoções -->
		<a
			href="/oracoes"
			class="col-span-2 lg:col-span-2 flex flex-col items-center p-5 sm:p-6 bg-bg-card/60 hover:bg-bg-card border border-border-dark hover:border-brand-gold/30 rounded-2xl text-center group transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] cursor-pointer"
		>
			<div
				class="h-12 w-12 rounded-full bg-brand-gold-dim border border-brand-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
			>
				<Sparkles class="h-5 w-5 text-brand-gold" />
			</div>
			<h4
				class="text-sm sm:text-md font-bold text-text-main tracking-tight font-sans mb-1.5 group-hover:text-brand-gold transition-colors"
			>
				Orações e Devoções
			</h4>
			<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed font-sans">
				Acesse as orações tradicionais da Igreja e o exame de consciência.
			</p>
		</a>

		<!-- Action 5: Sugerir Alterações -->
		<a
			href="/sugerir"
			class="col-span-1 lg:col-span-1 flex flex-col items-center p-4 sm:p-6 bg-bg-card/60 hover:bg-bg-card border border-border-dark hover:border-brand-gold/30 rounded-2xl text-center group transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] cursor-pointer"
		>
			<div
				class="h-12 w-12 rounded-full bg-brand-wine-dim border border-brand-wine/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
			>
				<MessageSquare class="h-5 w-5 text-brand-wine" />
			</div>
			<h4
				class="text-xs sm:text-md font-bold text-text-main tracking-tight font-sans mb-1.5 group-hover:text-brand-wine transition-colors"
			>
				Sugerir Alterações
			</h4>
			<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed font-sans">
				Sugira novos horários, paróquias, correções ou fotos.
			</p>
		</a>

		<!-- Action 6: Apoiar o Projeto -->
		<a
			href="/apoiar"
			class="col-span-1 lg:col-span-1 flex flex-col items-center p-4 sm:p-6 bg-bg-card/60 hover:bg-bg-card border border-border-dark hover:border-brand-gold/30 rounded-2xl text-center group transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] cursor-pointer"
		>
			<div
				class="h-12 w-12 rounded-full bg-brand-gold-dim border border-brand-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
			>
				<Heart class="h-5 w-5 text-brand-gold" />
			</div>
			<h4
				class="text-xs sm:text-md font-bold text-text-main tracking-tight font-sans mb-1.5 group-hover:text-brand-gold transition-colors"
			>
				Apoiar o Projeto
			</h4>
			<p class="text-[10px] sm:text-xs text-text-muted leading-relaxed font-sans">
				Ajude a manter os servidores e APIs do site funcionando.
			</p>
		</a>
	</div>
</div>
