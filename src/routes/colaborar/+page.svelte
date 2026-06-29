<script lang="ts">
	import ColaborarView from '$lib/components/ColaborarView.svelte';
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO 
	title="Apoie e Colabore"
	description="Faça parte do Ordinarium e colabore voluntariamente enviando fotos, atualizando horários de missas, confissões e sacramentos de suas paróquias locais."
	keywords={['colaborar', 'voluntariado católico', 'atualizar horários de missas', 'paróquias católicas', 'ordinarium', 'comunidade católica']}
/>

<div class="flex flex-col h-full w-full bg-transparent text-text-main transition-colors duration-200 relative overflow-hidden min-h-0">
	<ColaborarView />
</div>
