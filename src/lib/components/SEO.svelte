<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		title?: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'profile';
		keywords?: string[];
		schema?: Record<string, any> | null;
	}

	let {
		title = '',
		description = 'Acompanhe horários de missas, confissões, adorações e eventos das paróquias católicas de forma simples, confiável e em tempo real.',
		image = '/image.png',
		type = 'website',
		keywords = [
			'ordinarium',
			'horário de missa',
			'liturgia diária',
			'igreja católica',
			'paróquias',
			'missas em teresina',
			'missa hoje',
			'liturgia hoje',
			'admoestações',
			'horas litúrgicas',
			'santo do dia'
		],
		schema = null
	}: Props = $props();

	// Construct absolute URLs using the page store
	let canonicalUrl = $derived($page.url.href);
	let origin = $derived($page.url.origin);

	let absoluteImageUrl = $derived(image.startsWith('http') ? image : `${origin}${image}`);

	let displayTitle = $derived(
		title ? `${title} | Ordinarium` : 'Ordinarium | Horários de Missas, Liturgia Diária e Paróquias'
	);

	// Safe serialization of JSON-LD schema
	let schemaString = $derived(schema ? JSON.stringify(schema, null, 2) : '');
</script>

<svelte:head>
	<!-- Standard Meta Tags -->
	<title>{displayTitle}</title>
	<meta name="description" content={description} />
	{#if keywords && keywords.length > 0}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}
	<link rel="canonical" href={canonicalUrl} />
	<meta name="robots" content="index, follow" />

	<!-- Open Graph / Facebook -->
	<meta property="og:site_name" content="Ordinarium" />
	<meta property="og:title" content={title || 'Ordinarium'} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={absoluteImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="pt_BR" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title || 'Ordinarium'} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absoluteImageUrl} />

	<!-- JSON-LD Structured Data -->
	{#if schemaString}
		{@html `<script type="application/ld+json">${schemaString}</script>`}
	{/if}
</svelte:head>
