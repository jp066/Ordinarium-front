<script lang="ts">
	import ApoiarView from '$lib/components/ApoiarView.svelte';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="Apoiar o Ordinarium"
	description="Ajude a manter o portal Ordinarium no ar. Faça uma contribuição financeira para cobrir custos com servidores, bancos de dados e APIs de mapa."
	keywords={[
		'apoiar',
		'doação',
		'doar pix',
		'doar cartão',
		'infraestrutura católica',
		'apoio financeiro',
		'ordinarium',
		'comunidade católica'
	]}
/>

<div
	class="flex flex-col h-full w-full bg-transparent text-text-main transition-colors duration-200 relative overflow-hidden min-h-0"
>
	<ApoiarView />
</div>
