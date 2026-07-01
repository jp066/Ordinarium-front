<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import HomeView from '$lib/components/HomeView.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import liturgicalLaudes from '$lib/assets/liturgical_laudes.png';
	import liturgicalVesperas from '$lib/assets/liturgical_vesperas.png';
	import liturgicalCompletas from '$lib/assets/liturgical_completas.png';

	// Receive data loaded by the universal load function (+page.ts)
	let { data } = $props<{
		data: {
			churches: any[];
			schedules: any[];
			liturgiaData: any;
		};
	}>();

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
				verse:
					'“Suba a minha oração como incenso na vossa presença; a elevação das minhas mãos como sacrifício vespertino.”',
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
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Ordinarium',
		alternateName: 'Ordinário Católico',
		url: 'https://ordinarium.org',
		description:
			'Acompanhe horários de missas, confissões, adorações e liturgia diária de forma simples e em tempo real.',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://ordinarium.org/paroquias?search={search_term_string}',
			'query-input': 'required name=search_term_string'
		}
	};
</script>

<SEO
	description="Portal Ordinarium - Encontre horários de missas, adoração ao Santíssimo Sacramento, confissões e a Liturgia Diária de paróquias católicas em tempo real."
	schema={homeSchema}
/>

<!-- Main dashboard view, scrollable within the layout wrapper -->
<div class="flex-1 w-full min-h-0 overflow-y-auto bg-transparent text-text-main">
	<HomeView
		{currentLiturgicalHour}
		churches={data.churches}
		schedules={data.schedules}
		liturgiaData={data.liturgiaData}
	/>
</div>
