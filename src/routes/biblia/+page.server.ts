import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const baseUrl = env.PRAYERS_API_URL || 'https://ordinarium-prayers.onrender.com/api/v1';

	const bookParam = url.searchParams.get('livro') || 'mt';
	const chapterParam = parseInt(url.searchParams.get('capitulo') || '1', 10);
	const searchParam = url.searchParams.get('busca') || '';

	try {
		// Sempre carregar a lista de livros para renderizar o menu lateral de seleção
		const booksRes = await fetch(`${baseUrl}/bible/books`);
		if (!booksRes.ok) {
			return {
				success: false,
				error: `Falha ao carregar a lista de livros (${booksRes.status}).`
			};
		}
		const books = await booksRes.json();

		let currentChapter = null;
		let searchResults = null;
		let selectedBookInfo = null;

		if (searchParam && searchParam.trim().length >= 3) {
			const searchRes = await fetch(`${baseUrl}/bible/search?q=${encodeURIComponent(searchParam)}`);
			if (searchRes.ok) {
				searchResults = await searchRes.json();
			}
		} else {
			// Buscar o capítulo específico e as informações do livro atual
			const [chapterRes, bookInfoRes] = await Promise.all([
				fetch(`${baseUrl}/bible/${bookParam}/${chapterParam}`),
				fetch(`${baseUrl}/bible/books/${bookParam}`).catch(() => null)
			]);

			if (chapterRes.ok) {
				currentChapter = await chapterRes.json();
			}
			if (bookInfoRes && bookInfoRes.ok) {
				selectedBookInfo = await bookInfoRes.json();
			}
		}

		return {
			success: true,
			books,
			currentBook: bookParam,
			currentChapterNum: chapterParam,
			currentChapter,
			selectedBookInfo,
			searchParam,
			searchResults
		};
	} catch (err) {
		console.error('Erro ao conectar com a API de Bíblia:', err);
		return {
			success: false,
			error:
				'Não foi possível conectar com o servidor da Bíblia. Verifique se o backend está rodando.'
		};
	}
};
