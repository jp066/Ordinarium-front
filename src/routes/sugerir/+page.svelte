<script lang="ts">
	import SugerirView from '$lib/components/SugerirView.svelte';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="Sugerir Alterações"
	description="Envie novas paróquias, correções, fotos ou atualize horários de missas e celebrações para a curadoria do Ordinarium."
	keywords={[
		'sugerir alterações',
		'sugerir paróquia',
		'atualizar missas',
		'correção de dados',
		'ordinarium',
		'comunidade católica'
	]}
/>

<div
	class="flex flex-col h-full w-full bg-transparent text-text-main transition-colors duration-200 relative overflow-hidden min-h-0"
>
	<SugerirView />
</div>
