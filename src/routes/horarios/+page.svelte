<script lang="ts">
	import { getContext } from 'svelte';
	import { BookOpen, Heart, Flame } from '@lucide/svelte';
	import SchedulesView from '$lib/components/SchedulesView.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import liturgicalLaudes from '$lib/assets/liturgical_laudes.png';
	import liturgicalVesperas from '$lib/assets/liturgical_vesperas.png';
	import liturgicalCompletas from '$lib/assets/liturgical_completas.png';

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

	// Svelte 5 props to receive layout data (churches, schedules)
	let { data } = $props<{
		data: {
			churches: Church[];
			schedules: Schedule[];
		};
	}>();

	const churches = $derived(data.churches);
	const schedules = $derived(data.schedules);

	// Get shared navigation and selection state context
	const nav = getContext<{ activeRoute: string; selectedChurchId: string }>('navigation');

	// Helper for icons based on schedule type
	function getIcon(type: string) {
		switch (type) {
			case 'Missa': return BookOpen;
			case 'Confissão': return Heart;
			case 'Adoração': return Flame;
			default: return BookOpen;
		}
	}

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
</script>

<SEO 
	title="Horários de Missas, Confissões e Adorações"
	description="Consulte os horários de missas, confissões e adorações ao Santíssimo Sacramento em tempo real. Filtre por dia da semana, paróquia e encontre celebrações perto de você."
	keywords={['horário de missa', 'missa hoje', 'horários de missas', 'horário de confissão', 'adoração ao santíssimo', 'igreja católica', 'paróquias', 'celebrar']}
/>

<div class="flex flex-col h-full w-full bg-transparent text-text-main transition-colors duration-200 relative overflow-hidden min-h-0">
	<SchedulesView 
		{churches} 
		{schedules} 
		bind:selectedChurchId={nav.selectedChurchId} 
		{getIcon} 
		{currentLiturgicalHour}
	/>
</div>
