<script lang="ts">
	import { getContext } from 'svelte';
	import { BookOpen, Heart, Flame } from '@lucide/svelte';
	import ChurchesView from '$lib/components/ChurchesView.svelte';
	import SEO from '$lib/components/SEO.svelte';

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
			case 'Missa':
				return BookOpen;
			case 'Confissão':
				return Heart;
			case 'Adoração':
				return Flame;
			default:
				return BookOpen;
		}
	}

	// Structured Data Schema for Localized Parishes
	let paroquiasSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		numberOfItems: churches.length,
		itemListElement: churches.map((church: Church, idx: number) => ({
			'@type': 'ListItem',
			position: idx + 1,
			item: {
				'@type': 'Place',
				name: church.name,
				address: {
					'@type': 'PostalAddress',
					streetAddress: church.address,
					addressLocality: 'Teresina',
					addressRegion: 'PI',
					addressCountry: 'BR'
				},
				geo: {
					'@type': 'GeoCoordinates',
					latitude: church.lat,
					longitude: church.lng
				},
				telephone: church.phone
			}
		}))
	});
</script>

<SEO
	title="Mapa de Paróquias e Localidades"
	description="Encontre paróquias católicas próximas a você em Teresina e região. Acesse localizações no mapa, contatos e o recurso de Paróquia Mais Perto via GPS."
	keywords={[
		'paróquias',
		'igreja católica',
		'igrejas católicas',
		'mapa de paróquias',
		'teresina',
		'paróquia mais próxima',
		'localização',
		'gps'
	]}
	schema={paroquiasSchema}
/>

<div
	class="flex flex-col h-full w-full bg-transparent text-text-main transition-colors duration-200 relative overflow-hidden min-h-0"
>
	<ChurchesView {churches} {schedules} bind:selectedChurchId={nav.selectedChurchId} {getIcon} />
</div>

<style>
	/* Leaflet Pin marker custom classes (retained globally for Leaflet maps) */
	:global(.custom-leaflet-marker) {
		background: transparent !important;
		border: none !important;
	}
</style>
