<script lang="ts">
	import HomeView from '$lib/components/HomeView.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import liturgicalLaudes from '$lib/assets/liturgical_laudes.png';
	import liturgicalVesperas from '$lib/assets/liturgical_vesperas.png';
	import liturgicalCompletas from '$lib/assets/liturgical_completas.png';

	// Derive liturgical hour state and illustration URLs based on local time
	let currentLiturgicalHour = $derived.by(() => {
		const hour = new Date().getHours();
		if (hour >= 6 && hour < 12) {
			return {
				name: 'Laudes (Manhã)',
				verse: '“Ao romper da alva, ó Deus, a Vós clamo; a minha alma tem sede de Vós.”',
				imageUrl: liturgicalLaudes
			};
		} else if (hour >= 12 && hour < 18) {
			return {
				name: 'Vésperas (Tarde)',
				verse: '“Suba a minha oração como incenso na vossa presença; a elevação das minhas mãos como sacrifício vespertino.”',
				imageUrl: liturgicalVesperas
			};
		} else {
			return {
				name: 'Completas (Noite)',
				verse: '“Protegei-nos, Senhor, enquanto velamos; guardai-nos enquanto dormimos.”',
				imageUrl: liturgicalCompletas
			};
		}
	});

	// Home page JSON-LD Schema
	const homeSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "Ordinarium",
		"alternateName": "Ordinário Católico",
		"url": "https://ordinarium.org",
		"description": "Acompanhe horários de missas, confissões, adorações e liturgia diária de forma simples e em tempo real.",
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://ordinarium.org/paroquias?search={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	};
</script>

<SEO 
	description="Portal Ordinarium - Encontre horários de missas, adoração ao Santíssimo Sacramento, confissões e a Liturgia Diária de paróquias católicas em tempo real."
	schema={homeSchema}
/>

<div class="flex flex-col h-screen w-screen bg-bg-dark text-text-main transition-colors duration-200 relative overflow-hidden">
	<!-- Animated Background Texture (Giphy) -->
	<div class="absolute inset-0 z-0 pointer-events-none select-none opacity-[0.08] overflow-hidden">
		<img 
			src="/bg_texture.gif" 
			alt="" 
			class="w-full h-full object-cover"
		/>
	</div>

	<!-- Portal content wrapper -->
	<div class="relative z-10 flex-1 flex flex-col justify-between items-center py-6 min-h-0">
		<!-- Spacer -->
		<div></div>

		<!-- Main portal view -->
		<div class="w-full min-h-0 overflow-y-auto flex flex-col justify-start items-center">
			<HomeView {currentLiturgicalHour} />
		</div>

		<!-- Footer with API link -->
		<footer class="w-full hidden sm:flex flex-col items-center gap-1.5 py-3 select-none">
			<a 
				href="/api" 
				class="text-[11px] font-bold text-text-muted/60 hover:text-brand-gold transition-colors duration-200 cursor-pointer tracking-widest uppercase font-sans hover:underline decoration-brand-gold/30 underline-offset-4"
			>
				Documentação da API
			</a>
		</footer>
	</div>
</div>
